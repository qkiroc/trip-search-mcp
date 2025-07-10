import {chromium} from 'playwright';

interface TrainInfo {
  train: string; // 车次
  startStation: string; // 出发站
  endStation: string; // 到达站
  startTime: string; // 出发时间
  endTime: string; // 到达时间
  duration: string; // 历时
  // 票价信息
  // 商务座特等坐、优选一等座、一等座、二等座二等包座、高级软卧、软卧/动卧一等卧、硬卧二等卧、软座、硬座、无座、其他
  priceInfo: {
    price: string; // 票价
    ticketLeft: string; // 剩余票数
  }[];
}

/**
 * 通过12306查询火车信息
 * @param param0
 * @param param0.depStation 出发城市
 * @param param0.arrStation 到达城市
 * @param param0.depDate 出发日期，格式为 YYYY-MM-DD
 * @returns 火车信息列表和查询URL
 * @example
 * getTrainInfoBy12306({
 *  depCity: '北京', // 出发城市
 *  arrCity: '上海', // 到达城市
 *  depDate: '2023-10-01' // 出发日期
 * });
 * @see https://kyfw.12306.cn/otn/leftTicket/init
 */
export async function getTrainInfoBy12306({
  depStation, // 出发城市
  arrStation, // 到达城市
  depDate // 出发日期，格式为YYYY-MM-DD
}: {
  depStation: string;
  arrStation: string;
  depDate: string;
}) {
  const browser = await chromium.launch({headless: true});
  const page = await browser.newPage();
  const url = `https://kyfw.12306.cn/otn/leftTicket/init`;

  await page.goto(url);

  await page.fill('#fromStationText', depStation);
  await page.$eval(
    '#fromStation',
    (el, depStation) => {
      const code = (window as any).station_names
        .split('@')
        .find((code: string) => code.split('|')[1] === depStation);
      (el as HTMLInputElement).value = code ? code.split('|')[2] : '';
    },
    depStation
  );

  await page.fill('#toStationText', arrStation);
  await page.$eval(
    '#toStation',
    (el, arrStation) => {
      const code = (window as any).station_names
        .split('@')
        .find((code: string) => code.split('|')[1] === arrStation);
      (el as HTMLInputElement).value = code ? code.split('|')[2] : '';
    },
    arrStation
  );

  await page.fill('#train_date', depDate);

  await page.click('#query_ticket');

  await page.waitForSelector('#queryLeftTable');

  const nodes = await page.$eval('#queryLeftTable', tbody => {
    const trs = tbody.querySelectorAll('tr');
    let trainInfos: TrainInfo[] = [];
    for (const tr of trs) {
      if (tr.style.display === 'none') {
        continue; // 跳过空行
      }
      const tds = tr.querySelectorAll('td');
      const trainInfo: TrainInfo = {
        train: '',
        startStation: '',
        endStation: '',
        startTime: '',
        endTime: '',
        duration: '',
        priceInfo: []
      };
      for (const td of tds) {
        const colspan = td.getAttribute('colspan');
        if (colspan) {
          const train = (td.querySelector('.train a') as HTMLDivElement)
            ?.innerText;
          const cdz = (
            td.querySelector('.cdz') as HTMLDivElement
          )?.innerText.split('\n');
          const cds = (
            td.querySelector('.cds') as HTMLDivElement
          )?.innerText.split('\n');
          const duration = (td.querySelector('.ls') as HTMLDivElement)
            ?.innerText;
          trainInfo.train = train || '';
          trainInfo.startStation = cdz[0] || '';
          trainInfo.endStation = cdz[1] || '';
          trainInfo.startTime = cds[0] || '';
          trainInfo.endTime = cds[1] || '';
          trainInfo.duration = duration.replace('\n', ',') || '';
        } else {
          const ariaLabel = td.getAttribute('aria-label');
          if (ariaLabel) {
            const price = ariaLabel.match(/票价(.*?)，/)?.[1].trim() || '';
            const ticketLeft = ariaLabel.match(/余票(.*?)$/)?.[1].trim() || '-';
            trainInfo.priceInfo.push({
              price,
              ticketLeft
            });
          } else {
            trainInfo.priceInfo.push({
              price: '',
              ticketLeft: ''
            });
          }
        }
      }
      if (trainInfo.train) {
        trainInfos.push(trainInfo);
      }
    }
    return trainInfos;
  });

  await browser.close();

  return {
    trainInfo: nodes,
    url: url
  };
}
