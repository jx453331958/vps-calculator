# VPS 剩余价值计算器 | VPS Remaining Value Calculator

[中文](#中文) | [English](#english)

---

## 中文

一个精致的 VPS 剩余价值计算器，支持实时汇率转换、多币种显示和中英双语切换。

**在线体验**: https://vps.ohminicat.com/

### 功能特性

- **实时汇率** - 集成 ExchangeRate-API，自动获取最新汇率，每小时更新
- **9 种货币** - 支持 USD、EUR、GBP、CNY、JPY、HKD、SGD、AUD、CAD
- **多币种对比** - 计算结果自动转换为其他 8 种货币，方便横向对比
- **中英双语** - 界面支持中文/English 一键切换，偏好自动保存
- **截图分享** - 支持一键复制截图到剪贴板或下载为图片
- **偏好记忆** - 自动保存货币选择、到期日期等偏好到本地
- **计算公式** - 完整展示计算过程，结果透明可验证
- **响应式设计** - 适配桌面、平板和手机
- **Docker 部署** - 开箱即用的容器化部署方案

### 快速开始

#### Docker Compose（推荐）

```bash
docker-compose up -d
```

#### 手动运行

```bash
npm install
npm start
```

访问 http://localhost:3457

### 使用说明

1. **输入 VPS 信息**
   - 购买金额和货币类型
   - 付款周期（月付 / 季付 / 半年付 / 年付）
   - 到期时间

2. **点击计算** - 或按 Enter 键快速计算

3. **查看结果**
   - 每日成本、剩余价值、剩余天数
   - 其他币种等值金额
   - 完整计算公式

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | HTML5 + Tailwind CSS + Vanilla JavaScript |
| 后端 | Node.js + Express |
| 汇率 | ExchangeRate-API（免费） |
| 日期 | Flatpickr |
| 截图 | modern-screenshot |
| 部署 | Docker + Docker Compose |

### API

| 端点 | 说明 |
|------|------|
| `GET /` | 主页面 |
| `GET /api/rates` | 获取汇率数据（缓存 1 小时） |
| `GET /health` | 健康检查 |

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3457` | 服务端口 |
| `NODE_ENV` | `development` | 运行环境 |

### License

MIT

---

## English

A sleek VPS remaining value calculator with real-time exchange rates, multi-currency display, and bilingual support.

**Live Demo**: https://vps.ohminicat.com/

### Features

- **Real-time Exchange Rates** - Powered by ExchangeRate-API, auto-refreshed hourly
- **9 Currencies** - USD, EUR, GBP, CNY, JPY, HKD, SGD, AUD, CAD
- **Multi-currency Comparison** - Results automatically converted to all other currencies
- **Bilingual UI** - Toggle between Chinese and English with one click
- **Screenshot & Share** - Copy results to clipboard or download as image
- **Preference Persistence** - Currency selection and expiry date saved locally
- **Formula Display** - Transparent calculation process with full formula breakdown
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Docker Ready** - One-command deployment with Docker Compose

### Quick Start

#### Docker Compose (Recommended)

```bash
docker-compose up -d
```

#### Manual

```bash
npm install
npm start
```

Visit http://localhost:3457

### Usage

1. **Enter VPS Info**
   - Purchase price and currency
   - Payment cycle (monthly / quarterly / semi-annual / annual)
   - Expiry date

2. **Calculate** - Click the button or press Enter

3. **View Results**
   - Daily cost, remaining value, remaining days
   - Equivalent amounts in other currencies
   - Full calculation formula

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5 + Tailwind CSS + Vanilla JavaScript |
| Backend | Node.js + Express |
| Rates | ExchangeRate-API (free) |
| Date Picker | Flatpickr |
| Screenshot | modern-screenshot |
| Deployment | Docker + Docker Compose |

### API

| Endpoint | Description |
|----------|-------------|
| `GET /` | Main page |
| `GET /api/rates` | Exchange rates (cached 1 hour) |
| `GET /health` | Health check |

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3457` | Server port |
| `NODE_ENV` | `development` | Runtime environment |

### License

MIT
