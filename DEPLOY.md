# 部署指南

## 本地开发部署（当前已运行）

服务已在本地成功启动！

- **访问地址**: http://localhost:3457
- **健康检查**: http://localhost:3457/health
- **汇率API**: http://localhost:3457/api/rates

### 停止服务
```bash
# 查找进程
ps aux | grep "node server.js"

# 杀死进程
kill <PID>
```

## Docker 部署

### 方式一：使用 Docker Compose（推荐）

```bash
cd ~/Projects/vps-calculator

# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 方式二：使用 Docker 命令

```bash
# 构建镜像
docker build -t vps-calculator:latest .

# 运行容器
docker run -d \
  --name vps-calculator \
  -p 3457:3457 \
  --restart unless-stopped \
  vps-calculator:latest

# 查看日志
docker logs -f vps-calculator

# 停止并删除
docker stop vps-calculator
docker rm vps-calculator
```

## 推送到 GitHub

代码已提交到本地仓库，使用以下命令推送：

```bash
cd ~/Projects/vps-calculator

# 如果使用 SSH（推荐）
git remote set-url origin git@github.com:jx453331958/vps-calculator.git
git push -u origin main

# 或使用 HTTPS
git remote set-url origin https://github.com/jx453331958/vps-calculator.git
git push -u origin main
```

## 生产环境部署建议

### 1. 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3457;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. 配置 HTTPS（Let's Encrypt）

```bash
sudo certbot --nginx -d your-domain.com
```

### 3. 使用 PM2 管理进程

```bash
npm install -g pm2

cd ~/Projects/vps-calculator
pm2 start server.js --name vps-calculator
pm2 save
pm2 startup
```

## 监控与维护

### 健康检查
```bash
curl http://localhost:3457/health
```

### 查看日志
```bash
# Docker
docker logs vps-calculator

# PM2
pm2 logs vps-calculator
```

### 更新部署
```bash
git pull
npm install
docker-compose down
docker-compose up -d --build
```
