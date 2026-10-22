import { describe, expect, test } from "vitest";
import { nextCandidate } from "./Solver";
import { blankHistory, paintRow, solveForDisplay, typeText } from "./play";
import { charStateFive, stringFive, wordResult } from "./types";

function guess(word: string, colors: string): wordResult {
  return {
    word: word.toUpperCase().split("") as stringFive,
    result: colors.split("") as charStateFive,
  };
}

/** Taps from an unset tile: gray = 1, yellow = 2, green = 3. */
function play(rows: Array<{ word: string; taps: number[] }>) {
  return rows.reduce(
    (board, row, index) => paintRow(typeText(board, row.word), index, row.taps),
    blankHistory()
  );
}

describe("APPLE then IRATE through the board controls", () => {
  const finished = play([
    { word: "apple", taps: [1, 1, 1, 1, 2] },
    { word: "irate", taps: [1, 2, 1, 2, 2] },
  ]);

  test("the finished NYT colors stay 29 answers, suggestion OUTER", () => {
    const view = solveForDisplay(finished);
    expect(finished[0].word.join("")).toBe("APPLE");
    expect(finished[0].result.join("")).toBe("aaaay");
    expect(finished[1].word.join("")).toBe("IRATE");
    expect(finished[1].result.join("")).toBe("ayayy");
    expect(view.answers).toHaveLength(29);
    expect(view.suggestion).toBe("outer");
    expect(view.note).toBeNull();
    expect(view.answers).toEqual(
      nextCandidate([guess("APPLE", "aaaay"), guess("IRATE", "ayayy")]).answers
    );
  });

  test("painting the second word all gray does not blank the list", () => {
    const grayPass = play([
      { word: "apple", taps: [1, 1, 1, 1, 2] },
      { word: "irate", taps: [1, 1, 1, 1, 1] },
    ]);
    expect(grayPass[1].result.join("")).toBe("aaaaa");
    expect(nextCandidate(grayPass).answers).toHaveLength(0);

    const view = solveForDisplay(grayPass);
    const appleOnly = nextCandidate([guess("APPLE", "aaaay")]);
    expect(view.answers).toEqual(appleOnly.answers);
    expect(view.answers.length).toBeGreaterThan(0);
    expect(view.note).toMatch(/Row 2/);
    expect(view.note).toMatch(/E/);
  });

  test("uppercase and lowercase typing fill the same tiles", () => {
    const lower = typeText(blankHistory(), "apple");
    const upper = typeText(blankHistory(), "APPLE");
    expect(lower[0].word.join("")).toBe("APPLE");
    expect(upper[0].word).toEqual(lower[0].word);
    expect(lower[0].result.join("")).toBe("uuuuu");
  });
});
