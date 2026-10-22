import { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Keyboard } from "./Keyboard";
import { blankHistory, cycleTile, solveForDisplay, typeInto, typeText } from "./play";
import { Square } from "./Square";
import { Usage } from "./Usage";
import { CharResult, gameState, wordResult } from "./types";

const VISIBLE_ANSWERS = 48;

function withSolved(history: gameState["history"]): gameState {
  return solveForDisplay(history);
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
  note,
}: {
  suggestion: string;
  answers: string[];
  note: string | null;
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
      {note ? (
        <p className="mb-3 mt-4 text-center text-sm text-amber-200">{note}</p>
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
    setState((current) => withSolved(cycleTile(current.history, row, col, direction)));
  };

  const handleType = (text: string) => {
    setState((current) => withSolved(typeText(current.history, text)));
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key;
      const isLetter = /^[a-zA-Z]$/.test(key);
      if (!isLetter && key !== "Backspace") return;
      const target = event.target;
      // The guess field reports letters through its input event. Handling the
      // keydown as well would insert each on-screen key twice.
      if (target instanceof HTMLInputElement && target.id === "showKeyboard") {
        if (key !== "Backspace") return;
        event.preventDefault();
        target.value = "";
      } else {
        event.preventDefault();
      }
      setState((current) => withSolved(typeInto(current.history, key)));
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
        <Keyboard onType={handleType} />
        <div className="flex flex-col gap-1" role="group" aria-label="Guesses">
          {state.history.map((line, row) => (
            <Line key={row} row={row} data={line} onCycle={(col, direction) => handleCycle(row, col, direction)} />
          ))}
        </div>
        <div className="mt-4">
          <button
            type="button"
            className="rounded border border-gray-500 px-4 py-2 text-sm text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-white"
            onClick={() => setState(withSolved(blankHistory()))}
          >
            Reset
          </button>
        </div>
        <CandidateBoard
          suggestion={state.suggestion}
          answers={state.answers}
          note={state.note}
        />
      </main>
      <footer className="mx-auto flex w-full max-w-lg justify-center px-3 pb-8 text-sm text-gray-300">
        <a className="underline" href="/privacy.html">
          Privacy
        </a>
      </footer>
    </div>
  );
};

const container = document.getElementById("root");
if (container) {
  ReactDOM.createRoot(container).render(<Game />);
}
