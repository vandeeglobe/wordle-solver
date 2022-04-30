
export type TTuple<N extends number,T> = N extends 0
                                        ? T
                                        : T extends {length: N}
                                        ? T
                                        : T extends unknown[]
                                        ? TTuple<N,[T[0], ...T]>
                                        : TTuple<N,[T]>



export type charState = "a"|"g"|"y";

export type CharResult = {
    char:string;//1文字
    result:charState;//1charaState
}


export type stringFive = TTuple<5, string>;
export type charStateFive = [charState, charState, charState, charState, charState, ]
export type  wordResult  = {
    word:stringFive
    result:charStateFive
}
export type input_history = wordResult[];
export type gameState = {
    //入力された文字と、その結果の対応表
    history:input_history
    //候補
    candidate:string,
    //候補を除外するための文字列
    reducer:string,
}



