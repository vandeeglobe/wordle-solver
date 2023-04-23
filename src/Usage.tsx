export const Usage = () => {
  const isSmartPhone = navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i);
  return (
    <ul className={"list-decimal usage"}>
      {isSmartPhone ? <li>Click [ShowKeyboard!]</li> : <></>}
      <li>Enter the characters you typed in wordle</li>
      <li>Match the panel color by clicking on it.</li>
      <li>input candidate word below.</li>
      <li>Enter the word candidate. (→repeat 1)</li>
    </ul>
  );
};
