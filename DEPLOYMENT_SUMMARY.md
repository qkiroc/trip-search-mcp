# 部署设置总结

## 📁 已创建的文件

### Docker相关
- `Dockerfile` - Docker镜像构建文件
- `Dockerfile.pm2` - PM2专用Docker文件
- `.dockerignore` - Docker构建忽略文件
- `docker-compose.yml` - 本地开发和测试配置

### PM2进程管理
- `ecosystem.config.js` - PM2配置文件
- `pm2-manager.sh` - PM2管理脚本
- `logs/` - PM2日志目录
- `PM2_GUIDE.md` - PM2详细使用指南

### GitHub Actions CI/CD
- `.github/workflows/docker-build-deploy.yml` - 主要的CI/CD流程
- `.github/workflows/manual-deploy.yml` - 手动部署流程

### 部署脚本
- `deploy.sh` - 阿里云部署脚本
- `test-deploy.sh` - 本地测试脚本
- `Makefile` - 便捷的部署命令

### 配置文件
- `.env.example` - 环境变量示例
- `DEPLOYMENT.md` - 详细部署指南

### 代码更新
- `src/routes.ts` - 添加了健康检查和根路径端点
- `src/index.ts` - 更新了端口配置
- `README.md` - 更新了部署相关信息

## 🚀 快速开始

### 1. 本地测试
```bash
# 测试构建和运行
./test-deploy.sh

# 或使用Make命令
make test-local
```

### 2. PM2进程管理
```bash
# 使用PM2启动应用
./pm2-manager.sh start

# 查看PM2状态
./pm2-manager.sh status

# 查看日志
./pm2-manager.sh logs

# 或使用Make命令
make pm2-start
make pm2-status
make pm2-logs
```

### 3. 部署到阿里云
```bash
# 使用部署脚本
./deploy.sh

# 或使用Make命令
make deploy
```

### 4. 设置GitHub Actions
在GitHub仓库设置中添加以下Secrets：
- `ACR_USERNAME`: 17723942663
- `ACR_PASSWORD`: 阿里云容器镜像服务密码

推送到main分支将自动触发部署。

## 📋 部署检查清单

- [ ] Docker已安装
- [ ] PM2已安装 (`npm install -g pm2`)
- [ ] 项目构建成功 (`npm run build`)
- [ ] 本地测试通过 (`./test-deploy.sh`)
- [ ] PM2本地测试通过 (`./pm2-manager.sh start`)
- [ ] 阿里云容器镜像服务已开通
- [ ] GitHub Secrets已配置
- [ ] 推送代码到GitHub

## 🎯 镜像地址

- **完整镜像地址**: `crpi-rif1w3fzrh6d2pln.cn-beijing.personal.cr.aliyuncs.com/qhy_mcp/mcp:latest`
- **VPC地址**: `crpi-rif1w3fzrh6d2pln-vpc.cn-beijing.personal.cr.aliyuncs.com/qhy_mcp/mcp:latest`

## 🔄 工作流说明

1. **本地开发** → 推送到GitHub
2. **GitHub Actions** → 自动构建和测试
3. **Docker构建** → 创建多架构镜像
4. **推送到阿里云** → 自动部署到容器镜像服务
5. **安全扫描** → 检查漏洞

## 💡 使用建议

1. **本地开发**: 使用 `npm run dev` 进行开发
2. **生产部署**: 使用PM2管理进程 (`make pm2-start`)
3. **容器部署**: 使用Docker + PM2 (`make build-pm2`)
4. **监控管理**: 使用 `make pm2-monit` 监控应用状态
5. **日志查看**: 使用 `make pm2-logs` 查看实时日志
6. **零停机更新**: 使用 `make pm2-reload` 进行热更新
7. **定期维护**: 定期检查和更新基础镜像

## 📚 相关文档

- `PM2_GUIDE.md` - PM2详细使用指南
- `DEPLOYMENT.md` - 完整部署指南
- `README.md` - 项目概述和快速开始

一切就绪！现在您可以使用PM2轻松管理进程，并自动部署到阿里云了。🎉
