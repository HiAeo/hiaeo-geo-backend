#!/bin/bash
# Hiaeo MySQL 启动脚本

echo "🚀 启动 Hiaeo MySQL 容器..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker Desktop: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# 启动 MySQL 容器
docker compose -f docker-compose.mysql.yml up -d

echo "✅ MySQL 容器已启动!"
echo "   - 主机: localhost"
echo "   - 端口: 3306"
echo "   - 用户: root"
echo "   - 密码: hiaeo123456"
echo "   - 数据库: hiaeo"
echo ""
echo "📝 下一步:"
echo "   1. 重启后端服务: npm run start:dev"
echo "   2. TypeORM 将自动创建表结构"
