#!/bin/bash

# PM2管理脚本
# 用法: ./pm2-manager.sh [start|stop|restart|reload|status|logs|monit|delete]

set -e

APP_NAME="trip-search-mcp"
ECOSYSTEM_FILE="ecosystem.config.js"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 检查PM2是否安装
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        print_message $RED "❌ PM2未安装，请先安装PM2: npm install -g pm2"
        exit 1
    fi
}

# 确保应用已构建
ensure_built() {
    if [ ! -d "dist" ]; then
        print_message $YELLOW "📦 应用未构建，正在构建..."
        npm run build
    fi
}

# 启动应用
start_app() {
    check_pm2
    ensure_built
    
    print_message $BLUE "🚀 启动 $APP_NAME..."
    pm2 start $ECOSYSTEM_FILE
    print_message $GREEN "✅ $APP_NAME 启动成功"
}

# 停止应用
stop_app() {
    check_pm2
    print_message $BLUE "⏹️  停止 $APP_NAME..."
    pm2 stop $APP_NAME
    print_message $GREEN "✅ $APP_NAME 停止成功"
}

# 重启应用
restart_app() {
    check_pm2
    ensure_built
    print_message $BLUE "🔄 重启 $APP_NAME..."
    pm2 restart $APP_NAME
    print_message $GREEN "✅ $APP_NAME 重启成功"
}

# 重载应用（零停机时间）
reload_app() {
    check_pm2
    ensure_built
    print_message $BLUE "🔄 重载 $APP_NAME..."
    pm2 reload $APP_NAME
    print_message $GREEN "✅ $APP_NAME 重载成功"
}

# 查看状态
show_status() {
    check_pm2
    print_message $BLUE "📊 PM2状态:"
    pm2 status
}

# 查看日志
show_logs() {
    check_pm2
    print_message $BLUE "📝 查看 $APP_NAME 日志:"
    pm2 logs $APP_NAME --lines 50
}

# 监控
monitor_app() {
    check_pm2
    print_message $BLUE "📈 启动PM2监控界面:"
    pm2 monit
}

# 删除应用
delete_app() {
    check_pm2
    print_message $YELLOW "⚠️  确定要删除 $APP_NAME 吗? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        pm2 delete $APP_NAME
        print_message $GREEN "✅ $APP_NAME 删除成功"
    else
        print_message $BLUE "取消删除操作"
    fi
}

# 显示帮助
show_help() {
    echo "PM2管理脚本 - Trip Search MCP"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "可用命令:"
    echo "  start     启动应用"
    echo "  stop      停止应用"
    echo "  restart   重启应用"
    echo "  reload    重载应用（零停机时间）"
    echo "  status    查看PM2状态"
    echo "  logs      查看应用日志"
    echo "  monit     启动PM2监控界面"
    echo "  delete    删除应用"
    echo "  help      显示此帮助信息"
}

# 主逻辑
case "${1:-help}" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        restart_app
        ;;
    reload)
        reload_app
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    monit)
        monitor_app
        ;;
    delete)
        delete_app
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_message $RED "❌ 未知命令: $1"
        show_help
        exit 1
        ;;
esac
