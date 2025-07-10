# Trip Search MCP Server

基于 Model Context Protocol (MCP) 的旅行搜索服务器，提供航班和火车票查询功能。

## 🚀 功能特性

- 🛫 **航班查询**：通过携程网站实时查询国内航班信息
- 🚄 **火车票查询**：通过12306网站实时查询高铁/火车票信息
- 🔄 **实时数据**：使用 Playwright 爬取最新的票务信息
- 📊 **结构化输出**：返回格式化的 Markdown 表格数据
- 🏗️ **模块化架构**：清晰的代码组织结构，易于维护和扩展
- 🚀 **高性能**：支持 PM2 集群模式部署
- 🔌 **MCP 兼容**：完全符合 Model Context Protocol 标准

## 📋 技术栈

- **Node.js** + **TypeScript** - 服务器端运行时
- **FastMCP** - MCP 协议实现框架
- **Playwright** - 网页自动化和数据爬取
- **Zod** - 运行时类型验证和模式定义
- **PM2** - 进程管理和部署
- **Docker** - 容器化部署支持

## 🛠️ 安装和运行

### 本地开发

1. **克隆项目并安装依赖：**
```bash
git clone <repository-url>
cd trip-search-mcp
npm install
```

2. **安装 Playwright 浏览器：**
```bash
npx playwright install
```

3. **启动开发服务器：**

**方式一：HTTP 服务模式（用于直接测试）**
```bash
npm run dev
```
服务端将在 `http://localhost:3000` 启动
客户端将在 `http://localhost:6277`启动

### 生产部署

#### 使用 PM2 部署

1. **构建项目：**
```bash
npm run build
```

2. **使用 PM2 启动：**
```bash
pm2 start ecosystem.config.js
```

3. **管理服务：**
```bash
pm2 status                    # 查看服务状态
pm2 logs trip-search-mcp     # 查看日志
pm2 restart trip-search-mcp  # 重启服务
pm2 stop trip-search-mcp     # 停止服务
```

#### 使用 Docker 部署

1. **构建 Docker 镜像：**
```bash
docker build -t trip-search-mcp .
```

2. **运行容器：**
```bash
docker run -p 3000:3000 trip-search-mcp
```

## 📖 API 工具说明

服务器提供以下 MCP 工具：

### 1. 航班查询 (getFlightInfo)

**功能描述**：通过携程查询航班信息

**输入参数**：
| 参数名 | 类型   | 必填 | 说明                       |
| ------ | ------ | ---- | -------------------------- |
| from   | string | 是   | 出发城市（如：北京、上海） |
| to     | string | 是   | 到达城市（如：广州、深圳） |
| date   | string | 是   | 出发日期，格式 YYYY-MM-DD  |

**返回数据**：
返回 Markdown 格式的航班信息表格，包含：
- 航空公司名称
- 航班号
- 出发/到达时间
- 出发/到达机场
- 是否中转
- 航班类型
- 价格信息

**使用示例**：
```
查询从北京到上海 2024-01-15 的航班信息
```

### 2. 火车票查询 (getTrainInfo)

**功能描述**：通过12306查询高铁信息

**输入参数**：
| 参数名     | 类型   | 必填 | 说明                                   |
| ---------- | ------ | ---- | -------------------------------------- |
| depStation | string | 是   | 出发城市或车站（如：北京南、上海虹桥） |
| arrStation | string | 是   | 到达城市或车站（如：广州南、深圳北）   |
| depDate    | string | 是   | 出发日期，格式 YYYY-MM-DD              |

**返回数据**：
返回 Markdown 格式的火车票信息表格，包含：
- 车次信息
- 出发/到达站点和时间
- 行程耗时
- 各座位类型的价格和余票信息

**使用示例**：
```
查询从北京南到上海虹桥 2024-01-15 的高铁票信息
```

## 📁 项目结构

```
trip-search-mcp/
├── src/
│   ├── index.ts                 # 主入口文件
│   └── services/
│       ├── mcpServer.ts         # MCP 服务器实例
│       ├── flightSearch.ts      # 航班查询服务和工具注册
│       ├── trainSearch.ts       # 火车票查询服务和工具注册
│       └── helper.ts            # 辅助工具函数
├── logs/                        # 日志文件目录
├── dist/                        # TypeScript 编译输出
├── .github/                     # GitHub Actions 配置
├── package.json                 # 项目依赖配置
├── tsconfig.json               # TypeScript 配置
├── ecosystem.config.js         # PM2 部署配置
├── Dockerfile                  # Docker 容器配置
└── README.md                   # 项目文档
```

## ⚙️ 配置说明

### 环境变量

可以通过 `.env` 文件配置：

```env
NODE_ENV=production
PORT=3000
# Playwright 选项
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000
```

### PM2 配置

`ecosystem.config.js` 包含生产环境配置：

```javascript
module.exports = {
  apps: [{
    name: 'trip-search-mcp',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

## 🔨 开发指南

### 添加新的查询服务

1. **创建服务文件**：在 `src/services/` 目录下创建新服务
2. **实现查询逻辑**：使用 Playwright 进行数据爬取
3. **注册 MCP 工具**：使用 `server.addTool()` 注册新工具
4. **导入服务**：在 `src/index.ts` 中导入服务文件

**示例代码结构**：
```typescript
// src/services/newService.ts
import server from './mcpServer';
import z from 'zod';

// 实现查询函数
export async function queryNewService(params: any) {
  // 查询逻辑
}

// 注册 MCP 工具
server.addTool({
  name: 'newTool',
  description: '新工具描述',
  parameters: z.object({
    // 参数定义
  }),
  execute: async (params) => {
    // 执行逻辑
  }
});
```

### 调试和测试

```bash
# 开发模式（HTTP 服务器）
npm run dev

# 构建项目
npm run build

# 运行测试
npm test

# 类型检查
npx tsc --noEmit
```

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 使用 Zod 进行运行时参数验证
- 遵循模块化架构，每个服务独立文件
- 使用 Prettier 进行代码格式化

## ⚠️ 注意事项

- **合规使用**：本项目仅用于学习和研究目的，请遵守相关网站的使用条款
- **访问频率**：请控制爬取频率，避免对目标网站造成过大负担
- **网络环境**：确保网络环境可以正常访问携程和12306网站
- **浏览器依赖**：首次运行需要下载 Playwright 浏览器，可能需要一些时间
- **生产部署**：生产环境建议配置代理池和请求限制

## 📄 许可证

MIT License

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 贡献类型

- 🐛 Bug 修复
- ✨ 新功能开发
- 📚 文档改进
- 🎨 代码优化
- 🧪 测试用例


## 🆘 问题排查

### 常见问题

1. **Playwright 安装失败**
   ```bash
   # 手动安装浏览器
   npx playwright install chromium
   ```

2. **网站访问超时**
   - 检查网络连接
   - 尝试使用代理

3. **MCP 连接失败**
   - 确认 FastMCP 版本兼容性
   - 检查客户端配置文件

### 获取帮助

- 📋 [提交 Issue](https://github.com/your-repo/issues)
- 💬 [讨论区](https://github.com/your-repo/discussions)
- 📧 联系维护者

---

*本项目基于 FastMCP 框架开发，遵循 Model Context Protocol 标准，为 AI 助手提供实时旅行信息查询能力。*
