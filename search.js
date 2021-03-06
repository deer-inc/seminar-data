const puppeteer = require('puppeteer');
const eventParticipationUrl =
  'https://techtomo.connpass.com/event/204388/participation/';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto(eventParticipationUrl, {
    waitUntil: 'domcontentloaded',
  });
  // ユーザーのリンクリスト
  const usersURL = await page.evaluate(() => {
    const table = document.getElementsByClassName(
      'participation_table_area'
    )[0];
    const userElements = Object.values(
      table.getElementsByClassName('display_name')
    );
    const usersList = userElements.map((user) => {
      return user.getElementsByTagName('a')[0].href;
    });
    return usersList;
  });

  const titleList = [];
  for (const url of usersURL) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(() => {
      return document.title;
    });
    titleList.push(result);
  }
  // ユーザー名のリスト
  const usersName = titleList.map((title) =>
    title.replace('さんのプロフィール（申し込みイベント一覧） - connpass', '')
  );

  browser.close();
})();
