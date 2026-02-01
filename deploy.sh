#!/bin/bash
# 开发机上执行：构建并推送镜像
set -e

IMAGE="ghcr.io/jx453331958/vps-calculator"
TAG="${1:-latest}"

echo "🔨 构建镜像 ${IMAGE}:${TAG} ..."
docker build -t "${IMAGE}:${TAG}" .

echo "📤 推送镜像..."
docker push "${IMAGE}:${TAG}"

echo "✅ 完成！服务器上执行："
echo "   docker compose pull && docker compose up -d"
