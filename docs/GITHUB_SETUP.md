# GitHub集成指南

## 快速开始

本文档将指导您如何将Lovable项目同步到GitHub，并设置本地开发环境。

## 1. 连接GitHub

### 步骤1：连接GitHub账户
1. 在Lovable编辑器中，点击右上角的 **GitHub** 按钮
2. 选择 **Connect to GitHub**
3. 在弹出的GitHub页面中，授权 **Lovable GitHub App**
4. 选择您要使用的GitHub账户或组织

### 步骤2：创建仓库
1. 返回Lovable编辑器
2. 点击 **Create Repository** 
3. 您的项目代码将自动推送到新创建的GitHub仓库

## 2. 本地开发设置

### 前置要求
- 安装 [Node.js](https://nodejs.org/) (推荐使用 [nvm](https://github.com/nvm-sh/nvm))
- 安装 [Git](https://git-scm.com/)

### 克隆项目
```bash
# 替换为您的实际仓库URL
git clone <YOUR_REPO_URL>
cd <PROJECT_NAME>

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 项目结构
```
mario-game-resources/
├── src/
│   ├── components/          # React组件
│   ├── pages/              # 页面组件
│   ├── hooks/              # 自定义Hooks
│   ├── integrations/       # Supabase集成
│   └── lib/                # 工具函数
├── supabase/               # 数据库配置
├── docs/                   # 项目文档
└── public/                 # 静态资源
```

## 3. 开发工作流

### 双向同步
- **Lovable → GitHub**: Lovable中的更改自动推送到GitHub
- **GitHub → Lovable**: GitHub中的提交自动同步到Lovable

### 本地开发
```bash
# 拉取最新更改
git pull origin main

# 创建功能分支
git checkout -b feature/new-feature

# 开发完成后提交
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 在GitHub上创建Pull Request
```

### 推荐IDE配置

#### VS Code
安装推荐插件：
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Hero
- Prettier - Code formatter
- ESLint

#### WebStorm
内置TypeScript和React支持，推荐启用：
- TypeScript检查
- ESLint集成
- Prettier格式化

## 4. 环境变量配置

### Supabase配置
项目已集成Supabase，相关配置在：
- `src/integrations/supabase/client.ts`
- `supabase/config.toml`

### 本地开发
确保以下环境正确：
- Node.js版本：18+
- npm版本：9+

## 5. 部署选项

### 通过Lovable部署
1. 在Lovable编辑器中点击 **Publish**
2. 选择部署选项
3. 获取部署URL

### 自主部署
项目可部署到任何支持静态网站的平台：
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### 部署命令
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 6. 常见问题

### Q: 如何处理版本冲突？
A: 使用Lovable的版本历史功能或Git的合并工具解决冲突。

### Q: 能否同时在Lovable和本地IDE开发？
A: 可以，但建议协调工作避免冲突。

### Q: 如何备份项目？
A: GitHub仓库本身就是备份，也可以使用Lovable的版本历史功能。

## 7. 技术栈说明

- **前端**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS + shadcn/ui
- **后端**: Supabase (数据库 + 认证)
- **路由**: React Router DOM
- **状态管理**: React Query
- **表单**: React Hook Form + Zod

## 8. 联系与支持

- [Lovable文档](https://docs.lovable.dev/)
- [Lovable Discord社区](https://discord.com/channels/1119885301872070706/1280461670979993613)
- [项目仓库Issues](../../../issues)

---

*最后更新：2025年8月6日*