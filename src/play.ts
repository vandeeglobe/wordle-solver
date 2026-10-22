import { isGradedRow, nextCandidate } from "./Solver";
import {
  charState,
  charStateFive,
  gameState,
  input_history,
  stringFive,
  wordResult,
} from "./types";

export const COLOR_ORDER: charState[] = ["u", "a", "y", "g"];

export function blankRow(): wordResult {
  return {
    word: Array(5).fill("") as stringFive,
    result: Array(5).fill("u") as charStateFive,
  };
}

export function blankHistory(): input_history {
  return Array.from({ length: 6 }, blankRow);
}

export function stepColor(current: charState, direction: 1 | -1): charState {
  const index = COLOR_ORDER.indexOf(current);
  const next = (index + direction + COLOR_ORDER.length) % COLOR_ORDER.length;
  return COLOR_ORDER[next];
}

function copyHistory(history: input_history): input_history {
  return history.map((line) => ({
    word: [...line.word] as stringFive,
    result: [...line.result] as charStateFive,
  }));
}

/** Same letter entry the on-screen keyboard and physical keys use. */
export function typeInto(history: input_history, key: string): input_history {
  const isLetter = /^[a-zA-Z]$/.test(key);
  if (!isLetter && key !== "Backspace") return history;
  const letters = history.flatMap((line) => line.word);
  const emptyAt = letters.findIndex((letter) => letter === "");
  const lastIndex = emptyAt >= 0 ? emptyAt : letters.length;
  const next = copyHistory(history);

  if (key === "Backspace") {
    if (lastIndex === 0) return history;
    const row = Math.floor((lastIndex - 1) / 5);
    const col = (lastIndex - 1) % 5;
    next[row].word[col] = "";
    next[row].result[col] = "u";
    return next;
  }
  if (lastIndex === letters.length) return history;
  const row = Math.floor(lastIndex / 5);
  const col = lastIndex % 5;
  next[row].word[col] = key.toUpperCase();
  next[row].result[col] = "u";
  return next;
}

export function typeText(history: input_history, text: string): input_history {
  return text.split("").reduce((board, key) => typeInto(board, key), history);
}

/** One tap, Enter, or ArrowDown moves unset → gray → yellow → green. */
export function cycleTile(
  history: input_history,
  row: number,
  col: number,
  direction: 1 | -1
): input_history {
  if (history[row].word[col] === "") return history;
  const next = copyHistory(history);
  next[row].result[col] = stepColor(history[row].result[col], direction);
  return next;
}

export function paintRow(
  history: input_history,
  row: number,
  taps: readonly number[]
): input_history {
  let next = history;
  taps.forEach((count, col) => {
    for (let step = 0; step < count; step += 1) {
      next = cycleTile(next, row, col, 1);
    }
  });
  return next;
}

function ungrade(row: wordResult): wordResult {
  return {
    word: [...row.word] as stringFive,
    result: ["u", "u", "u", "u", "u"],
  };
}

function positiveLetters(history: input_history): Set<string> {
  const found = new Set<string>();
  for (const row of history) {
    if (!isGradedRow(row)) continue;
    row.word.forEach((letter, index) => {
      const color = row.result[index];
      if (color === "y" || color === "g") found.add(letter.toUpperCase());
    });
  }
  return found;
}

function contradictoryGrays(row: wordResult, positive: Set<string>): string[] {
  const letters: string[] = [];
  row.word.forEach((letter, index) => {
    const upper = letter.toUpperCase();
    if (row.result[index] !== "a" || !positive.has(upper) || letters.includes(upper)) return;
    const kept = row.result.some(
      (color, other) =>
        row.word[other].toUpperCase() === upper && (color === "y" || color === "g")
    );
    if (!kept) letters.push(upper);
  });
  return letters;
}

function rowNote(history: input_history, dropped: number): string {
  const positive = positiveLetters(history.filter((_, index) => index !== dropped));
  const letters = contradictoryGrays(history[dropped], positive);
  const rowLabel = `Row ${dropped + 1}`;
  if (letters.length === 0) {
    return `${rowLabel} removes every remaining answer, so it is not counted. Check its colors.`;
  }
  const list = letters.join(", ");
  return `${rowLabel} marks ${list} gray, but another row says ${list} is in the word. This row is not counted until those colors agree.`;
}

/**
 * Fully colored rows are sent to the solver. A row that contradicts an earlier
 * color and wipes out every answer is left out, and `note` says why. Painting
 * a later word all gray while an earlier yellow still stands is that case.
 */
export function solveForDisplay(history: input_history): gameState {
  const solved = nextCandidate(history);
  if (solved.answers.length > 0) {
    return { history, suggestion: solved.suggestion, answers: solved.answers, note: null };
  }

  const graded = history
    .map((row, index) => (isGradedRow(row) ? index : -1))
    .filter((index) => index >= 0);

  for (let cursor = graded.length - 1; cursor >= 0; cursor -= 1) {
    const dropped = graded[cursor];
    const trial = history.map((row, index) => (index === dropped ? ungrade(row) : row));
    const alt = nextCandidate(trial);
    if (alt.answers.length > 0) {
      return {
        history,
        suggestion: alt.suggestion,
        answers: alt.answers,
        note: rowNote(history, dropped),
      };
    }
  }

  return {
    history,
    suggestion: solved.suggestion,
    answers: solved.answers,
    note: "No answer fits these colors. Check the row.",
  };
}
