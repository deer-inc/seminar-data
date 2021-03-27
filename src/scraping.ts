import puppeteer from 'puppeteer';
import fs from'fs';
const { createObjectCsvWriter } = require('csv-writer');

interface user {
  url: string,
  status: string
}

interface eventsData {
  title: string;
  url: string;
  date: string;
  amount: string;
  group: string;
  groupURL: string;
  owner: string;
  ownerURL: string;
};

const Scraping = (targetURL: string, csvFireName:string) => {
  (async () => {
    const browser: puppeteer.Browser = await puppeteer.launch({ headless: true });
    const page: puppeteer.Page = await browser.newPage();

    const eventParticipationUrl = targetURL;

    await page.goto(eventParticipationUrl, {
      waitUntil: 'domcontentloaded',
    });
    // ユーザーのリンクリスト
    const userList: user[] = await page.evaluate(() => {
      // セクションごとのユーザー一覧を取得する関数
      const sectionUserList = (elmentsArea: string, status: string) => {
        const table: Element = document?.getElementsByClassName(elmentsArea)[0];
        if(table) {
          const userElements = Object.values(
            table?.getElementsByClassName('display_name')
          )
          const users: user[] = [];
          userElements.forEach((user, index) => {
            const userURL = user?.getElementsByTagName('a')[0]?.href || '';
            if(userURL !== '') {
              users.push({
                url: user?.getElementsByTagName('a')[0]?.href || '',
                status
              })
            }
          });
          return users;
        } else {
          return [];
        }
      };
      // 参加者一覧
      const participationUsers: user[] = sectionUserList('participation_table_area', '参加者');
      // 補欠者一覧
      const waitlistUsers: user[] = sectionUserList('waitlist_table_area', '補欠者');
      // キャンセル一覧
      const cancelledUsers: user[] = sectionUserList('cancelled_table_area', 'キャンセル');
      const users: user[] = [
        ...participationUsers,
        ...waitlistUsers,
        ...cancelledUsers
      ]
      return users;
    });

    const userUrlList = userList.map((user: user) => {
      return user.url
    });

    const userData = [];
    for (const url of userUrlList) {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const result = await page
        .evaluate((userURL: string[]) => {
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
          let Twitter: string = '';
          let GitHub: string = '';
          Object.values(snsLinkArea?.getElementsByTagName('a')).forEach((element) => {
            const snsUrl = element?.href;
            if (snsUrl.match(/twitter.com/)) {
              Twitter = snsUrl;
            } else if (snsUrl.match(/github.com/)) {
              GitHub = snsUrl;
            }
          });
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
            const group: string = (event
              ?.getElementsByClassName('label_group')[0]
              ?.getElementsByClassName('series_title')[0] as HTMLElement)?.innerText;
            const groupURL: string = event
              ?.getElementsByClassName('label_group')[0]
              ?.getElementsByTagName('a')[0]?.href;
            const owner: string = (event
              ?.getElementsByClassName('event_owner')[0]
              ?.getElementsByClassName('image_link')[0] as HTMLElement)?.innerText;
            const ownerURL: string = event
              ?.getElementsByClassName('event_owner')[0]
              ?.getElementsByTagName('a')[0]?.href;

            return {
              title,
              url,
              date,
              amount,
              group: group || '',
              groupURL: groupURL || '',
              owner,
              ownerURL,
            };
          });

          return {
            userName,
            userURL,
            profileMessage,
            Twitter,
            GitHub,
            events,
          };
        }, url)
        .catch((error) => {
          console.log(error);
        });
      userData.push(result);
    }

    const userDataWithStatus = userData.map((user, i) => {
      return {
        index: i + 1,
        status: userList[i].status,
        ...user,
      }
    });

    // CSV形式用に整形
    const formatUserData: any[] = [];
    userDataWithStatus.map((user: any) => {
      user.events.map((event: eventsData, i: number): any => {
        const eventData: any = {
          title: event.title,
          url: event.url,
          date: event.date,
          amount: event.amount,
          group: event.group,
          groupURL: event.groupURL,
          owner: event.owner,
          ownerURL: event.ownerURL
        }
        if(i === 0) {
          return formatUserData.push({
            index: user.index,
            status: user.status,
            userName: user.userName,
            userURL: user.userURL,
            profileMessage: user.profileMessage,
            Twitter: user.Twitter,
            GitHub: user.GitHub,
            ...eventData
          })
        } else {
          return formatUserData.push({
            index: '',
            status: '',
            userName: '',
            userURL: '',
            profileMessage: '',
            Twitter: '',
            GitHub: '',
            ...eventData
          })
        }
      })
    });

    const csvWriter = createObjectCsvWriter({
      path: './dist/' + csvFireName,
      header: [
        {id: 'index', title: 'No'},
        {id: 'status', title: 'ステータス'},
        {id: 'userName', title: 'ユーザー名'},
        {id: 'userURL', title: 'ユーザーURL'},
        {id: 'profileMessage', title: 'プロフィール文'},
        {id: 'Twitter', title: 'Twitter'},
        {id: 'GitHub', title: 'GitHub'},
        {id: 'title', title: 'イベントタイトル'},
        {id: 'url', title: 'イベントURL'},
        {id: 'date', title: 'イベント日時'},
        {id: 'amount', title: '申込人数'},
        {id: 'group', title: 'グループ名'},
        {id: 'groupURL', title: 'グループURL'},
        {id: 'owner', title: '主催者名'},
        {id: 'ownerURL', title: '主催者URL'}
      ]
    });

    if (!fs.existsSync('dist')) {
      fs.mkdir('dist', (err) => {
        if (err) { throw err; }
      });
    }

    csvWriter.writeRecords(formatUserData)
      .then(() => {
        console.log('CSV書き出し 成功！！');
      });

    browser.close();
  })();
}

export default Scraping;
