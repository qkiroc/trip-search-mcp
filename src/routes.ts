import Router from 'koa-router';
import {loadControllers} from './decorators/router';
import './controllers/TripSearchMcpController';

const router = new Router();

// 将注册好的路由配置应用到 router 实例
loadControllers(router);

export default router;
