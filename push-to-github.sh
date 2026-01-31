#!/bin/bash

echo "════════════════════════════════════════════════════════"
echo "  推送 VPS Calculator 到 GitHub"
echo "════════════════════════════════════════════════════════"
echo ""

cd ~/Projects/vps-calculator

echo "📋 Git 状态检查..."
git status --short
echo ""

echo "🔗 远程仓库配置..."
git remote -v
echo ""

echo "是否使用 SSH 方式推送? (推荐，需要配置 SSH Key)"
echo "  [1] SSH (git@github.com)"
echo "  [2] HTTPS (需要输入用户名密码)"
read -p "请选择 [1/2]: " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "🔑 配置 SSH 远程地址..."
    git remote set-url origin git@github.com:jx453331958/vps-calculator.git
    echo "✓ SSH 地址已配置"
else
    echo ""
    echo "🔑 配置 HTTPS 远程地址..."
    git remote set-url origin https://github.com/jx453331958/vps-calculator.git
    echo "✓ HTTPS 地址已配置"
fi

echo ""
echo "🚀 开始推送到 GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功！"
    echo ""
    echo "🌐 GitHub 仓库地址："
    echo "   https://github.com/jx453331958/vps-calculator"
    echo ""
else
    echo ""
    echo "❌ 推送失败！"
    echo ""
    echo "💡 可能的原因："
    echo "   1. SSH Key 未配置（选择SSH方式时）"
    echo "   2. GitHub 认证失败（选择HTTPS方式时）"
    echo "   3. 网络连接问题"
    echo ""
    echo "📖 解决方案："
    echo "   SSH: https://docs.github.com/cn/authentication/connecting-to-github-with-ssh"
    echo "   HTTPS: 使用 GitHub Personal Access Token"
fi
