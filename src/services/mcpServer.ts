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
    const flightInfo = await getFlightInfoByCtrip({
      depCity: from,
      arrCity: to,
      depDate: date
    });
    return {
      content: [
        {
          type: 'text',
          text: `# 参数说明：\n
* airlineName: 航空公司名称\n
* planeNo: 航班号\n
* departTime: 出发时间\n
* departAirport: 出发机场\n
* arriveTime: 到达时间\n
* arriveAirport: 到达机场\n
* transfer: 是否中转，true为中转航班\n
* price: 价格\n
# 查询到的航班信息：\n${JSON.stringify(flightInfo, null, 2)}`
        }
      ]
    };
  }
);
