import { useOnScreenKeyboard } from "./Keyboard";

export const Usage = () => {
  const showKeyboardHint = useOnScreenKeyboard();

  return (
    <ol className="usage mb-3 list-decimal space-y-1 px-5 text-sm sm:text-base">
      {showKeyboardHint ? <li>Tap Show keyboard, then type the word you played.</li> : null}
      <li>Type the word you played. An outlined tile is not colored yet.</li>
      <li>
        Color every tile in the row: gray, yellow, then green. Click a tile, or
        focus it and press Enter. Up and Down change the color. Left and Right
        move between tiles.
      </li>
      <li>The possible answers update once a row is fully colored.</li>
      <li>Play the suggested word, or pick another answer from the list.</li>
      <li>Press Reset to clear the board.</li>
    </ol>
  );
};
