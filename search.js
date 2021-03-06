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
    const userMessage = profileArea.getElementsByTagName('p')[0];
    return userMessage.innerText;
  });

  console.log(userData);

  // ユーザーページへ遷移
  // let index = 0;
  // promiseList = [];
  // testUserUrlList.forEach(userUrl => {
  //   console.log('test1')
  //   promiseList.push((async (index) => {
  //     console.log('test2')
  //     const page = await browser.newPage();
  //     page.setDefaultNavigationTimeout(30000);// default 3000 milliseconds, pass 0 to disable timeout
  //     const response = await page.goto(userUrl);
  //     await page.waitForNavigation(1000);// 1秒待つ

  //     if (response.status() !== 200) {
  //       return [];
  //     }

  //     console.log(index);

  //     const result = await page.evaluate(async() => {
  //       return await page.title();
  //     });

  //     console.log(result);

  //     await page.close();

  //     return result;
  //   })(index));
  //   index++;
  // });
  // let articleTitleList = [];
  // await Promise.all(promiseList).then(valueList => {
  //   valueList.forEach(value => {
  //     articleTitleList = articleTitleList.concat(value);
  //   });
  // }).catch(reject => {
  //   throw reject;
  // });
  // console.log(articleTitleList);
  // (async function() {
  //   console.log('test0');
  //   for(let i = 0; i < testUserUrlList.length; i++) {
  //     console.log('test1');
  //     const page = await browser.newPage()
  //     const res = await page.goto(testUserUrlList[i], {waitUntil: 'domcontentloaded'})
  //     await page.waitForNavigation(5000);
  //     console.log(res);
  //     if (res.status() !== 200) return `${res.status()} ERROR`
  //     await page.evaluate(async () => {
  //       console.log('test');
  //       const title = await page.title();
  //       console.log(title);
  //     })
  //     // console.log(result)
  //     await page.close()
  //   }

    // await Promise.all(testUserUrlList.map(async (userUrl) => {
    //   await page.goto(userUrl, {
    //     waitUntil: 'networkidle2'
    //   });
    //   await page.waitForNavigation(5000);
    //   const title = await page.title();
    //   console.log(title);
    // }))
  // })();
  // (async () => {
  //   for(let i; i < test.length; i++) {
  //     await page.goto(test[i], {
  //       waitUntil: 'domcontentloaded'
  //     });
  //     const title = await page.title();
  //     console.log(title);
  //     // const userName = title.replace('さんのプロフィール（申し込みイベント一覧） - connpass', '');
  //     // console.log(userName);
  //   }
  // })();
  // test.map(async(userUrl) => {
  //   await page.goto(userUrl, {
  //     waitUntil: 'domcontentloaded'
  //   });
  // })

  await browser.close();
})()
