import puppeteer from 'puppeteer';

interface eventsData {
  title: string;
  url: string;
  date: string;
  amount: string;
  group: {
    name: string;
    groupUrl: string;
  };
  owner: {
    owner: string;
    ownerUrl: string;
  };
}

const eventParticipationUrl =
  'https://techtomo.connpass.com/event/204388/participation/';

(async () => {
  const browser: puppeteer.Browser = await puppeteer.launch({ headless: false });
  const page: puppeteer.Page = await browser.newPage();

  await page.goto(eventParticipationUrl, {
    waitUntil: 'domcontentloaded',
  });
  // ユーザーのリンクリスト
  const usersURL: string[] = await page.evaluate(() => {
    const table: Element = document?.getElementsByClassName(
      'participation_table_area'
    )[0];
    const userElements: Element[] = Object.values(
      table?.getElementsByClassName('display_name')
    );
    const usersList: string[] = userElements.map((user) => {
      return user?.getElementsByTagName('a')[0]?.href;
    });
    return usersList;
  });

  const userData = [];
  for (const url of usersURL) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const result = await page
      .evaluate((url: string[]) => {
        const userName = document?.title?.replace(
          'さんのプロフィール（申し込みイベント一覧） - connpass',
          ''
        );
        const profileArea: Element = document?.getElementsByClassName(
          'profile_header_area'
        )[0];
        const profileMessage: string = profileArea?.getElementsByTagName('p')[0]
          ?.innerText;
        const snsLinkArea: Element = profileArea?.getElementsByClassName(
          'social_link'
        )[0];
        const SNS: any[]
          = Object.values(snsLinkArea?.getElementsByTagName('a')).map(
            (element) => {
              const snsUrl = element?.href;
              if (snsUrl.match(/twitter.com/)) {
                return { Twitter: snsUrl };
              } else if (snsUrl.match(/github.com/)) {
                return { GitHub: snsUrl };
              }
            }
          );
        const events: eventsData[] = Object.values(
          document?.getElementsByClassName('event_list')
        ).map((event) => {
          const eventTitleElement: HTMLAnchorElement = event
            ?.getElementsByClassName('event_title')[0]
            ?.getElementsByTagName('a')[0];
          const title: string = eventTitleElement?.innerText;
          const url: string = eventTitleElement?.href;
          const eventDateElements: Element = event?.getElementsByClassName(
            'event_schedule_area'
          )[0];
          const year: string = (eventDateElements?.getElementsByClassName('year')[0] as HTMLElement)?.innerText;
          const day: string = (eventDateElements?.getElementsByClassName('date')[0] as HTMLElement)
            ?.innerText;
          const date: string = year + '/' + day;
          const amount: string = event
            ?.getElementsByClassName('amount')[0]
            ?.getElementsByTagName('span')[0]?.innerText;
          const groupName: string = (event
            ?.getElementsByClassName('label_group')[0]
            ?.getElementsByClassName('series_title')[0] as HTMLElement)?.innerText;
          const groupUrl: string = event
            ?.getElementsByClassName('label_group')[0]
            ?.getElementsByTagName('a')[0]?.href;
          const owner: string = (event
            ?.getElementsByClassName('event_owner')[0]
            ?.getElementsByClassName('image_link')[0] as HTMLElement)?.innerText;
          const ownerUrl: string = event
            ?.getElementsByClassName('event_owner')[0]
            ?.getElementsByTagName('a')[0]?.href;

          return {
            title,
            url,
            date,
            amount,
            group: {
              name: groupName || '',
              groupUrl: groupUrl || '',
            },
            owner: {
              owner,
              ownerUrl,
            },
          };
        });

        return {
          userName,
          url,
          profileMessage,
          SNS,
          events,
        };
      }, url)
      .catch((error) => {
        console.log(error);
      });
    userData.push(result);
  }
  // 最終成果のデータ（これをCSVで落としましょう）
  console.log(userData);
  browser.close();
})();
