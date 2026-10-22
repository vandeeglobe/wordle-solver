export type TTuple<N extends number, T> = N extends 0
  ? T
  : T extends { length: N }
  ? T
  : T extends unknown[]
  ? TTuple<N, [T[0], ...T]>
  : TTuple<N, [T]>;

// u -> color not set yet
// a -> gray / absent
// g -> green
// y -> yellow

export type charState = "u" | "a" | "g" | "y";

export type CharResult = {
  char: string;
  result: charState;
};

export type stringFive = TTuple<5, string>;
export type charStateFive = [
  charState,
  charState,
  charState,
  charState,
  charState
];
export type wordResult = {
  word: stringFive;
  result: charStateFive;
};
export type input_history = wordResult[];
export type gameState = {
  history: input_history;
  /** Recommended next guess, chosen from the remaining answers. */
  suggestion: string;
  /** Answer words still consistent with fully colored rows. */
  answers: string[];
  /** Set when a colored row was left out because it contradicts another row. */
  note: string | null;
};
