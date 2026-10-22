import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Keyboard } from "./Keyboard";
import { Square } from "./Square";
import { nextCandidate } from "./Solver";
import { Usage } from "./Usage";
import {
  CharResult,
  charState,
  charStateFive,
  gameState,
  input_history,
  stringFive,
  wordResult,
} from "./types";

const COLOR_ORDER: charState[] = ["u", "a", "y", "g"];
const VISIBLE_ANSWERS = 48;

function blankRow(): wordResult {
  return {
    word: Array(5).fill("") as stringFive,
    result: Array(5).fill("u") as charStateFive,
  };
}

function blankHistory(): input_history {
  return Array.from({ length: 6 }, blankRow);
}

function stepColor(current: charState, direction: 1 | -1): charState {
  const index = COLOR_ORDER.indexOf(current);
  const next = (index + direction + COLOR_ORDER.length) % COLOR_ORDER.length;
  return COLOR_ORDER[next];
}

function withSolved(history: input_history): gameState {
  const solved = nextCandidate(history);
  return {
    history,
    suggestion: solved.suggestion,
    answers: solved.answers,
  };
}

type LineProps = {
  row: number;
  data: wordResult;
  onCycle: (col: number, direction: 1 | -1) => void;
};

const Line = ({ row, data, onCycle }: LineProps) => {
  const cells: CharResult[] = data.word.map((letter, index) => ({
    char: letter,
    result: data.result[index] ?? "u",
  }));

  return (
    <div className="flex flex-row gap-1 sm:gap-1.5" role="group" aria-label={`Guess ${row + 1}`}>
      {cells.map((cell, col) => (
        <Square
          key={col}
          data={cell}
          row={row}
          col={col}
          onCycle={(direction) => onCycle(col, direction)}
        />
      ))}
    </div>
  );
};

const SuggestionTiles = ({ word }: { word: string }) => {
  const letters = word ? word.toUpperCase().split("") : Array(5).fill("");
  return (
    <div className="flex flex-row justify-center gap-1 sm:gap-1.5" aria-hidden="true">
      {letters.map((letter, index) => (
        <div
          key={index}
          className="flex h-11 w-11 items-center justify-center border-2 border-sky-400 bg-sky-700 text-lg font-bold uppercase text-white sm:h-12 sm:w-12"
        >
          {letter || "-"}
        </div>
      ))}
    </div>
  );
};

const CandidateBoard = ({
  suggestion,
  answers,
}: {
  suggestion: string;
  answers: string[];
}) => {
  const shown = answers.slice(0, VISIBLE_ANSWERS);
  const hidden = answers.length - shown.length;

  return (
    <section className="mt-4 w-full max-w-lg px-3" aria-live="polite">
      <h2 className="mb-2 text-center text-sm font-semibold text-white">Suggested guess</h2>
      <SuggestionTiles word={suggestion} />
      {suggestion ? (
        <p className="mt-1 text-center font-mono text-sm uppercase tracking-wide text-sky-200">
          {suggestion}
        </p>
      ) : null}
      <h2 className="mb-2 mt-4 text-center text-sm font-semibold text-white">
        {answers.length === 1 ? "1 possible answer" : `${answers.length} possible answers`}
      </h2>
      {answers.length === 0 ? (
        <p className="text-center text-sm text-gray-300">
          No answer fits these colors. Check the row.
        </p>
      ) : (
        <ul className="flex max-h-40 flex-wrap justify-center gap-x-3 gap-y-1 overflow-y-auto">
          {shown.map((word) => (
            <li key={word} className="font-mono text-sm uppercase text-white">
              {word}
            </li>
          ))}
        </ul>
      )}
      {hidden > 0 ? (
        <p className="mt-2 text-center text-xs text-gray-300">and {hidden} more</p>
      ) : null}
    </section>
  );
};

const Game = () => {
  const [state, setState] = useState<gameState>(() => withSolved(blankHistory()));

  const handleCycle = (row: number, col: number, direction: 1 | -1) => {
    setState((current) => {
      if (current.history[row].word[col] === "") return current;
      const history = current.history.map((line, lineIndex) => {
        if (lineIndex !== row) return line;
        const result = [...line.result] as charStateFive;
        result[col] = stepColor(line.result[col], direction);
        return {
          word: [...line.word] as stringFive,
          result,
        };
      });
      return withSolved(history);
    });
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;

      const key = event.key;
      const isLetter = /^[a-zA-Z]$/.test(key);
      if (!isLetter && key !== "Backspace") return;
      event.preventDefault();
      if (target instanceof HTMLInputElement) target.value = "";

      setState((current) => {
        const letters = current.history.flatMap((line) => line.word);
        const emptyAt = letters.findIndex((letter) => letter === "");
        const lastIndex = emptyAt >= 0 ? emptyAt : letters.length;
        const history = current.history.map((line) => ({
          word: [...line.word] as stringFive,
          result: [...line.result] as charStateFive,
        }));

        if (key === "Backspace") {
          if (lastIndex === 0) return current;
          const row = Math.floor((lastIndex - 1) / 5);
          const col = (lastIndex - 1) % 5;
          history[row].word[col] = "";
          history[row].result[col] = "u";
        } else {
          if (lastIndex === letters.length) return current;
          const row = Math.floor(lastIndex / 5);
          const col = lastIndex % 5;
          history[row].word[col] = key.toUpperCase();
          history[row].result[col] = "u";
        }
        return withSolved(history);
      });
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen w-full bg-black">
      <header className="sticky top-0 z-10 flex h-12 items-center justify-center gap-2 border-b border-gray-700 bg-black">
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="white"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-xl font-bold text-white">wordle solver</h1>
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-col items-center px-2 pb-10 pt-4">
        <Usage />
        <Keyboard />
        <div className="flex flex-col gap-1" role="group" aria-label="Guesses">
          {state.history.map((line, row) => (
            <Line key={row} row={row} data={line} onCycle={(col, direction) => handleCycle(row, col, direction)} />
          ))}
        </div>
        <CandidateBoard suggestion={state.suggestion} answers={state.answers} />
      </main>
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  ReactDOM.createRoot(container).render(<Game />);
}
