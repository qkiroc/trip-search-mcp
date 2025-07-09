import {Context, Next} from 'koa';

export const cors = async (ctx: Context, next: Next) => {
  // 设置 CORS 头
  ctx.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  });

  // 处理预检请求
  if (ctx.method === 'OPTIONS') {
    ctx.status = 200;
    return;
  }

  await next();
};
