const puppeteer = require('puppeteer');

const eventParticipationUrl = 'https://techtomo.connpass.com/event/204388/participation/';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(eventParticipationUrl, {
    waitUntil: 'domcontentloaded'
  });

  const userLinkList = await page.evaluate(() => {
    const table = document.getElementsByClassName('participation_table_area')[0];
    const userElements = Object.values(table.getElementsByClassName('display_name'));
    const userList =  userElements.map((user) => {
      return user.getElementsByTagName('a')[0].href;
    });
    // return userList;
    return [
      'https://connpass.com/user/mitsui_mie/',
      'https://connpass.com/user/kkkkoki/'
    ];　// テストデータ
  });

  await page.goto(userLinkList[0], {
    waitUntil: 'domcontentloaded'
  });

  const userPageTitle = await page.title();
  const userName = userPageTitle.replace('さんのプロフィール（申し込みイベント一覧） - connpass', '');
  console.log(userName)

  const userData = await page.evaluate(() => {
    const profileArea = document.getElementsByClassName('profile_header_area')[0];
    const profileMessage = profileArea.getElementsByTagName('p')[0].innerText;

    const snsLinkArea = profileArea.getElementsByClassName('social_link')[0];
    const SNS = Object.values(snsLinkArea.getElementsByTagName('a')).map((element) => {
      const snsUrl = element.href;
      if (snsUrl.match(/twitter.com/)) {
        return {'Twitter': snsUrl}
      } else if(snsUrl.match(/github.com/)) {
        return {'GitHub': snsUrl}
      }
    });

    const events = Object.values(document.getElementsByClassName('event_list')).map(event => {
      const eventTitleElement = event.getElementsByClassName('event_title')[0].getElementsByTagName('a')[0];
      const title = eventTitleElement.innerText;
      const url = eventTitleElement.href;
      const eventDateElements = event.getElementsByClassName('event_schedule_area')[0];
      const year = eventDateElements.getElementsByClassName('year')[0].innerText;
      const day = eventDateElements.getElementsByClassName('date')[0].innerText;
      const date = year + '/' + day;
      const amount = event.getElementsByClassName('amount')[0].getElementsByTagName('span')[0].innerText;
      const groupName = event.getElementsByClassName('label_group')[0].getElementsByClassName('series_title')[0].innerText;
      const groupUrl = event.getElementsByClassName('label_group')[0].getElementsByTagName('a')[0].href;
      const owner = event.getElementsByClassName('event_owner')[0].getElementsByClassName('image_link')[0].innerText;
      const ownerUrl = event.getElementsByClassName('event_owner')[0].getElementsByTagName('a')[0].href;
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
          ownerUrl
        }
      };
    });

    return {
      profileMessage,
      SNS,
      events
    };
  });

  console.log(userData);

  await browser.close();
})()
