# 多阶段构建，优化最终镜像大小
# 第一阶段：构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 第二阶段：运行阶段
FROM node:20-alpine AS runtime

# 安装PM2全局
RUN npm install -g pm2

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 从构建阶段复制构建结果和必要文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/ecosystem.config.js ./ecosystem.config.js

# 创建日志目录
RUN mkdir -p logs

# 暴露端口
EXPOSE 3000

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 设置正确的权限
RUN chown -R nodejs:nodejs /app

# 切换到非root用户
USER nodejs

# 使用PM2启动应用
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
