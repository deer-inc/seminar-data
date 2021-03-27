import Scraping from "./scraping";

// connpassイベント参加者一覧ページURL
const targetURL: string =
  'https://techtomo.connpass.com/event/204388/participation/';

// 出力するCSVのファイル名
const csvFireName: string = 'event-20210312.csv';

Scraping(targetURL, csvFireName);
