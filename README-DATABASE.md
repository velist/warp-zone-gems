# 数据库迁移指南

## 📋 概述

本文档描述了从 Supabase 迁移到本地 PostgreSQL 数据库的完整过程。

## 🚀 快速开始

### 1. 安装 PostgreSQL

#### Windows
```bash
# 下载并安装 PostgreSQL
# https://www.postgresql.org/download/windows/

# 或使用 Chocolatey
choco install postgresql

# 或使用 Scoop
scoop install postgresql
```

#### macOS
```bash
# 使用 Homebrew
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. 配置环境变量

创建 `.env.local` 文件：
```env
# PostgreSQL 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/warp_zone_gems
DB_HOST=localhost
DB_PORT=5432
DB_NAME=warp_zone_gems
DB_USER=postgres
DB_PASSWORD=your_password

# 应用配置
NODE_ENV=development
JWT_SECRET=your-jwt-secret-key-here
BCRYPT_ROUNDS=12

# API 配置 (保留现有的)
VITE_SILICON_FLOW_API_KEY=your-silicon-flow-api-key
VITE_SILICON_FLOW_BASE_URL=https://api.siliconflow.cn/v1
```

### 3. 运行数据库设置

```bash
# 安装依赖
npm install

# 设置数据库（创建数据库、表结构、初始数据）
npm run db:setup
```

### 4. 验证安装

设置完成后，你应该看到：
- ✅ 数据库 `warp_zone_gems` 已创建
- ✅ 所有表结构已创建
- ✅ 初始分类数据已插入
- ✅ 默认管理员用户已创建
- ✅ 示例游戏数据已插入

## 📊 数据库结构

### 核心表

#### users (用户表)
- `id` - UUID 主键
- `email` - 邮箱地址（唯一）
- `username` - 用户名
- `password_hash` - 密码哈希
- `role` - 用户角色 (user/admin)
- `is_active` - 是否激活
- `email_verified` - 邮箱是否验证
- `created_at` - 创建时间
- `updated_at` - 更新时间

#### categories (分类表)
- `id` - UUID 主键
- `name` - 分类名称
- `slug` - URL 友好标识符
- `description` - 分类描述
- `color` - 主题色
- `icon` - 图标
- `is_active` - 是否激活
- `sort_order` - 排序顺序

#### games (游戏表)
- `id` - UUID 主键
- `title` - 游戏标题
- `slug` - URL 友好标识符
- `description` - 简短描述
- `content` - 详细内容
- `cover_image` - 封面图片
- `download_link` - 下载链接
- `category_id` - 分类ID
- `tags` - 标签数组
- `status` - 状态 (draft/published/archived)
- `view_count` - 浏览次数
- `download_count` - 下载次数
- `created_by` - 创建者ID
- `published_at` - 发布时间

### 扩展表

#### user_sessions (用户会话)
- 管理用户登录会话
- 支持多设备登录
- 自动清理过期会话

#### user_favorites (用户收藏)
- 用户收藏的游戏
- 支持收藏/取消收藏

#### user_ratings (用户评分)
- 用户对游戏的评分和评论
- 支持1-5星评分系统

## 🔧 数据库操作

### 常用命令

```bash
# 设置数据库（首次运行）
npm run db:setup

# 执行数据迁移
npm run db:migrate

# 插入种子数据
npm run db:seed

# 连接到数据库
psql -h localhost -U postgres -d warp_zone_gems
```

### 数据库管理

#### 备份数据库
```bash
pg_dump -h localhost -U postgres -d warp_zone_gems > backup.sql
```

#### 恢复数据库
```bash
psql -h localhost -U postgres -d warp_zone_gems < backup.sql
```

#### 重置数据库
```bash
# 删除数据库
dropdb -h localhost -U postgres warp_zone_gems

# 重新设置
npm run db:setup
```

## 🔐 默认账户

设置完成后，系统会创建默认管理员账户：

- **邮箱**: `admin@warpzonegems.com`
- **密码**: `admin123456`
- **角色**: 管理员

⚠️ **重要**: 请在生产环境中立即修改默认密码！

## 🚀 应用集成

### 数据库服务层

应用使用 `src/lib/database.ts` 作为数据库服务层：

```typescript
import DatabaseService from '@/lib/database';

// 获取游戏列表
const games = await DatabaseService.getGames({
  limit: 20,
  category: 'platformer',
  search: 'mario'
});

// 创建新游戏
const newGame = await DatabaseService.createGame({
  title: 'Super Mario Bros.',
  description: '经典马里奥游戏',
  category_id: 'category-uuid',
  created_by: 'user-uuid'
});
```

### 配置管理

使用 `src/lib/config.ts` 管理应用配置：

```typescript
import { config } from '@/lib/config';

// 获取数据库配置
const dbConfig = config.database;

// 检查功能是否启用
const isAIEnabled = config.features.aiGeneration;
```

## 🔍 故障排除

### 常见问题

#### 1. 连接失败
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**解决方案**:
- 确认 PostgreSQL 服务已启动
- 检查端口 5432 是否被占用
- 验证用户名和密码

#### 2. 权限错误
```
Error: permission denied for database
```
**解决方案**:
- 确认用户有创建数据库的权限
- 使用超级用户账户运行设置脚本

#### 3. 模块导入错误
```
Error: Cannot find module 'pg'
```
**解决方案**:
```bash
npm install pg @types/pg
```

#### 4. 环境变量未加载
**解决方案**:
- 确认 `.env.local` 文件存在
- 检查环境变量名称是否正确
- 重启开发服务器

### 调试技巧

#### 启用查询日志
在 `postgresql.conf` 中设置：
```
log_statement = 'all'
log_min_duration_statement = 0
```

#### 查看慢查询
```sql
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

## 📈 性能优化

### 索引优化

```sql
-- 为常用查询创建索引
CREATE INDEX idx_games_category_status ON games(category_id, status);
CREATE INDEX idx_games_published_at ON games(published_at DESC);
CREATE INDEX idx_games_search ON games USING gin(to_tsvector('chinese', title || ' ' || COALESCE(description, '')));
```

### 连接池配置

在 `config.ts` 中调整连接池设置：
```typescript
database: {
  maxConnections: 20,     // 最大连接数
  idleTimeout: 30000,     // 空闲超时
  connectionTimeout: 2000, // 连接超时
}
```

## 🔄 迁移历史

### v2.0.0 - PostgreSQL 迁移
- ✅ 从 Supabase 迁移到本地 PostgreSQL
- ✅ 重新设计数据库架构
- ✅ 添加完整的用户管理系统
- ✅ 实现会话管理
- ✅ 添加收藏和评分功能

### 下一步计划
- 🔄 Redis 缓存集成
- 🔄 全文搜索优化
- 🔄 数据库分片支持
- 🔄 读写分离

## 📞 技术支持

如遇到数据库相关问题，请：

1. 检查本文档的故障排除部分
2. 查看应用日志文件
3. 在 GitHub Issues 中报告问题
4. 提供详细的错误信息和环境配置

---

**数据库迁移完成！** 🎉

现在你可以享受更快的本地数据库性能和完全的数据控制权。