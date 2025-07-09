# Trip Search MCP Deployment Makefile

.PHONY: build test deploy clean help

# 变量定义
REGISTRY=crpi-rif1w3fzrh6d2pln.cn-beijing.personal.cr.aliyuncs.com
NAMESPACE=qhy_mcp
IMAGE_NAME=mcp
TAG?=latest
LOCAL_IMAGE=${IMAGE_NAME}:${TAG}
REMOTE_IMAGE=${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${TAG}

help: ## 显示帮助信息
	@echo "可用的命令:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## 安装依赖
	npm install

build-app: ## 构建应用
	npm run build

test: ## 运行测试
	npm test

build-docker: ## 构建Docker镜像
	docker build -t ${LOCAL_IMAGE} .

test-local: ## 本地测试部署
	./test-deploy.sh

tag: ## 标记镜像
	docker tag ${LOCAL_IMAGE} ${REMOTE_IMAGE}

login: ## 登录阿里云容器镜像服务
	docker login --username=17723942663 ${REGISTRY}

push: ## 推送镜像到阿里云
	docker push ${REMOTE_IMAGE}

deploy: build-docker tag login push ## 完整部署流程
	@echo "✅ 部署完成! 镜像: ${REMOTE_IMAGE}"

run-local: ## 本地运行容器
	docker run -d -p 3000:3000 --name trip-search-mcp ${LOCAL_IMAGE}

stop-local: ## 停止本地容器
	docker stop trip-search-mcp || true
	docker rm trip-search-mcp || true

compose-up: ## 使用docker-compose启动
	docker-compose up -d

compose-down: ## 使用docker-compose停止
	docker-compose down

logs: ## 查看容器日志
	docker logs -f trip-search-mcp

clean: ## 清理镜像和容器
	docker stop trip-search-mcp || true
	docker rm trip-search-mcp || true
	docker rmi ${LOCAL_IMAGE} || true
	docker rmi ${REMOTE_IMAGE} || true

# PM2相关命令
pm2-start: build-app ## 使用PM2启动应用
	./pm2-manager.sh start

pm2-stop: ## 停止PM2应用
	./pm2-manager.sh stop

pm2-restart: build-app ## 重启PM2应用
	./pm2-manager.sh restart

pm2-reload: build-app ## 重载PM2应用（零停机）
	./pm2-manager.sh reload

pm2-status: ## 查看PM2状态
	./pm2-manager.sh status

pm2-logs: ## 查看PM2日志
	./pm2-manager.sh logs

pm2-monit: ## PM2监控界面
	./pm2-manager.sh monit

pm2-delete: ## 删除PM2应用
	./pm2-manager.sh delete

# Docker + PM2组合命令
build-pm2: ## 构建PM2版本的Docker镜像
	docker build -f Dockerfile.pm2 -t ${IMAGE_NAME}-pm2:${TAG} .

run-pm2: ## 运行PM2版本的容器
	docker run -d -p 3000:3000 --name trip-search-mcp-pm2 ${IMAGE_NAME}-pm2:${TAG}

compose-pm2: ## 使用PM2版本的docker-compose
	docker-compose --profile pm2 up -d

# 快速命令
quick-deploy: ## 快速部署（使用脚本）
	./deploy.sh ${TAG}

quick-pm2: ## 快速PM2部署
	./pm2-manager.sh start
