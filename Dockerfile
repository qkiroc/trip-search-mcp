# 优化的单阶段构建，使用预构建的文件
FROM node:20-alpine AS runtime

# 安装PM2全局
RUN npm install -g pm2

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production && npm cache clean --force

RUN apk update && apk add --no-cache \
  libgbm \
  nss \
  atk \
  cups \
  x11-libs \
  xcomposite \
  xdamage \
  xrandr \
  cairo \
  dbus \
  gdk-pixbuf \
  alsa-lib \
  nspr \
  libxss \
  libxtst && \
  npx playwright install

# 复制预构建的dist目录和必要文件
COPY dist ./dist
COPY ecosystem.config.js ./ecosystem.config.js

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
