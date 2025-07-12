import {chromium} from 'playwright';
import {scrollToLoadAllContent} from './helper';
import z from 'zod';
import server from './mcpServer';

interface FlightProps {
  depCity: string;
  arrCity: string;
  depDate: string;
}

interface FlightInfo {
  airlineName: string;
  planeNo: string;
  departTime: string;
  departAirport: string;
  arriveTime: string;
  arriveAirport: string;
  transfer: string;
  price: string;
  isTransfer: boolean;
}

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
}: FlightProps) {
  const browser = await chromium.launch({
    headless: process.env.CHROMIUN_HEADLESS !== 'false'
  });
  const page = await browser.newPage();
  const url = `https://flights.ctrip.com/online/list/oneway-${depCity}-${arrCity}?_=1&depdate=${depDate}&cabin=Y_S_C_F`;

  await page.goto(url);

  await page.waitForSelector('.flight-list');
  await scrollToLoadAllContent(page);
  // 等待航班信息加载完成
  const nodes: FlightInfo[] = await page.$$eval(
    '.flight-box',
    flightElements => {
      return flightElements.map(flight => {
        const flightInfo = {
          airlineName:
            (flight.querySelector('.airline-name') as HTMLDivElement)?.innerText
              ?.trim()
              .replace(/\n/g, ',') || '',
          planeNo:
            (flight.querySelector('.plane-No') as HTMLDivElement)?.innerText
              ?.trim()
              .replace(/\n/g, ',') || '',
          departTime:
            (
              flight.querySelector('.depart-box .time') as HTMLDivElement
            )?.innerText
              ?.trim()
              .replace(/\n/g, ',') || '',
          departAirport:
            (
              flight.querySelector('.depart-box .airport') as HTMLDivElement
            )?.innerText
              ?.trim()
              .replace(/\n/g, ',') || '',
          arriveTime:
            (
              flight.querySelector('.arrive-box .time') as HTMLDivElement
            )?.innerText
              ?.trim()
              .replace(/\n/g, ',') || '',
          arriveAirport:
            (
              flight.querySelector('.arrive-box .airport') as HTMLDivElement
            )?.innerText
              ?.trim()
              .replace(/\n/g, ',') || '',
          transfer:
            (flight.querySelector('.arrow-box') as HTMLDivElement)?.innerText
              ?.trim()
              .replace(/\n/g, ',') || '',
          price:
            (
              flight.querySelector('.flight-price .price') as HTMLDivElement
            )?.innerText
              ?.trim()
              .replace(/\n/g, ',') || '',
          isTransfer: !!flight.querySelector('.arrow-transfer')
        };
        return flightInfo;
      });
    }
  );
  // 关闭浏览器
  await browser.close();

  // 过滤掉没有航司名称的节点
  return {flightInfo: nodes.filter(n => n.airlineName), url};
}

/**
 * 通过飞猪查询航班信息
 * @param param0
 * @param param0.depCity 出发城市
 * @param param0.arrCity 到达城市
 * @param param0.depDate 出发日期，格式为 YYYY-MM-DD
 * @returns 航班信息数组
 * @example
 * getFlightInfoByFliggy({
 *   depCity: '重庆', // 出发城市
 *   arrCity: '北京', // 到达城市
 *   depDate: '2023-10-01' // 出发日期
 * });
 * @see https://sjipiao.fliggy.com/flight_search_result.htm?depCity=BJS&arrCity=HGH&depDate=2025-07-12
 */
export async function getFlightInfoByFliggy({
  depCity,
  arrCity,
  depDate
}: FlightProps) {
  const browser = await chromium.launch({
    headless: process.env.CHROMIUN_HEADLESS !== 'false'
  });
  const page = await browser.newPage();
  const url = `https://sjipiao.fliggy.com/flight_search_result.htm?depCity=${depCity}&arrCity=${arrCity}&depDate=${depDate}`;
  await page.goto(url);

  await page.waitForSelector('.flight-list');

  const nodes: FlightInfo[] = await page.$$eval(
    '.flight-list-item',
    flightElements => {
      return flightElements.map(flight => {
        const nameAndNos = flight.querySelectorAll(
          '.airline-name'
        ) as NodeListOf<HTMLDivElement>;
        const airlineName: string[] = [];
        const planeNo: string[] = [];
        Array.from(nameAndNos).forEach(el => {
          const text = el.innerText?.trim() || '';
          const match = text.match(/(.*?)([A-Z0-9]{6})/);
          if (match) {
            airlineName.push(match[1].trim());
            planeNo.push(match[2].trim());
          }
        });
        const flightInfo = {
          airlineName: airlineName.join(','),
          planeNo: planeNo.join(','),
          departTime:
            (
              flight.querySelector('.flight-time-deptime') as HTMLDivElement
            )?.innerText?.trim() || '',
          departAirport:
            (
              flight.querySelector('.port-dep') as HTMLDivElement
            )?.innerText?.trim() || '',
          arriveTime:
            (
              flight.querySelector(
                '.flight-time p:nth-child(2)'
              ) as HTMLDivElement
            )?.innerText?.trim() || '',
          arriveAirport:
            (
              flight.querySelector('.port-arr') as HTMLDivElement
            )?.innerText?.trim() || '',
          transfer:
            (
              flight.querySelector('.transfer-city') as HTMLDivElement
            )?.innerText?.trim() || '',
          price:
            (
              flight.querySelector('.pi-price') as HTMLDivElement
            )?.innerText?.trim() || '',
          isTransfer: !!flight.querySelector('.transfer-city')
        };
        return flightInfo;
      });
    }
  );

  // 关闭浏览器
  await browser.close();

  return {
    flightInfo: nodes.filter(n => n.airlineName),
    url
  };
}

export async function getCityCodeByQunar({
  depCityName,
  arrCityName,
  depDate
}: FlightProps & {
  depCityName: string;
  arrCityName: string;
}) {
  const url = `https://flight.qunar.com/site/oneway_list.htm`;
  const browser = await chromium.launch({
    headless: process.env.CHROMIUN_HEADLESS !== 'false'
  });
  const context = await browser.newContext();
  await context.addInitScript(() => {
    // 禁用webdriver检测
    // 让浏览器看起来像是正常用户操作的
    Object.defineProperty(navigator, 'webdriver', {get: () => false});
  });
  const page = await context.newPage();
  await page.goto(url);

  const inputs = await page.$$('.serTxt');

  await inputs[0].fill(depCityName);
  await page.waitForTimeout(1000); // 等待1秒，确保输入框有时间加载
  await inputs[0].press('Enter');
  await inputs[1].fill(arrCityName);
  await page.waitForTimeout(1000); // 等待1秒，确保输入框有时间加载
  await inputs[1].press('Enter');
  await inputs[2].fill(depDate);
  await inputs[3].press('Enter');

  let nodes: FlightInfo[] = [];
  while (true) {
    await page.waitForSelector('.m-airfly-lst');

    const list = await page.$$eval(
      '.m-airfly-lst .b-airfly',
      flightElements => {
        return flightElements.map(flight => {
          const airlineName = Array.from(flight.querySelectorAll('.air'))
            .map(el => (el as HTMLDivElement).innerText?.trim() || '')
            .join(',');
          const planeNo = Array.from(flight.querySelectorAll('.num'))
            .map(el => (el as HTMLDivElement).innerText?.trim() || '')
            .join(',');
          const flightInfo = {
            airlineName: airlineName,
            planeNo: planeNo,
            departTime:
              (
                flight.querySelector('.sep-lf h2') as HTMLDivElement
              )?.innerText?.trim() || '',
            departAirport:
              (
                flight.querySelector('.sep-lf .airport') as HTMLDivElement
              )?.innerText?.trim() || '',
            arriveTime:
              (
                flight.querySelector('.sep-rt h2') as HTMLDivElement
              )?.innerText?.trim() ||
              '' +
                (
                  flight.querySelector('.daycross') as HTMLDivElement
                )?.innerText?.trim() ||
              '',
            arriveAirport:
              (
                flight.querySelector('.sep-rt .airport') as HTMLDivElement
              )?.innerText?.trim() || '',
            transfer:
              (flight.querySelector('.trans') as HTMLDivElement)?.innerText
                ?.trim()
                .replace(/\n/, ',') || '',
            price:
              (
                flight.querySelector('.fix_price') as HTMLDivElement
              )?.getAttribute('title') || '',
            isTransfer: false
          };

          return flightInfo;
        });
      }
    );
    nodes.push(...list);
    await page.waitForTimeout(1000); // 等待1秒，不然太假了
    const nextPageButton = await page.getByText('下一页');
    const nextPageButtonDisabled = await nextPageButton.getAttribute('class');
    // 如果没有下一页，直接返回结果
    if (nextPageButtonDisabled?.includes('page-link-disabled')) {
      break;
    }
    // 点击下一页
    await nextPageButton.click();
  }
  await browser.close();
  return {flightInfo: nodes, url};
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

function flightInfo2Markdown(flightInfo: FlightInfo[]) {
  return (
    `
| 航空公司 | 航班号 | 出发时间 | 出发机场 | 到达时间 | 到达机场 | 中转 | 经停/中转/通程 | 价格 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | \n` +
    flightInfo
      .map(
        flight =>
          `| ${flight.airlineName} | ${flight.planeNo} | ${
            flight.departTime
          } | ${flight.departAirport} | ${flight.arriveTime} | ${
            flight.arriveAirport
          } | ${flight.isTransfer ? '是' : '否'} | ${
            flight.transfer || '-'
          } | ${flight.price} |`
      )
      .join('\n')
  );
}

server.addTool({
  name: 'getFlightInfo',
  description: '查询航班信息，支持携程和飞猪',
  parameters: z.object({
    from: z.string().describe('出发城市'),
    to: z.string().describe('到达城市'),
    date: z.string().describe('出发日期，格式为YYYY-MM-DD')
  }),
  execute: async ({from, to, date}) => {
    // 获取出发城市和到达城市的代码
    const [depCity, arrCity] = await Promise.all([
      getCityCode(from),
      getCityCode(to)
    ]);
    const data = {
      depCity,
      arrCity,
      depDate: date
    };
    const [
      {flightInfo: flightInfoByCtrip, url: urlCtrip},
      {flightInfo: flightInfoByFliggy, url: urlFliggy},
      {flightInfo: flightInfoByQunar, url: urlQunar}
    ] = await Promise.all([
      getFlightInfoByCtrip(data),
      getFlightInfoByFliggy(data),
      getCityCodeByQunar({
        depCityName: from,
        depCity,
        arrCity,
        arrCityName: to,
        depDate: date
      })
    ]);

    return `查询到的航班信息：
${flightInfo2Markdown(flightInfoByCtrip)}
> 数据来源：[携程](${urlCtrip})

${flightInfo2Markdown(flightInfoByFliggy)}
> 数据来源：[飞猪](${urlFliggy})

${flightInfo2Markdown(flightInfoByQunar)}
> 数据来源：[去哪儿](${urlQunar})
`;
  }
});
