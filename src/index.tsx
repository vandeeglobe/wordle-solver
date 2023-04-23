import React, { Fragment, useEffect } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { useState } from "react";
import { Square } from "./Square";
import {
  input_history,
  wordResult,
  CharResult,
  charState,
  stringFive,
  charStateFive,
  gameState,
} from "./types";
import { nextCandidate } from "./Solver";

// const Line = (props:CharResult[]) =>{
type LineStatus = {
  data: wordResult;
  onClick: (col: number) => void;
};
const Line = (props: LineStatus) => {
  const convertDatas: CharResult[] = ((wr: wordResult) => {
    return wr.word.map((c, i): CharResult => {
      const r = wr.result[i] ? wr.result[i] : "a";
      return {
        char: c,
        result: r,
      };
    });
  })(props.data);

  const line = convertDatas.map((cr, i) => {
    return <Square key={i} data={cr} onClick={() => props.onClick(i)}></Square>;
  });

  return <div className="flex flex-row">{line}</div>;
};

type CandidateStatus = {
  data: string;
};
const CandidateBoard = (props: CandidateStatus) => {
  console.log({ props });
  const candWR: wordResult = {
    word: (props.data === ""
      ? Array(5).fill("")
      : Array.from(props.data)) as stringFive,
    result: Array(5).fill("a") as charStateFive,
  };
  return (
    <div className="mt-5">
      <span className="text-white">candidate</span>
      <Line data={candWR} onClick={() => {}}></Line>
    </div>
  );
};

type SolveBoardStatus = {
  data: input_history;
  candidate: string;
  onClick: (row: number, col: number) => void;
};
const SolveBoard = (props: SolveBoardStatus) => {
  // console.log({props});
  let lines = props.data.map((one_result: wordResult, i: number) => {
    return (
      <Line
        key={i}
        data={one_result}
        onClick={(col: number) => {
          props.onClick(i, col);
        }}
      />
    );
  });
  return <>{lines}</>;
};

const Game = () => {
  const initialWords = Array(5).fill("") as stringFive;
  const initialResults = Array(5).fill("a") as charStateFive;
  const [state, setState] = useState<gameState>(
    (() => {
      let input_history = [...Array(6)].map((): wordResult => {
        return {
          word: initialWords.slice() as stringFive,
          result: initialResults.slice() as charStateFive,
        };
      });
      return {
        history: input_history,
        candidate: "",
        reducer: "",
      };
    })()
  );

  const handleClick = (row: number, col: number) => {
    //clickに応じてタイルの状態を変更する
    const order: charState[] = ["a", "y", "g"];
    setState((state) => {
      let newState = { ...state };
      let str: string = newState.history[row].word[col];
      let now: charState = newState.history[row].result[col];
      //押された場所に文字が入力されていなかった場合、状態を変更しない。
      if (str === "") {
        return newState;
      }

      //次の状態に遷移させる.
      const nextIndex = (order.findIndex((d) => d === now) + 1) % 3;
      newState.history[row].result[col] = order[nextIndex];
      //次に入力するための候補を更新する
      const [cand, reduceString] = updateCandidate(newState);
      newState = { ...newState, candidate: cand, reducer: reduceString };
      return newState;
    });
  };
  const updateCandidate = (state: gameState) => {
    const [cand, reduceString] = nextCandidate(state.history);
    return [cand, reduceString];
  };

  const keydownEvent = (event: KeyboardEvent) => {
    //押されたキーボードを解答として埋める

    const ew = event.key; //押されたキーボード
    const allowd = RegExp("^[a-z]$"); //入力対象の文字

    if (!ew.match(allowd) && ew !== "Backspace") return;

    setState((state) => {
      let newState = { ...state };
      //入力されている文字一覧
      let char_list: string[] = newState.history
        .map((d) => d.word)
        .reduce((p: string[], n) => p.concat(n), []);
      const lastIndex =
        char_list.findIndex((d) => d === "") >= 0
          ? char_list.findIndex((d) => d === "")
          : char_list.length;

      if (ew === "Backspace") {
        if (lastIndex === 0) return newState;
        const col = (lastIndex - 1) % 5;
        const row = Math.floor((lastIndex - 1) / 5);
        //一文字削除して、状態を初期化しておく
        newState.history[row].word[col] = "";
        newState.history[row].result[col] = "a";
      } else {
        if (lastIndex === char_list.length) return newState;
        const col = lastIndex % 5;
        const row = Math.floor(lastIndex / 5);
        //一文字追加して、状態を初期化しておく
        newState.history[row].word[col] = ew.toUpperCase();
        newState.history[row].result[col] = "a";
      }
      //次に入力するための候補を更新する
      const [cand, reduceString] = updateCandidate(newState);
      newState = { ...newState, candidate: cand, reducer: reduceString };
      return newState;
    });
  };
  useEffect(() => {
    document.addEventListener("keydown", keydownEvent, false);
  }, []);

  return (
    <div className="App flex flex-col items-center justify-center h-screen w-screen">
      <div className="fixed left-0 top-0 flex flex-row w-full h-10  border-b justify-center font-medium text-2xl">
        <div className="float-left flex flex-col justify-center text-center">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="white"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div>
          <span className="text-white font-bold w-40">wordle solver</span>
        </div>
      </div>

      <div className="App-body ">
        <SolveBoard
          data={state.history}
          candidate={state.candidate}
          onClick={handleClick}
        />
        <CandidateBoard data={state.candidate} />
      </div>
      <div className="App-footer"></div>
    </div>
  );
};

ReactDOM.render(<Game />, document.getElementById("root"));
