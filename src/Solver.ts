import { input_history, wordResult, charState } from "./types";
import { La, Ta } from "./Words";

export type eachCharCond = {
  exclude: Set<string>;
  decide: string;
};

export type subCategory = Record<charState, number[]>;

const candidate: string[] = Ta.concat(La);

function calcCondition(
  results: wordResult[]
): [Set<string>, Set<string>, eachCharCond[]] {
  //選択肢
  let includeChar: Set<string> = new Set();
  let excludeChar: Set<string> = new Set();
  let excludeChar_each: eachCharCond[] = (() => {
    let arr = [];
    for (let i = 0; i < 5; i++) {
      arr.push({
        exclude: new Set<string>(),
        decide: "",
      });
    }
    return arr;
  })();

  results.forEach((d) => {
    let category: subCategory = {
      y: [],
      g: [],
      a: [],
    };
    d.result.forEach((cat: charState, index) => {
      category[cat].push(index);
    });

    //含まれるcharを計算(y,g)
    const newIncludes = category.y.concat(category.g);
    newIncludes.forEach((ni) => {
      const w = d.word[ni];
      includeChar.add(w);
    });

    //含まれないcharを計算(includeに含まれるものはincludeしない)
    category.a.forEach((ei) => {
      const w = d.word[ei];
      if (includeChar.has(w)) {
        return;
      }
      if (w === "") {
        return;
      }
      excludeChar.add(w);
    });

    //個別に含まれるcharを計算
    category.g.forEach((decided) => {
      const w = d.word[decided];
      excludeChar_each[decided].decide = w;
    });

    //個別のexcludeを計算
    category.y.concat(category.a).forEach((excluded) => {
      const w = d.word[excluded];
      if (w === "") {
        return;
      }
      excludeChar_each[excluded].exclude.add(w);
    });
  });
  return [includeChar, excludeChar, excludeChar_each];
}

/**
 *
 * @param includeChar
 * @param excludeChar
 * @param excludeChar_each
 * @returns 残りの候補をすべて出力する
 */
function calcCandidate(
  includeChar: Set<string>,
  excludeChar: Set<string>,
  excludeChar_each: eachCharCond[]
): [string[], RegExp] {
  const include = Array.from(includeChar)
    .map((d) => "(?=.*" + d + ")")
    .join("");
  const exclude = Array.from(excludeChar)
    .map((d) => "(?!.*" + d + ")")
    .join("");
  const charConditions = excludeChar_each
    .map((d) => {
      if (d.decide !== "") return d.decide;
      if (d.exclude.size === 0) return ".";
      return "[^" + Array.from(d.exclude).join("") + "]";
    })
    .join("");
  const pattern = RegExp("^" + include + exclude + charConditions + "$", "i");
  const cand = candidate.filter((d) => d.match(pattern));

  return [cand, pattern];
}

export type score = {
  word: string;
  score: number;
};

function reduceChar(
  remainCandi: string[],
  includeChar: Set<string>,
  excludeChar: Set<string>,
  excludeChar_each: eachCharCond[]
): score {
  let targetIndex: number[] = excludeChar_each
    .map((d, index) => {
      return d.decide === "" ? index : -1;
    })
    .filter((d) => d !== -1);

  let remains: Set<string> = new Set<string>();

  for (const word of remainCandi) {
    for (const i of targetIndex) {
      remains.add(word[i]);
    }
    if (remains.size === 24) break;
  }

  let cand: score = { word: "", score: -1 };
  for (const word of candidate) {
    let score = 0;
    const ws = word.split("");
    for (const w of ws) {
      if (remains.has(w)) score++;
    }
    if (score > cand.score) {
      cand.word = word;
      cand.score = score;
    }

    if (cand.score === 5) break;
    if (cand.score >= remains.size) break;
  }
  return cand;
}

export function nextCandidate(results: input_history): [string, string] {
  const [includeChar, excludeChar, excludeChar_each] = calcCondition(results);
  const [cand, pattern] = calcCandidate(
    includeChar,
    excludeChar,
    excludeChar_each
  );
  const reduceStrings = reduceChar(
    cand,
    includeChar,
    excludeChar,
    excludeChar_each
  );
  return [cand[0], reduceStrings.word];
}
