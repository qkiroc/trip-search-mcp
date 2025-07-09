#!/bin/bash

# 阿里云容器镜像服务部署脚本
# 使用方法: ./deploy.sh [tag]

set -e

# 配置信息
REGISTRY="crpi-rif1w3fzrh6d2pln.cn-beijing.personal.cr.aliyuncs.com"
NAMESPACE="qhy_mcp"
IMAGE_NAME="mcp"
USERNAME="17723942663"

# 获取版本标签
TAG=${1:-"latest"}
FULL_IMAGE_NAME="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${TAG}"

echo "🚀 开始部署到阿里云容器镜像服务..."
echo "镜像名称: ${FULL_IMAGE_NAME}"

# 构建镜像
echo "📦 构建Docker镜像..."
docker build -t ${IMAGE_NAME}:${TAG} .

# 标记镜像
echo "🏷️  标记镜像..."
docker tag ${IMAGE_NAME}:${TAG} ${FULL_IMAGE_NAME}

# 登录阿里云容器镜像服务
echo "🔐 登录阿里云容器镜像服务..."
echo "请输入密码："
docker login --username=${USERNAME} ${REGISTRY}

# 推送镜像
echo "📤 推送镜像到阿里云..."
docker push ${FULL_IMAGE_NAME}

echo "✅ 部署完成！"
echo "镜像地址: ${FULL_IMAGE_NAME}"
echo ""
echo "拉取镜像命令:"
echo "docker pull ${FULL_IMAGE_NAME}"
echo ""
echo "运行容器命令:"
echo "docker run -d -p 3000:3000 ${FULL_IMAGE_NAME}"
