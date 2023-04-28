import React from "react";
export type Sign = "a" | "g" | "y";

export type CharResult = {
  char: string;
  result: Sign;
};

export type SquareState = {
  data: CharResult;
  onClick: () => void;
};

export const Square = (props: SquareState) => {
  //文字のからを計算する
  const colors = {
    a: "bg-gray-400",
    g: "bg-green-400",
    y: "bg-yellow-400",
  };
  let rect_class = [
    "mx-2",
    "my-0.5",
    "text-[20px]",
    "h-12",
    "w-12",
    "flex",
    "flex-col",
    "justify-center",
    "items-center",
    colors[props.data.result],
  ].join(" ");
  // console.log('render Square')
  return (
    <div className={rect_class} onClick={props.onClick}>
      {props.data.char && props.data.char !== "" ? (
        props.data.char
      ) : (
        <label className={"text-gray-400"} htmlFor="showKeyboard">
          -
        </label>
      )}
    </div>
  );
};
