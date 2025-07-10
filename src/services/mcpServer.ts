import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {z} from 'zod';
import {getFlightInfoByCtrip} from './tripSearch';

export const mcpServer = new McpServer({
  name: 'trip-search-mcp',
  version: '1.0.0',
  description: '提供航班、高铁查询服务的MCP服务器'
});

mcpServer.tool(
  'getFlightInfo',
  '获取航班信息',
  {
    from: z.string().describe('出发城市'),
    to: z.string().describe('到达城市'),
    date: z.string().describe('出发日期，格式为YYYY-MM-DD')
  },
  async ({from, to, date}) => {
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
      `| ${flight.airlineName} | ${flight.planeNo} | ${flight.departTime} | ${
        flight.departAirport
      } | ${flight.arriveTime} | ${flight.arriveAirport} | ${
        flight.isTransfer ? '是' : '否'
      } | ${flight.transfer || '-'} | ${flight.price} |`
  )
  .join('\n')}
> 数据来源：[携程](${url})
`
        }
      ]
    };
  }
);
