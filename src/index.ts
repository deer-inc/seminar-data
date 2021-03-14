import Scraping from "./scraping";

// connpassイベントページURL
const eventURL: string =
  'https://techtomo.connpass.com/event/204388/';

// 出力するCSVのファイル名
const csvFireName: string = 'event-20210312.csv';

Scraping(eventURL, csvFireName);
