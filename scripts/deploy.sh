#!/bin/bash

# =============================================
# 魔鲸GEO 部署脚本
# =============================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
APP_NAME="hiaeo"
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$BACKEND_DIR/.env"

# 打印函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查环境
check_env() {
    log_info "检查环境配置..."
    
    if [ ! -f "$ENV_FILE" ]; then
        log_warn ".env 文件不存在，创建默认配置..."
        cat > "$ENV_FILE" << EOF
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=hiaeo

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT配置
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# 服务配置
NODE_ENV=production
PORT=3000

# AI引擎API Keys
DEEPSEEK_API_KEY=your-deepseek-api-key
KIMI_API_KEY=your-kimi-api-key
QWIN_API_KEY=your-qwen-api-key
DOUBAO_API_KEY=your-doubao-api-key
ZHIPU_API_KEY=your-zhipu-api-key
WENXIN_API_KEY=your-wenxin-api-key

# 支付配置
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_PRIVATE_KEY=your-alipay-private-key
ALIPAY_PUBLIC_KEY=your-alipay-public-key
WECHAT_APP_ID=your-wechat-app-id
WECHAT_MCH_ID=your-wechat-mch-id
WECHAT_API_KEY=your-wechat-api-key
EOF
    fi
    
    log_info "环境配置检查完成"
}

# 构建Docker镜像
build_docker() {
    log_info "构建Docker镜像..."
    
    cd "$BACKEND_DIR"
    
    docker build -t "$APP_NAME:latest" .
    
    log_info "Docker镜像构建完成: $APP_NAME:latest"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    cd "$BACKEND_DIR"
    
    # 加载环境变量
    export $(grep -v '^#' "$ENV_FILE" | xargs)
    
    docker-compose up -d
    
    log_info "服务启动完成"
}

# 停止服务
stop_services() {
    log_info "停止服务..."
    
    cd "$BACKEND_DIR"
    docker-compose down
    
    log_info "服务已停止"
}

# 数据库迁移
migrate_db() {
    log_info "执行数据库迁移..."
    
    cd "$BACKEND_DIR"
    
    # 等待数据库就绪
    log_info "等待数据库连接..."
    sleep 5
    
    docker-compose exec api npm run typeorm:migrate
    
    log_info "数据库迁移完成"
}

# 查看日志
logs() {
    cd "$BACKEND_DIR"
    docker-compose logs -f "$@"
}

# 查看服务状态
status() {
    cd "$BACKEND_DIR"
    docker-compose ps
}

# 清理
cleanup() {
    log_warn "清理Docker资源..."
    
    cd "$BACKEND_DIR"
    docker-compose down -v --rmi local
    
    log_info "清理完成"
}

# 显示帮助
show_help() {
    echo "魔鲸GEO 部署脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  build      构建Docker镜像"
    echo "  start      启动服务"
    echo "  stop       停止服务"
    echo "  restart    重启服务"
    echo "  migrate    执行数据库迁移"
    echo "  logs       查看日志 (可选: 服务名)"
    echo "  status     查看服务状态"
    echo "  cleanup    清理Docker资源"
    echo "  help       显示帮助"
    echo ""
}

# 主入口
case "${1:-help}" in
    check-env)
        check_env
        ;;
    build)
        check_env
        build_docker
        ;;
    start)
        check_env
        build_docker
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        start_services
        ;;
    migrate)
        migrate_db
        ;;
    logs)
        shift
        logs "$@"
        ;;
    status)
        status
        ;;
    cleanup)
        cleanup
        ;;
    help|*)
        show_help
        ;;
esac
