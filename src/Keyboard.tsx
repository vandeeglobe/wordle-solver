import "./index.css";
export const Keyboard = () => {
  /**
   * smart phone の時にキーボドを表示する領域を出す！
   */
  const isSmartPhone = navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i);
  if (!isSmartPhone) return <></>;

  return (
    <form action="">
      <label className="keyboard" htmlFor="showKeyboard">
        Show Keyboard!
        <input type="text" id="showKeyboard" />
      </label>
    </form>
  );
};
