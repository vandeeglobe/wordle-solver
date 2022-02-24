import React, { Fragment, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {useState} from 'react'
import {SquareState, Square, CharResult, Sign} from './Square';




// const Line = (props:CharResult[]) =>{
type LineStatus = {
    data:wordResult,
    onClick:(col:number) => void
}
const Line = (props:LineStatus) =>{


    const convertDatas:CharResult[] = ((wr:wordResult)=>{
        return wr.word.map((c,i):CharResult=>{
            const r = wr.result[i]? wr.result[i] :'a';
            return {
                char:c,
                result:r
            }
        })
    })(props.data);
    
    const line = convertDatas.map((cr, i)=>{
        return <Square key={i} data={cr} onClick={()=>props.onClick(i)}></Square>
    })
    
    return (
        <div className='flex flex-row'>
            {line}
        </div>
    )
}

type SolveBoardStatus = {
    data:input_history
    onClick: (row:number, col:number) => void
}
const SolveBoard = (props:SolveBoardStatus) => {
    // console.log({props});
    let lines = props.data.map((one_result:wordResult, i:number)=>{
        return <Line key={i} data={one_result} onClick={(col:number)=>{props.onClick(i, col)}} />
    })
    return (
        <>
        {lines}
        </>
    )
}

type  wordResult  = {
    word:string[];
    result:Sign[];
}
type input_history = wordResult[];


const Game = () =>{
    const [state, setState] = useState<input_history>([...Array(6)].map(():wordResult => {
        return {
            word:[...Array(5)].fill(''),
            result:[...Array(5)].fill('a'),
        }
    }));

    const handleClick = (row:number, col:number) =>{

        const order:Sign[] = ['a', 'y', 'g'];
        setState((state)=>{
            let newState = state.slice();
            let now:Sign = newState[row].result[col];
            const nextIndex = (order.findIndex((d)=>d===now) + 1) % 3;
            if(newState[row].word[col] !== ''){
                newState[row].result[col] = order[nextIndex];
            }
            return newState;
        })
    }
    const keydownEvent = (event: KeyboardEvent) =>{
        const ew = event.key;
        const allowd = RegExp('^[a-z]$')

        if (!ew.match(allowd) && ew !== 'Backspace') return;

        setState((state)=>{
            let newState = state.slice();
            let word_list = newState.map(d=>d.word).reduce((p,n)=>p.concat(n),[]);
            const lastIndex = word_list.findIndex(d=>d==='') >= 0 ? word_list.findIndex(d=>d===''): word_list.length ; 

            if (ew === 'Backspace'){
                if(lastIndex === 0) return newState;
                const col = (lastIndex - 1 )% 5 ;
                const row = Math.floor((lastIndex-1) / 5)
                console.log(lastIndex, row,col);
                newState[row].word[col] = '';
                newState[row].result[col] = 'a';
                return newState
            }else{
                if(lastIndex === word_list.length ) return newState;
                const col = (lastIndex) % 5 ;
                const row = Math.floor((lastIndex) / 5) ;
                newState[row].word[col] = ew.toUpperCase();
                newState[row].result[col] = 'a';
                return newState
            }
        })
    }
    useEffect(()=>{
        document.addEventListener("keydown",keydownEvent, false);
    },[]);

    return (
        <div className="App flex items-center justify-center h-screen w-screen ">
            <div className='App-header'></div>
            <div className='App-body '>
                <SolveBoard data={state} onClick={handleClick}/>
            </div>
            <div className='App-footer'></div>
        </div>
    )
}
    
    
ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );
  