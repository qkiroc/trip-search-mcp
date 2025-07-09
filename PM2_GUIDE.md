# PM2进程管理配置指南

## 概述

本项目已集成PM2进程管理器，提供了强大的进程管理、监控、自动重启和日志管理功能。

## 文件说明

### 配置文件
- `ecosystem.config.js` - PM2主配置文件
- `pm2-manager.sh` - PM2管理脚本
- `Dockerfile.pm2` - PM2专用的Docker文件

### 日志目录
- `logs/` - PM2日志存储目录
  - `combined.log` - 合并日志
  - `out.log` - 标准输出日志
  - `error.log` - 错误日志

## 本地开发使用

### 安装PM2
```bash
# 全局安装PM2
npm install -g pm2

# 或使用项目依赖中的PM2
npm install
```

### 基本命令
```bash
# 使用管理脚本（推荐）
./pm2-manager.sh start      # 启动应用
./pm2-manager.sh stop       # 停止应用
./pm2-manager.sh restart    # 重启应用
./pm2-manager.sh reload     # 零停机重载
./pm2-manager.sh status     # 查看状态
./pm2-manager.sh logs       # 查看日志
./pm2-manager.sh monit      # 监控界面

# 使用npm脚本
npm run start:pm2          # 启动
npm run stop:pm2           # 停止
npm run restart:pm2        # 重启
npm run reload:pm2         # 重载
npm run status:pm2         # 状态
npm run logs:pm2           # 日志
npm run monit:pm2          # 监控

# 使用Make命令
make pm2-start            # 启动
make pm2-stop             # 停止
make pm2-restart          # 重启
make pm2-reload           # 重载
make pm2-status           # 状态
make pm2-logs             # 日志
make pm2-monit            # 监控
```

## 生产环境部署

### Docker部署
```bash
# 构建PM2版本的镜像
make build-pm2

# 运行PM2容器
make run-pm2

# 使用docker-compose（PM2版本）
make compose-pm2
```

### 进程监控
PM2提供了丰富的监控功能：

1. **基本状态监控**
   ```bash
   pm2 status
   ```

2. **实时监控界面**
   ```bash
   pm2 monit
   ```

3. **内存和CPU监控**
   ```bash
   pm2 show trip-search-mcp
   ```

### 日志管理
```bash
# 查看实时日志
pm2 logs trip-search-mcp

# 查看最近50行日志
pm2 logs trip-search-mcp --lines 50

# 清空日志
pm2 flush

# 重载日志（日志轮转）
pm2 reloadLogs
```

## 配置说明

### ecosystem.config.js关键配置

```javascript
{
  name: 'trip-search-mcp',           // 应用名称
  script: './dist/index.js',         // 启动脚本
  instances: 1,                      // 实例数量（可设置为'max'使用所有CPU）
  exec_mode: 'fork',                 // 执行模式（fork/cluster）
  max_memory_restart: '1G',          // 内存限制自动重启
  
  // 环境变量
  env: {
    NODE_ENV: 'production',
    PORT: 3000
  },
  
  // 日志配置
  log_file: './logs/combined.log',
  out_file: './logs/out.log',
  error_file: './logs/error.log',
  
  // 自动重启配置
  min_uptime: '10s',                 // 最小运行时间
  max_restarts: 10,                  // 最大重启次数
  
  // 进程管理
  kill_timeout: 5000,                // 杀死进程超时时间
  restart_delay: 4000                // 重启延迟
}
```

## 集群模式

如果需要使用集群模式（充分利用多核CPU），可以修改配置：

```javascript
// ecosystem.config.js
{
  instances: 'max',        // 使用所有CPU核心
  exec_mode: 'cluster'     // 集群模式
}
```

或者创建集群专用配置：
```bash
# 启动集群模式
pm2 start ecosystem.config.js --env production
```

## 高级功能

### 1. 优雅停机
PM2支持优雅停机，确保正在处理的请求完成后再停止进程。

### 2. 零停机部署
```bash
# 使用reload实现零停机更新
pm2 reload trip-search-mcp
```

### 3. 内存监控和限制
当应用超过设定内存限制时自动重启：
```javascript
max_memory_restart: '1G'
```

### 4. 健康检查
PM2可以配置健康检查URL：
```javascript
health_check_url: 'http://localhost:3000/health'
```

## 故障排除

### 常见问题

1. **应用无法启动**
   ```bash
   # 检查应用是否构建
   npm run build
   
   # 查看错误日志
   pm2 logs trip-search-mcp --err
   ```

2. **内存泄漏**
   ```bash
   # 监控内存使用
   pm2 monit
   
   # 设置内存限制
   max_memory_restart: '512M'
   ```

3. **端口冲突**
   ```bash
   # 检查端口占用
   lsof -i :3000
   
   # 修改端口配置
   PORT=3001 pm2 restart trip-search-mcp
   ```

### 日志分析
```bash
# 查看错误日志
tail -f logs/error.log

# 查看合并日志
tail -f logs/combined.log

# 使用PM2查看日志
pm2 logs trip-search-mcp --raw
```

## 性能优化

### 1. 预热应用
可以配置应用预热时间：
```javascript
health_check_grace_period: 3000
```

### 2. 实例数量优化
- **I/O密集型应用**: instances = CPU核心数 × 2
- **CPU密集型应用**: instances = CPU核心数
- **混合型应用**: instances = CPU核心数 × 1.5

### 3. 内存优化
```javascript
node_args: ['--max-old-space-size=1024']  // 限制V8堆内存
```

## 监控集成

PM2可以与各种监控服务集成：

1. **PM2 Plus** (官方监控服务)
2. **Keymetrics** (企业级监控)
3. **自定义监控** (通过PM2 API)

## 部署最佳实践

1. **使用生态系统文件**: 始终使用 `ecosystem.config.js`
2. **环境隔离**: 为不同环境配置不同的环境变量
3. **日志轮转**: 定期清理和归档日志
4. **监控告警**: 设置内存、CPU、错误率告警
5. **优雅停机**: 确保应用正确处理 SIGTERM 信号
6. **健康检查**: 配置应用健康检查端点

通过以上配置，您的应用将具备企业级的进程管理能力！
