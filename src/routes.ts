import Router from 'koa-router';
import {loadControllers} from './decorators/router';
import './controllers/TripSearchMcpController';

const router = new Router();

// 健康检查端点
router.get('/health', ctx => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'trip-search-mcp',
    version: process.env.npm_package_version || '1.0.0'
  };
});

// 将注册好的路由配置应用到 router 实例
loadControllers(router);

export default router;
