import {Context, Next} from 'koa';

export const errorHandler = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (err: any) {
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err : undefined
    };
    ctx.app.emit('error', err, ctx);
  }
};
