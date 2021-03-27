import Scraping from "./scraping";

// connpassイベント参加者一覧ページURL
const targetURL: string =
  'https://techtomo.connpass.com/event/207655/ptype/298789/participants/';

// 出力するCSVのファイル名
const csvFireName: string = 'event-20210326.csv';

// 参加者番号の最初のナンバー
const indexNum =1;

Scraping(targetURL, csvFireName, indexNum);
