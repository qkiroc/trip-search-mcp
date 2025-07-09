# 优化的单阶段构建，使用预构建的文件
FROM mcr.microsoft.com/playwright:v1.53.2-jammy

# 安装PM2全局
RUN npm install -g pm2

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 复制预构建的dist目录和必要文件
COPY dist ./dist
COPY ecosystem.config.js ./ecosystem.config.js

# 创建日志目录
RUN mkdir -p logs

# 暴露端口
EXPOSE 3000

# 使用PM2启动应用
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
