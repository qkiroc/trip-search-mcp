import dotenv from 'dotenv';
dotenv.config();
import Koa from 'koa';
import {createServer} from 'http';
import router from './routes';
import {errorHandler} from './middleware/errorHandler';
import {logger} from './middleware/logger';

const app = new Koa();

// 使用 bodyParser 会提前消耗请求体，导致后续的 SSE 连接无法正常工作
// 这里注释掉 bodyParser 的使用，SSE 连接会直接处理请求
// app.use(
//   bodyParser({
//     enableTypes: ['json', 'form', 'text']
//   })
// );

app.use(router.routes()).use(router.allowedMethods());
app.use(errorHandler);
app.use(logger);

// 创建HTTP服务器
const server = createServer(app.callback());

server.listen(3001);
console.log('🚀 Server is running on http://localhost:3001');
