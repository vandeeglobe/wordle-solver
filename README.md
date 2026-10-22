# Wordle Solver

Wordle に入れた文字と色から、まだあり得る答えを絞り込むツールです。

公開サイト: https://wordle-solver-one.vercel.app

## 必要なもの

- Node.js 22.12 以上
- npm

## 動かし方

```bash
npm ci
npm run dev
```

ブラウザで http://localhost:3000 を開きます。`npm start` も同じ開発サーバです。

確認は次のとおりです。

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

`npm run build` の成果物は `dist/` です。中身の確認は `npm run preview` です。

## Vercel への出し方

`vercel.json` で次を指定しています。

- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

以前は Create React App で、出力先は `build` でした。Vercel のプロジェクト設定に Output Directory や Build Command が残っていると、そちらが `vercel.json` より優先されます。デプロイが空になる、または古い `build` を探しにいく場合は、ダッシュボードの上書きを消すか、Output Directory を `dist` にしてください。

このリポジトリを Vercel に接続したままなら、このブランチをマージして再デプロイすれば更新されます。環境変数は使っていません。

## 使い方

- プレイした単語を入力する。枠線だけのマスは、まだ色を決めていない状態です。
- マスをクリックするか、フォーカスして Enter を押すと色が変わります。順番は未確定、灰色、黄、緑です。上下キーでも色を変えられます。
- 1行の5マスすべてに色が付くと、下の候補が更新されます。
- Reset で盤面を空に戻します。

## 単語リスト

2026-10-22 に公式クライアントから更新しました。

- 入力できる語: New York Times の Wordle ページが読み込む JavaScript（`4964.e5c2414cbf0afca6a247.js`）に入っている 14,855 語。ゲームはこの一覧にある語だけを受け付けます。
- 答えの候補: その一覧の後半に残っている従来の解答バンク（`cigar` から `augur`、2,309 語）に、公式 API `https://www.nytimes.com/svc/wordle/v2/YYYY-MM-DD.json` が 2021-06-19 から 2026-12-02 までに実際に出した解答で、バンクに無かった 85 語を足したもの。
- 出典の詳細は `src/Words.tsx` 先頭のコメントです。

## 既知の制限

- 2026-12-03 以降に初めて公式が出す答えは、上の候補に入っていないことがあります。入力できる語としては残りますが、既知の答え候補が全部消えるまでおすすめには出ません。
- 色は、その行の5マスすべてを決めてから反映されます。途中のマスだけでは候補は変わりません。
- ページは Google AdSense を読み込みます。入力した文字の扱いと、読み込む外部サービスはサイト内の Privacy ページに書いてあります。これは法的な判断ではありません。
- 狭い画面幅では、説明の下に盤面が続き、縦にスクロールします。すべての実機は確認していません。
