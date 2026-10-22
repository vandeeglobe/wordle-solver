import { useEffect, useRef, useState } from "react";
import "./index.css";

function wantsOnScreenKeyboard(): boolean {
  const phone = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const narrow = window.matchMedia("(max-width: 640px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return phone || narrow || coarse;
}

export function useOnScreenKeyboard(): boolean {
  const [visible, setVisible] = useState(() =>
    typeof window !== "undefined" ? wantsOnScreenKeyboard() : false
  );

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 640px)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const update = () => setVisible(wantsOnScreenKeyboard());
    update();
    narrow.addEventListener("change", update);
    coarse.addEventListener("change", update);
    return () => {
      narrow.removeEventListener("change", update);
      coarse.removeEventListener("change", update);
    };
  }, []);

  return visible;
}

export const Keyboard = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const visible = useOnScreenKeyboard();

  if (!visible) return null;

  return (
    <form
      className="mb-3 flex w-full max-w-sm flex-col items-center"
      onSubmit={(event) => event.preventDefault()}
    >
      <button
        type="button"
        className="text-lg text-orange-400 underline"
        onClick={() => inputRef.current?.focus()}
      >
        Show keyboard
      </button>
      <input
        ref={inputRef}
        id="showKeyboard"
        aria-label="Type your guess"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className="keyboard-input"
      />
    </form>
  );
};
