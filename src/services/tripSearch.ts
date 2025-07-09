import {chromium} from 'playwright';

/**
 * 通过携程查询航班信息
 * @param param0
 * @param param0.depCity 出发城市
 * @param param0.arrCity 到达城市
 * @param param0.depDate 出发日期，格式为 YYYY-MM-DD
 * @returns  航班信息数组
 * @example
 * getFlightInfoByCtrip({
 *   depCity: '重庆', // 出发城市
 *   arrCity: '北京', // 到达城市
 *   depDate: '2023-10-01' // 出发日期
 * });
 * @see https://flights.ctrip.com/online/list/oneway-PEK-SHA?_=1&depdate=2023-10-01&cabin=Y_S_C_F
 */
export async function getFlightInfoByCtrip({
  depCity,
  arrCity,
  depDate
}: {
  depCity: string;
  arrCity: string;
  depDate: string;
}) {
  // 获取出发城市和到达城市的代码
  depCity = await getCityCode(depCity);
  arrCity = await getCityCode(arrCity);

  const browser = await chromium.launch({headless: true});
  const page = await browser.newPage();

  await page.goto(
    `https://flights.ctrip.com/online/list/oneway-${depCity}-${arrCity}?_=1&depdate${depDate}&cabin=Y_S_C_F`
  );

  await page.waitForSelector('.flight-list');
  let scrollHeight = 400;
  for (let i = 0; i < 30; i++) {
    await page.evaluate(scrollHeight => {
      window.scrollTo(0, scrollHeight);
    }, scrollHeight);
    scrollHeight += 400;

    await page.waitForTimeout(1000);
  }
  // 等待航班信息加载完成
  const nodes = await page.$$eval('.flight-box', flightElements => {
    return flightElements.map(flight => {
      const flightInfo = {
        airlineName:
          (
            flight.querySelector('.airline-name') as HTMLDivElement
          )?.innerText?.trim() || '',
        planeNo:
          (
            flight.querySelector('.plane-No') as HTMLDivElement
          )?.innerText?.trim() || '',
        departTime:
          (
            flight.querySelector('.depart-box .time') as HTMLDivElement
          )?.innerText?.trim() || '',
        departAirport:
          (
            flight.querySelector('.depart-box .airport') as HTMLDivElement
          )?.innerText?.trim() || '',
        arriveTime:
          (
            flight.querySelector('.arrive-box .time') as HTMLDivElement
          )?.innerText?.trim() || '',
        arriveAirport:
          (
            flight.querySelector('.arrive-box .airport') as HTMLDivElement
          )?.innerText?.trim() || '',
        transfer:
          (
            flight.querySelector('.arrow-box') as HTMLDivElement
          )?.innerText?.trim() || '',
        price:
          (
            flight.querySelector('.flight-price .price') as HTMLDivElement
          )?.innerText?.trim() || '',
        isTransfer: !!flight.querySelector('.arrow-transfer')
      };
      return flightInfo;
    });
  });
  // 关闭浏览器
  await browser.close();

  // 过滤掉没有航司名称的节点
  return nodes.filter(n => n.airlineName);
}

export async function getCityCode(cityName: string) {
  const res = await fetch(
    `https://flights.ctrip.com/international/search/api/poi/search?key=${cityName}&filterAirport=true`
  );
  if (!res.ok) {
    throw new Error(`Failed to fetch city code for ${cityName}`);
  }
  const data = await res.json();
  const code = data?.Data?.[0]?.Code;
  return code || '';
}
