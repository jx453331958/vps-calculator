# VPS 剩余价值计算器

一个具有科技感的 VPS 剩余价值计算器，支持实时汇率转换和多币种显示。

## 功能特性

- 🌍 **实时汇率转换** - 集成 exchangerate-api.com 提供实时汇率数据
- 💱 **多币种支持** - 支持 USD, EUR, GBP, CNY, JPY, HKD, SGD, AUD, CAD
- 🎨 **科技感 UI** - 渐变色设计、流畅动画、响应式布局
- 📊 **详细统计** - 显示每日成本、使用进度、剩余价值等
- 🐳 **Docker 部署** - 开箱即用的容器化部署

## 快速开始

### 使用 Docker Compose（推荐）

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 手动运行

```bash
# 安装依赖
npm install

# 启动服务
npm start
```

访问 http://localhost:3457

## 使用说明

1. **输入购买信息**
   - 购买价格和货币类型
   - 已使用天数
   - 购买周期（月/年）

2. **查看计算结果**
   - 使用进度条
   - 每日成本
   - 已消耗价值
   - 剩余价值
   - 剩余天数

3. **多币种显示**
   - 自动将剩余价值转换为其他主流货币
   - 实时汇率，每小时更新

## 技术栈

- **前端**: HTML5, CSS3, Vanilla JavaScript
- **后端**: Node.js + Express
- **API**: exchangerate-api.com (免费汇率 API)
- **部署**: Docker + Docker Compose

## API 说明

### GET /api/rates
获取当前汇率数据（带缓存，1小时更新）

### GET /health
健康检查端点

## 环境变量

- `PORT`: 服务端口（默认: 3457）
- `NODE_ENV`: 运行环境（production/development）

## License

MIT
# Test push
