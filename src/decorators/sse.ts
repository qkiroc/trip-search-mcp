import {Context} from 'koa';

export function SSE() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (ctx: Context, ...args: any[]) {
      // 设置状态码
      ctx.status = 200;

      // 设置 SSE 响应头
      ctx.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      // 绕过 Koa 的响应处理
      ctx.respond = false;

      // 调用原始方法
      return await originalMethod.apply(this, [ctx, ...args]);
    };

    return descriptor;
  };
}
