# 使用官方 Node.js 运行时作为父镜像（使用最新LTS版本）
FROM node:20-alpine

# 安装PM2全局
RUN npm install -g pm2

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 创建日志目录
RUN mkdir -p logs

# 暴露端口（根据您的应用调整）
EXPOSE 3000

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 更改文件所有者
RUN chown -R nodejs:nodejs /app
USER nodejs

# 使用PM2启动应用
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
