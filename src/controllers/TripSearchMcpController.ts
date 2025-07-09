import {SSEServerTransport} from '@modelcontextprotocol/sdk/server/sse.js';
import {Controller, Get, Post} from '../decorators/router';
import {Context} from 'koa';
import {mcpServer} from '../services/mcpServer';
import {Query} from '../decorators/query';

const connections: Map<string, SSEServerTransport> = new Map();

@Controller('')
export class TripSearchMcpController {
  @Get('/sse')
  async sse(ctx: Context) {
    const res = ctx.res;

    const transport = new SSEServerTransport('/messages', res);
    // 获取sessionId
    const sessionId = transport.sessionId;
    console.log(`[${new Date().toISOString()}] 新的SSE连接建立: ${sessionId}`);

    // 注册连接
    connections.set(sessionId, transport);

    await mcpServer.connect(transport);

    ctx.status = 200;

    ctx.respond = false;

    res.on('close', () => {
      console.log(`[${new Date().toISOString()}] SSE连接关闭: ${sessionId}`);
      connections.delete(sessionId);
    });

    res.on('error', err => {
      console.error(
        `[${new Date().toISOString()}] SSE连接错误: ${sessionId}`,
        err
      );
      connections.delete(sessionId);
    });
  }

  @Post('/messages')
  async postMessages(
    ctx: Context,
    @Query()
    query: {
      sessionId: string;
    }
  ) {
    const {req, res} = ctx;
    try {
      console.log(`[${new Date().toISOString()}] 收到客户端消息:`, query);
      const sessionId = query.sessionId as string;

      // 查找对应的SSE连接并处理消息
      if (connections.size > 0) {
        const transport = connections.get(sessionId);
        // 使用transport处理消息
        if (transport) {
          ctx.status = 200;
          ctx.respond = false;
          await transport.handlePostMessage(req, res);
        } else {
          throw new Error('没有活跃的SSE连接');
        }
      } else {
        throw new Error('没有活跃的SSE连接');
      }
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] 处理客户端消息失败:`, error);
      ctx.status = 500;
      return {
        error: '处理消息失败',
        message: error.message
      };
    }
  }
}
