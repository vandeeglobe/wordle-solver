import { allowedGuessCount, isGradedRow, nextCandidate } from "./Solver";
import { charStateFive, stringFive, wordResult } from "./types";
import { La, Ta } from "./Words";

function guess(word: string, colors: string): wordResult {
  if (word.length !== 5 || colors.length !== 5) {
    throw new Error(`expected 5 letters, got ${word} / ${colors}`);
  }
  return {
    word: word.toUpperCase().split("") as stringFive,
    result: colors.split("") as charStateFive,
  };
}

/** Official Wordle coloring: greens first, then yellows for leftover letters. */
function colorize(guessWord: string, answer: string): string {
  const result = Array(5).fill("a");
  const remaining = answer.split("");
  for (let index = 0; index < 5; index += 1) {
    if (guessWord[index] === answer[index]) {
      result[index] = "g";
      remaining[index] = "";
    }
  }
  for (let index = 0; index < 5; index += 1) {
    if (result[index] === "g") continue;
    const found = remaining.indexOf(guessWord[index]);
    if (found >= 0) {
      result[index] = "y";
      remaining[found] = "";
    }
  }
  return result.join("");
}

describe("nextCandidate", () => {
  test("starts from every answer and suggests an answer, not an obscure guess", () => {
    const result = nextCandidate([]);
    expect(result.answers).toHaveLength(La.length);
    expect(result.answers.length).toBeGreaterThan(1);
    expect(La).toContain(result.suggestion);
    expect(result.suggestion).not.toBe("aahed");
    expect(result.answers.slice(0, 5)).toEqual([...result.answers].sort().slice(0, 5));
  });

  test("ignores letters until the whole row is colored", () => {
    const open = nextCandidate([]);
    expect(nextCandidate([guess("crane", "uuuuu")]).answers).toHaveLength(open.answers.length);
    expect(nextCandidate([guess("crane", "gaaau")]).answers).toHaveLength(open.answers.length);
    expect(isGradedRow(guess("crane", "uuuuu"))).toBe(false);
    expect(
      isGradedRow({
        word: ["C", "R", "", "", ""] as stringFive,
        result: ["u", "u", "u", "u", "u"],
      })
    ).toBe(false);
  });

  test("a fully gray guess removes those letters", () => {
    const result = nextCandidate([guess("crane", "aaaaa")]);
    expect(result.answers.length).toBeGreaterThan(1);
    expect(result.answers.length).toBeLessThan(La.length);
    expect(result.answers.every((word) => !/[crane]/.test(word))).toBe(true);
    expect(La).toContain(result.suggestion);
  });

  test("mixed duplicate colors keep one L and drop words with two", () => {
    const colors = colorize("alloy", "apple");
    expect(colors).toBe("gyaaa");
    const result = nextCandidate([guess("alloy", colors)]);
    expect(result.answers).toContain("apple");
    expect(result.answers).not.toContain("alloy");
    for (const word of result.answers) {
      expect(word[0]).toBe("a");
      expect(word.split("").filter((letter) => letter === "l")).toHaveLength(1);
      expect(word.includes("o")).toBe(false);
      expect(word.includes("y")).toBe(false);
      expect(word[1]).not.toBe("l");
      expect(word[2]).not.toBe("l");
    }
  });

  test("two yellows require two of that letter", () => {
    const result = nextCandidate([guess("llama", "yyaaa")]);
    expect(result.answers.length).toBeGreaterThan(0);
    expect(result.answers).toContain("belly");
    for (const word of result.answers) {
      expect(word.split("").filter((letter) => letter === "l").length).toBeGreaterThanOrEqual(2);
      expect(word.includes("a")).toBe(false);
      expect(word.includes("m")).toBe(false);
      expect(word[0]).not.toBe("l");
      expect(word[1]).not.toBe("l");
    }
  });

  test("an all-green row leaves that answer", () => {
    const result = nextCandidate([guess("apple", "ggggg")]);
    expect(result.answers).toEqual(["apple"]);
    expect(result.suggestion).toBe("apple");
  });

  test("does not suggest a guess that was already colored", () => {
    const first = nextCandidate([]);
    const played = nextCandidate([guess(first.suggestion, "aaaaa")]);
    expect(played.suggestion).not.toBe(first.suggestion);
    expect(played.answers).not.toContain(first.suggestion);
  });

  test("the official guess list contains every answer once", () => {
    expect(new Set(La).size).toBe(La.length);
    expect(new Set(Ta).size).toBe(Ta.length);
    expect(new Set([...La, ...Ta]).size).toBe(14855);
    expect(allowedGuessCount()).toBe(14855);
  });
});
