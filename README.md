# Trip Search MCP Server

一个基于Model Context Protocol (MCP)的航班搜索服务器，通过携程网站爬取航班信息。

## 功能特性

- 🛫 支持查询国内外航班信息
- 🌐 基于携程网站数据源
- 🔧 提供MCP协议接口
- 🚀 使用TypeScript开发
- 🎭 使用Playwright进行网页自动化

## 安装依赖

```bash
npm install
```

## 运行

### 开发模式
```bash
npm run dev
```

### MCP服务器模式
```bash
npm run mcp:server
```

### MCP客户端模式
```bash
npm run mcp:client
```

### 构建生产版本
```bash
npm run build
npm start
```

## 测试

```bash
npm test
```

## API接口

### 获取航班信息
通过MCP协议调用`getFlightInfo`工具：

- `from`: 出发城市
- `to`: 到达城市  
- `date`: 出发日期 (YYYY-MM-DD格式)

## 技术栈

- Node.js + TypeScript
- Koa.js Web框架
- Playwright 网页自动化
- Model Context Protocol SDK
- Jest 测试框架

## 许可证

MIT License
