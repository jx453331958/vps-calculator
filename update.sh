#!/bin/bash
# 服务器一键更新脚本
set -e
cd "$(dirname "$0")"

echo "📥 拉取最新代码..."
git pull

echo "🔨 构建并重启容器..."
docker compose up -d --build

echo "✅ 更新完成！"
docker compose ps
