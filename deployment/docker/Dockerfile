# Warp Zone Gems - Production Dockerfile
# 多阶段构建优化镜像大小

# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制包管理文件
COPY package*.json ./

# 安装依赖（仅生产依赖）
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine AS production

# 安装必要工具
RUN apk add --no-cache curl

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY deployment/docker/nginx.conf /etc/nginx/nginx.conf
COPY deployment/docker/default.conf /etc/nginx/conf.d/default.conf

# 创建健康检查脚本
RUN echo '#!/bin/sh\ncurl -f http://localhost/ || exit 1' > /healthcheck.sh && \
    chmod +x /healthcheck.sh

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /healthcheck.sh

# 暴露端口
EXPOSE 80

# 启动命令
CMD ["nginx", "-g", "daemon off;"]

# 元数据标签
LABEL maintainer="Warp Zone Gems Team <tech@warpzonegems.com>"
LABEL version="1.0"
LABEL description="Warp Zone Gems - Game Resource Sharing Platform"