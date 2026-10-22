import { charState, input_history, wordResult } from "./types";
import { La, Ta } from "./Words";

/** Possible answers, in list order. Suggestions are chosen from this set. */
const ANSWERS: readonly string[] = La;

/** Every guess Wordle will accept, including answers. */
const ALLOWED: readonly string[] = [...La, ...Ta];

export type SolverResult = {
  /** Answer words still consistent with fully colored rows. */
  answers: string[];
  /** Next guess. Always one of `answers` when any remain. */
  suggestion: string;
};

function isColored(color: charState): boolean {
  return color === "a" || color === "y" || color === "g";
}

function uniqueLetters(word: string): string[] {
  const seen: Record<string, true> = {};
  const letters: string[] = [];
  for (let index = 0; index < word.length; index += 1) {
    const letter = word[index];
    if (seen[letter]) continue;
    seen[letter] = true;
    letters.push(letter);
  }
  return letters;
}

type Constraints = {
  must: Array<string | null>;
  notAt: Array<Set<string>>;
  min: Map<string, number>;
  max: Map<string, number>;
};

function emptyConstraints(): Constraints {
  return {
    must: [null, null, null, null, null],
    notAt: Array.from({ length: 5 }, () => new Set<string>()),
    min: new Map(),
    max: new Map(),
  };
}

/** A row counts only after all five letters have a color. Unset tiles do not. */
export function isGradedRow(row: wordResult): boolean {
  if (row.word.some((letter) => letter === "")) return false;
  return row.result.every((color) => isColored(color));
}

function addGuess(constraints: Constraints, row: wordResult): void {
  const word = row.word.map((letter) => letter.toLowerCase());
  const present = new Map<string, number>();
  const absent = new Set<string>();

  for (let index = 0; index < 5; index += 1) {
    const letter = word[index];
    const color = row.result[index];
    if (color === "g") {
      constraints.must[index] = letter;
      present.set(letter, (present.get(letter) ?? 0) + 1);
    } else if (color === "y") {
      constraints.notAt[index].add(letter);
      present.set(letter, (present.get(letter) ?? 0) + 1);
    } else if (color === "a") {
      constraints.notAt[index].add(letter);
      absent.add(letter);
    }
  }

  present.forEach((count, letter) => {
    constraints.min.set(letter, Math.max(constraints.min.get(letter) ?? 0, count));
  });

  absent.forEach((letter) => {
    // A gray tile means this occurrence is not in the word. If the same
    // letter is also yellow or green, the word has exactly that many.
    const cap = present.get(letter) ?? 0;
    const previous = constraints.max.get(letter);
    constraints.max.set(
      letter,
      previous === undefined ? cap : Math.min(previous, cap)
    );
  });
}

function matches(word: string, constraints: Constraints): boolean {
  const seen = new Map<string, number>();
  for (let index = 0; index < 5; index += 1) {
    const letter = word[index];
    if (constraints.must[index] && letter !== constraints.must[index]) return false;
    if (constraints.notAt[index].has(letter)) return false;
    seen.set(letter, (seen.get(letter) ?? 0) + 1);
  }
  let fits = true;
  constraints.min.forEach((min, letter) => {
    if ((seen.get(letter) ?? 0) < min) fits = false;
  });
  constraints.max.forEach((max, letter) => {
    if ((seen.get(letter) ?? 0) > max) fits = false;
  });
  return fits;
}

function constraintsFrom(history: input_history): Constraints {
  const constraints = emptyConstraints();
  for (const row of history) {
    if (isGradedRow(row)) addGuess(constraints, row);
  }
  return constraints;
}

/**
 * Pick the remaining answer that covers the most common leftover letters.
 * Repeated letters count once. Ties break alphabetically so the result is stable.
 */
function recommend(answers: string[], guessed: ReadonlySet<string>): string {
  const fresh = answers.filter((word) => !guessed.has(word));
  const pool = fresh.length > 0 ? fresh : answers;
  if (pool.length === 0) return "";
  if (pool.length === 1) return pool[0];

  const frequency = new Map<string, number>();
  for (const word of answers) {
    for (const letter of uniqueLetters(word)) {
      frequency.set(letter, (frequency.get(letter) ?? 0) + 1);
    }
  }

  let best = pool[0];
  let bestScore = -1;
  for (const word of pool) {
    let score = 0;
    for (const letter of uniqueLetters(word)) {
      score += frequency.get(letter) ?? 0;
    }
    if (score > bestScore || (score === bestScore && word < best)) {
      best = word;
      bestScore = score;
    }
  }
  return best;
}

export function nextCandidate(history: input_history): SolverResult {
  const constraints = constraintsFrom(history);
  const answers = ANSWERS.filter((word) => matches(word, constraints)).sort();
  const guessed = new Set<string>();
  for (const row of history) {
    if (isGradedRow(row)) guessed.add(row.word.join("").toLowerCase());
  }
  return {
    answers,
    suggestion: recommend(answers, guessed),
  };
}

/** Used by tests to confirm the allowed list still contains every answer. */
export function allowedGuessCount(): number {
  return new Set(ALLOWED).size;
}
