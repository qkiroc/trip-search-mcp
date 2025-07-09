import 'reflect-metadata';
import {Context} from 'koa';
import Router from 'koa-router';

// 存储所有路由配置
interface RouteDefinition {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  handler: (ctx: Context) => Promise<any> | any;
  target: any;
  propertyKey: string | symbol;
}

const routeDefinitions: RouteDefinition[] = [];

// HTTP方法装饰器工厂
function createMethodDecorator(
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
) {
  return (path: string): MethodDecorator => {
    return (
      target: Object,
      propertyKey: string | symbol,
      descriptor: TypedPropertyDescriptor<any>
    ): TypedPropertyDescriptor<any> => {
      const originalMethod = descriptor.value!;

      // 重写原始方法，将返回值设置到 ctx.body
      (descriptor as any).value = async function (
        ctx: Context,
        ...args: any[]
      ) {
        // 处理参数注入
        const bodyIndices =
          Reflect.getMetadata('body_indices', target, propertyKey) || [];
        const methodArgs = [ctx];

        const queryIndices =
          Reflect.getMetadata('query_indices', target, propertyKey) || [];

        // 注入 body 参数
        for (const index of bodyIndices) {
          methodArgs[index] = {
            ...(ctx.request.body as any)
          };
        }

        // 注入 query 参数
        for (const index of queryIndices) {
          methodArgs[index] = {
            ...(ctx.request.query as any)
          };
        }

        console.log(
          `请求url: ${ctx.request.url}, Args: ${JSON.stringify(methodArgs)}`
        );

        // 调用原始方法
        const result = await originalMethod.apply(this, methodArgs);
        console.log(
          `响应url: ${ctx.request.url}, Result: ${JSON.stringify(result)}`
        );
        // 设置响应体
        if (result !== undefined) {
          ctx.body = result;
        }
        return result;
      };

      routeDefinitions.push({
        path,
        method,
        handler: (descriptor as any).value,
        target,
        propertyKey
      });

      return descriptor;
    };
  };
}

// HTTP方法装饰器
export const Get = createMethodDecorator('get');
export const Post = createMethodDecorator('post');
export const Put = createMethodDecorator('put');
export const Delete = createMethodDecorator('delete');
export const Patch = createMethodDecorator('patch');

// 控制器装饰器
export function Controller(basePath: string = '') {
  return function <T extends {new (...args: any[]): {}}>(constructor: T) {
    const controllerRoutes = routeDefinitions.filter(
      route => route.target.constructor === constructor
    );

    // 为每个路由设置完整路径
    controllerRoutes.forEach(route => {
      const path = basePath + route.path;
      route.path = path;
    });

    return constructor;
  };
}

// 加载所有已注册的路由
export function loadControllers(router: Router) {
  routeDefinitions.forEach(route => {
    const {method, path, handler} = route;
    (router as any)[method](path, handler);
  });
}
