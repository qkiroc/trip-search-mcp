import dotenv from 'dotenv';
dotenv.config();
import z from 'zod';
import {getFlightInfoByCtrip} from './services/flightSearch';
import {getTrainInfoBy12306} from './services/trainSearch';
import {FastMCP} from 'fastmcp';

async function startServer() {
  const server = new FastMCP({
    name: 'trip-search-mcp',
    version: '2.0.0'
  });

  server.addTool({
    name: 'getHotelInfo',
    description: '通过携程查询酒店信息',
    parameters: z.object({
      from: z.string().describe('出发城市'),
      to: z.string().describe('到达城市'),
      date: z.string().describe('出发日期，格式为YYYY-MM-DD')
    }),
    execute: async ({from, to, date}) => {
      const {flightInfo, url} = await getFlightInfoByCtrip({
        depCity: from,
        arrCity: to,
        depDate: date
      });
      return {
        content: [
          {
            type: 'text',
            text: `查询到的航班信息：
    | 航空公司 | 航班号 | 出发时间 | 出发机场 | 到达时间 | 到达机场 | 中转 | 经停/中转/通程 | 价格 |
    | --- | --- | --- | --- | --- | --- | --- | --- |
    ${flightInfo
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
      .join('\n')}
    > 数据来源：[携程](${url})
    `
          }
        ]
      };
    }
  });

  server.addTool({
    name: 'getTrainInfo',
    description: '通过12306查询高铁信息',
    parameters: z.object({
      depStation: z.string().describe('出发城市或车站'),
      arrStation: z.string().describe('到达城市或车站'),
      depDate: z.string().describe('出发日期，格式为YYYY-MM-DD')
    }),
    execute: async ({depStation, arrStation, depDate}) => {
      const {trainInfo, url} = await getTrainInfoBy12306({
        depStation,
        arrStation,
        depDate
      });
      return {
        content: [
          {
            type: 'text',
            text: `查询到的高铁信息：
| 车次 | 出发站 | 到达站 | 出发时间 | 到达时间 | 历时 | 商务座特等坐 | 优选一等座 | 一等座 | 二等座二等包座 | 高级软卧 | 软卧/动卧一等卧 | 硬卧二等卧 | 软座 | 硬座 | 无座 | 其他 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${trainInfo
  .map(
    train =>
      `| ${train.train} | ${train.startStation} | ${train.endStation} | ${
        train.startTime
      } | ${train.endTime} | ${train.duration} | ${train.priceInfo
        .map(n => (n.price ? `${n.price}，余票${n.ticketLeft}` : '-'))
        .join(' | ')} |`
  )
  .join('\n')}
> 数据来源：[12306](${url})`
          }
        ]
      };
    }
  });

  server
    .start({
      transportType: 'httpStream',
      httpStream: {port: 3000}
    })
    .then(() => {
      console.log('FastMCP server is running on http://localhost:3000');
    })
    .catch(err => {
      console.error('Failed to start FastMCP server:', err);
    });
}

startServer().catch(console.error);
