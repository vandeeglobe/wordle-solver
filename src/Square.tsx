import { CharResult, charState } from "./types";

const COLOR_CLASS: Record<charState, string> = {
  u: "border-gray-400 bg-black text-white",
  a: "border-gray-600 bg-gray-600 text-white",
  y: "border-yellow-400 bg-yellow-400 text-black",
  g: "border-green-600 bg-green-600 text-white",
};

const STATE_LABEL: Record<charState, string> = {
  u: "not set",
  a: "absent",
  y: "present",
  g: "correct",
};

export type SquareState = {
  data: CharResult;
  row: number;
  col: number;
  onCycle: (direction: 1 | -1) => void;
};

export const Square = ({ data, row, col, onCycle }: SquareState) => {
  const letter = data.char;
  const empty = letter === "";
  const label = empty
    ? `Row ${row + 1} column ${col + 1}, empty`
    : `${letter}, ${STATE_LABEL[data.result]}. Activate to change color`;

  const moveFocus = (nextCol: number) => {
    const target = document.querySelector<HTMLButtonElement>(
      `[data-tile="${row}-${nextCol}"]`
    );
    target?.focus();
  };

  return (
    <button
      type="button"
      data-tile={`${row}-${col}`}
      disabled={empty}
      aria-label={label}
      onClick={() => onCycle(1)}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          onCycle(-1);
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          onCycle(1);
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          moveFocus(col - 1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          moveFocus(col + 1);
        }
      }}
      className={[
        "flex h-11 w-11 items-center justify-center border-2 text-lg font-bold uppercase sm:h-12 sm:w-12",
        "focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-white",
        "disabled:cursor-default",
        COLOR_CLASS[data.result],
      ].join(" ")}
    >
      {empty ? <span aria-hidden="true">-</span> : letter}
    </button>
  );
};
