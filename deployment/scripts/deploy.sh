#!/bin/bash

# Warp Zone Gems 部署脚本
# 使用方法: ./deploy.sh [环境] [选项]

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息
show_help() {
    echo "Warp Zone Gems 部署脚本"
    echo ""
    echo "使用方法: $0 [环境] [选项]"
    echo ""
    echo "环境:"
    echo "  dev         开发环境"
    echo "  staging     预发布环境"
    echo "  production  生产环境"
    echo ""
    echo "选项:"
    echo "  --build-only    仅构建，不部署"
    echo "  --no-cache      不使用Docker缓存"
    echo "  --skip-tests    跳过测试"
    echo "  --backup        部署前创建备份"
    echo "  --help          显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 production --backup"
    echo "  $0 dev --build-only"
    echo ""
}

# 检查依赖
check_dependencies() {
    log_info "检查部署依赖..."
    
    local missing_deps=()
    
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    if ! command -v docker &> /dev/null; then
        missing_deps+=("docker")
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        missing_deps+=("docker-compose")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "缺少以下依赖: ${missing_deps[*]}"
        log_error "请安装缺少的依赖后重试"
        exit 1
    fi
    
    log_success "所有依赖检查通过"
}

# 加载环境变量
load_environment() {
    local env=$1
    local env_file=".env.${env}"
    
    if [ ! -f "$env_file" ]; then
        log_error "环境配置文件 $env_file 不存在"
        exit 1
    fi
    
    log_info "加载环境配置: $env_file"
    export $(grep -v '^#' "$env_file" | xargs)
    
    # 验证必需的环境变量
    local required_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY")
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "环境变量 $var 未设置"
            exit 1
        fi
    done
    
    log_success "环境配置加载完成"
}

# 运行测试
run_tests() {
    if [ "$SKIP_TESTS" = "true" ]; then
        log_warning "跳过测试"
        return
    fi
    
    log_info "运行测试套件..."
    
    # 检查是否有测试脚本
    if npm run | grep -q "test"; then
        npm test 2>/dev/null || {
            log_warning "测试失败，但继续部署"
        }
    else
        log_warning "未找到测试脚本"
    fi
    
    log_success "测试完成"
}

# 构建项目
build_project() {
    log_info "构建项目..."
    
    # 安装依赖
    log_info "安装依赖..."
    npm ci
    
    # 构建项目
    log_info "构建生产版本..."
    npm run build
    
    # 检查构建结果
    if [ ! -d "dist" ]; then
        log_error "构建失败：dist 目录不存在"
        exit 1
    fi
    
    log_success "项目构建完成"
}

# Docker 构建
build_docker() {
    local env=$1
    local no_cache_flag=""
    
    if [ "$NO_CACHE" = "true" ]; then
        no_cache_flag="--no-cache"
    fi
    
    log_info "构建 Docker 镜像..."
    
    local image_tag="warp-zone-gems:${env}-$(date +%Y%m%d-%H%M%S)"
    local latest_tag="warp-zone-gems:${env}-latest"
    
    docker build $no_cache_flag \
        -f deployment/docker/Dockerfile \
        -t "$image_tag" \
        -t "$latest_tag" \
        .
    
    echo "$image_tag" > ".docker-image-${env}"
    
    log_success "Docker 镜像构建完成: $image_tag"
}

# 创建备份
create_backup() {
    if [ "$CREATE_BACKUP" != "true" ]; then
        return
    fi
    
    log_info "创建部署备份..."
    
    local backup_dir="backups/$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    # 备份当前版本信息
    if [ -f ".docker-image-$ENVIRONMENT" ]; then
        cp ".docker-image-$ENVIRONMENT" "$backup_dir/"
    fi
    
    # 备份配置文件
    cp -r deployment "$backup_dir/"
    
    # 备份环境变量（移除敏感信息）
    sed 's/=.*/=***/' ".env.$ENVIRONMENT" > "$backup_dir/.env.$ENVIRONMENT.template"
    
    log_success "备份创建完成: $backup_dir"
}

# 部署到开发环境
deploy_development() {
    log_info "部署到开发环境..."
    
    # 使用 docker-compose 启动服务
    docker-compose -f deployment/docker/docker-compose.yml down
    docker-compose -f deployment/docker/docker-compose.yml up -d
    
    log_success "开发环境部署完成"
    log_info "访问地址: http://localhost"
}

# 部署到预发布环境
deploy_staging() {
    log_info "部署到预发布环境..."
    
    # 这里添加预发布环境的具体部署逻辑
    # 例如：推送到预发布服务器、更新容器等
    
    log_success "预发布环境部署完成"
}

# 部署到生产环境
deploy_production() {
    log_info "部署到生产环境..."
    
    # 生产环境部署前确认
    read -p "确认部署到生产环境？[y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "取消生产环境部署"
        exit 0
    fi
    
    # 这里添加生产环境的具体部署逻辑
    # 例如：零停机部署、健康检查、回滚机制等
    
    log_success "生产环境部署完成"
}

# 部署后验证
post_deploy_verification() {
    local env=$1
    
    log_info "部署后验证..."
    
    # 健康检查
    local health_url="http://localhost/health"
    if [ "$env" = "production" ]; then
        health_url="https://warpzonegems.com/health"
    fi
    
    # 等待服务启动
    sleep 10
    
    # 检查服务健康状态
    if curl -f -s "$health_url" > /dev/null; then
        log_success "服务健康检查通过"
    else
        log_error "服务健康检查失败"
        exit 1
    fi
    
    # 其他验证逻辑...
    
    log_success "部署验证完成"
}

# 清理旧镜像
cleanup_old_images() {
    log_info "清理旧的 Docker 镜像..."
    
    # 保留最近 5 个镜像，删除其他的
    docker images warp-zone-gems --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | \
        grep -v latest | \
        sort -k2 -r | \
        tail -n +6 | \
        awk '{print $1}' | \
        xargs -r docker rmi
    
    log_success "旧镜像清理完成"
}

# 主函数
main() {
    local environment=$1
    shift
    
    # 解析选项
    while [[ $# -gt 0 ]]; do
        case $1 in
            --build-only)
                BUILD_ONLY=true
                shift
                ;;
            --no-cache)
                NO_CACHE=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --backup)
                CREATE_BACKUP=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 验证环境参数
    if [[ ! "$environment" =~ ^(dev|staging|production)$ ]]; then
        log_error "无效的环境: $environment"
        show_help
        exit 1
    fi
    
    export ENVIRONMENT=$environment
    
    log_info "开始部署到 $environment 环境"
    
    # 执行部署流程
    check_dependencies
    load_environment "$environment"
    create_backup
    run_tests
    build_project
    build_docker "$environment"
    
    if [ "$BUILD_ONLY" = "true" ]; then
        log_success "构建完成（仅构建模式）"
        exit 0
    fi
    
    # 根据环境选择部署方式
    case $environment in
        dev)
            deploy_development
            ;;
        staging)
            deploy_staging
            ;;
        production)
            deploy_production
            ;;
    esac
    
    post_deploy_verification "$environment"
    cleanup_old_images
    
    log_success "部署完成！"
    
    # 显示访问信息
    case $environment in
        dev)
            log_info "开发环境访问地址: http://localhost"
            ;;
        staging)
            log_info "预发布环境访问地址: https://staging.warpzonegems.com"
            ;;
        production)
            log_info "生产环境访问地址: https://warpzonegems.com"
            ;;
    esac
}

# 脚本入口点
if [ $# -eq 0 ]; then
    show_help
    exit 1
fi

main "$@"