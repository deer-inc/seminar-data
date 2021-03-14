# connpassイベントページ スクレイピングツール

## 行っていること
1. 該当イベントに申し込みしたユーザーのURL一覧取得
2. 各ユーザーのページから簡単なユーザー情報と直近10件の参加イベントを取得
3. 取得したデータをCSVファイルへ書き出し

## 使い方
1. npm modulesをインストール
```
$ npm i
```

2. `src/index.js`の下記の値を対象の値に置き換える。
```js
// connpassイベントページURL
const eventURL: string = 'https://xxxx.connpass.com/event/xxxx/';

// 出力するCSVのファイル名
const csvFireName: string = 'event-data.csv';
```

3. 実行コマンド
```
$ npm start
```

4. コンソールに`CSV書き出し 成功！！`と出力されたら完了。生成ファイルは、`dist`ディレクトリ内に指定したファイル名で保存される。
5. スプレットシートに読み込むなどして、加工してください。
