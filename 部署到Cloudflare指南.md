# Cloudflare + aigame.lol 部署指南

## 🎯 准备工作清单

### 已完成 ✅
- [x] Cloudflare CLI (Wrangler 4.32.0) 已安装
- [x] wrangler.toml 配置文件已创建
- [x] _redirects 文件已配置（React 路由支持）
- [x] Vite 配置已优化（根路径部署）

## 📋 部署步骤

### 第一步：Cloudflare 账户设置
1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 登录或注册 Cloudflare 账户
3. 点击 "Add a Site" 
4. 输入域名：`aigame.lol`
5. 选择免费计划
6. **记录下 Cloudflare 提供的 2 个 nameservers**

### 第二步：Spaceship DNS 配置
1. 登录 [Spaceship](https://spaceship.com/) 账户
2. 进入域名管理 → aigame.lol
3. 找到 "DNS Management" 或 "Nameservers" 设置
4. 将 nameservers 从 Spaceship 默认改为 Cloudflare 提供的 2 个
5. 保存设置（DNS 传播需要 2-48 小时）

### 第三步：创建 Cloudflare API Token
1. 在 Cloudflare Dashboard，点击右上角头像
2. 选择 "My Profile" → "API Tokens"
3. 点击 "Create Token"
4. 选择 "Edit Cloudflare Workers" 模板
5. 或使用自定义设置：
   - Permissions: `Cloudflare Pages:Edit`
   - Account Resources: `Include All accounts`
   - Zone Resources: `Include All zones`
6. 复制生成的 token

### 第四步：认证 Wrangler CLI
运行以下命令之一：

**选项 A: 浏览器认证**
```bash
wrangler auth login
```

**选项 B: Token 认证**
```bash
wrangler auth api-token
# 粘贴您的 API token
```

### 第五步：创建 Pages 项目并部署
```bash
cd "D:\1-AI三号\游戏网站\warp-zone-gems"

# 构建项目
npm run build

# 创建 Cloudflare Pages 项目并部署
wrangler pages project create aigame-lol

# 部署
wrangler pages deploy dist --project-name=aigame-lol
```

### 第六步：配置环境变量
1. 在 Cloudflare Dashboard，进入 Workers & Pages
2. 点击您的项目 "aigame-lol"
3. 进入 Settings → Environment Variables
4. 添加以下变量：

```
VITE_SUPABASE_URL=https://oiatqeymovnyubrnlmlu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYXRxZXltb3ZueXVicm5sbWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ2ODg2OTAsImV4cCI6MjA0MDI2NDY5MH0.PzYPP7VF2iPNnwL0FnKRu4T-xFCIL1Pj4J6tWZF9D8I
VITE_IMGBB_API_KEY=7c9e2e7a5c5f5e8a9d0e4f1c6b3a8b7c
```

### 第七步：配置自定义域名
1. 在 Cloudflare Pages 项目设置中
2. 进入 Custom domains
3. 点击 "Add a custom domain"
4. 输入：`aigame.lol`
5. 确认配置

## 🎉 预期结果

- **立即可用**: `https://aigame-lol.pages.dev`（Cloudflare 默认域名）
- **2-6 小时**: `https://aigame.lol`（自定义域名开始工作）
- **24-48 小时**: 全球 DNS 传播完成

## 🔧 故障排除

### DNS 传播检查
访问 [DNS Checker](https://dnschecker.org/) 输入 aigame.lol 检查传播状态

### 构建失败
```bash
# 清理并重新构建
npm run build
# 检查 dist 文件夹是否正确生成
```

### 环境变量问题
确保在 Cloudflare Dashboard 中正确设置了所有 VITE_ 开头的环境变量

## 📱 功能验证
部署成功后，验证以下功能：
- [x] 24 个游戏正确显示
- [x] 搜索功能正常
- [x] 游戏分类工作正常
- [x] 移动端响应式设计
- [x] AI 功能（如果配置了相关 API 密钥）

## 💡 提示
- Cloudflare Pages 提供免费的 SSL 证书
- CDN 全球加速自动启用
- 每月免费 500 次构建，100GB 带宽