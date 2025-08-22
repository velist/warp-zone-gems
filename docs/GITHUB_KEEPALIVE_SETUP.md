# GitHub Actions Supabase 保活配置指南

## 概述

此文档指导如何在GitHub上配置自动化脚本，定期访问你的Supabase数据库以防止其自动休眠。

## 📋 配置步骤

### 1. 上传代码到GitHub

确保你的项目已经推送到GitHub仓库。

### 2. 配置GitHub Secrets

在GitHub仓库中设置以下环境变量：

1. 进入你的GitHub仓库
2. 点击 `Settings` → `Secrets and variables` → `Actions`
3. 点击 `New repository secret` 添加以下secrets：

#### 必需的Secrets：

```
SUPABASE_URL
- 值：https://oiatqeymovnyubrnlmlu.supabase.co

SUPABASE_ANON_KEY  
- 值：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYXRxZXltb3ZueXVicm5sbWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjM0MzYsImV4cCI6MjA2OTg5OTQzNn0.U-3p0SEVNOQUV4lYFWRiOfVmxgNSbMRWx0mE0DXZYuM
```

#### 可选的Secrets：

```
WEBSITE_URL
- 值：你的网站部署URL
- 示例：https://username.github.io/repository-name
```

### 3. 查找你的Supabase配置

#### 方法1：从现有配置文件查找

检查你的项目中的环境变量文件：

```bash
# 检查 .env 文件
cat .env

# 检查其他环境配置文件
cat supabase.env
```

#### 方法2：从Supabase Dashboard获取

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 `Settings` → `API`
4. 复制以下信息：
   - **Project URL** → 用作 `SUPABASE_URL`
   - **anon public** → 用作 `SUPABASE_ANON_KEY`

### 4. 验证配置

设置完成后，可以手动触发workflow进行测试：

1. 进入 `Actions` 标签页
2. 选择 `Keep Supabase Database Alive` workflow
3. 点击 `Run workflow` → `Run workflow`

## 🕐 运行时间表

脚本将按以下时间表自动运行：

- **每天UTC时间2:00** (北京时间10:00)
- **每天UTC时间14:00** (北京时间22:00)  
- **手动触发**：随时可在GitHub Actions中手动运行

## 🛠️ 自定义配置

### 修改运行频率

编辑 `.github/workflows/keep-alive.yml` 文件中的cron表达式：

```yaml
schedule:
  # 每6小时运行一次
  - cron: '0 */6 * * *'
  # 或每4小时运行一次  
  - cron: '0 */4 * * *'
```

### 修改访问URL

更新workflow文件中的URL：

```yaml
- name: Keep database alive
  run: |
    # 替换为你的实际网站URL
    curl -f -s -o /dev/null "https://your-actual-website-url.github.io/"
```

## 📊 监控和日志

### 查看运行日志

1. 进入 `Actions` 标签页
2. 点击最近的workflow运行记录
3. 查看详细日志输出

### 日志内容说明

- ✅ **成功标识**：任务执行成功
- ❌ **失败标识**：任务执行失败  
- ⚠️ **警告标识**：部分功能异常但不影响主要目标
- 📊 **报告标识**：执行结果摘要

## 🔧 故障排除

### 常见问题

#### 1. "Secrets not found" 错误
- 检查GitHub Secrets是否正确设置
- 确保secret名称完全匹配（区分大小写）

#### 2. "Database connection failed" 错误  
- 验证SUPABASE_URL和SUPABASE_ANON_KEY是否正确
- 检查Supabase项目是否仍然活跃

#### 3. "Website access failed" 错误
- 确认网站URL是否正确且可访问
- 检查GitHub Pages是否正常部署

### 测试本地脚本

在本地测试保活脚本：

```bash
# 设置环境变量
export VITE_SUPABASE_URL="your-supabase-url"
export VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
export WEBSITE_URL="your-website-url"

# 安装依赖
npm install @supabase/supabase-js

# 运行脚本
node scripts/keep-alive.js
```

## 📈 效果验证

### 验证数据库保持活跃

1. **查看Supabase Dashboard**：
   - 登录Supabase Dashboard
   - 检查项目状态是否为"Active"

2. **检查网站加载速度**：
   - 访问你的网站
   - 第一次加载应该很快（无冷启动延迟）

3. **查看GitHub Actions日志**：
   - 确认脚本成功执行
   - 数据库查询返回正常结果

## 🔄 更新和维护

### 定期检查

建议每月检查一次：

1. GitHub Actions是否正常运行
2. Supabase项目状态
3. 网站访问是否正常

### 配置更新

如果需要更新配置：

1. 修改GitHub Secrets
2. 更新workflow文件
3. 手动触发一次测试

---

## 📞 支持

如果遇到问题：

1. 检查GitHub Actions运行日志
2. 验证Supabase项目状态  
3. 确认所有配置项正确设置

保活脚本将帮助确保你的Supabase数据库保持活跃状态，避免因长期不活跃而暂停服务。