# Warp Zone Gems - 马里奥主题游戏资源网站

## 语言使用
1. 始终用中文回复我；
2. 我输入的是中文指令，请转化为精准的英文指令，并输出给我供我学习，然后你按照精准的英文指令执行；
3. 记住始终使用中文回复我；

## 阶段规范
1. 每修复、完成一个阶段任务，自行生成对应文档，并按内容命名，如：登录错误修复记录.md；
2. 所有文档不得放在根目录，而是自行创建对应日期的记录文件夹；

## 📖 项目概述

Warp Zone Gems 是一个专为马里奥游戏爱好者打造的游戏资源分享平台。网站采用现代化的 React 技术栈，集成了完善的后台管理系统、AI 内容生成、隐藏内容功能等特色功能。

### 🎯 项目特色

- 🎮 **马里奥主题设计** - 经典的马里奥游戏视觉风格
- 🤖 **AI 智能生成** - 集成 Silicon Flow API 自动生成游戏内容
- 🔒 **隐藏内容功能** - 支持 `[hide][/hide]` 回复可见内容
- 📝 **富文本编辑** - 强大的内容编辑器
- 🔐 **完整权限系统** - 管理员和用户权限管理
- 📱 **响应式设计** - 完美适配移动端和桌面端

## 🏗️ 技术架构

### 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI 框架**: shadcn/ui + Tailwind CSS
- **路由**: React Router v6
- **状态管理**: React Query + Context API
- **富文本编辑**: React Quill
- **图标**: Lucide React

### 后端服务
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **文件存储**: ImgBB 免费图床
- **AI 服务**: Silicon Flow API

### 部署平台
- **开发平台**: Lovable.dev
- **版本控制**: GitHub

## 📁 项目结构

```
warp-zone-gems/
├── src/
│   ├── components/          # 通用组件
│   │   ├── ui/             # shadcn/ui 基础组件
│   │   ├── AdminLogin.tsx  # 管理员登录
│   │   ├── AdminRegister.tsx # 管理员注册
│   │   ├── DevAdminSetup.tsx # 开发环境管理员设置
│   │   ├── GameCard.tsx    # 游戏卡片组件
│   │   ├── Header.tsx      # 网站头部
│   │   ├── HeroSection.tsx # 首页英雄区域
│   │   ├── CategoryGrid.tsx # 分类网格
│   │   ├── RichTextEditor.tsx # 富文本编辑器
│   │   ├── HideContent.tsx # 隐藏内容显示组件
│   │   ├── FloatingActionPanel.tsx # 浮动操作面板
│   │   ├── SimpleCoverUpload.tsx # 简化封面上传
│   │   ├── UserAuth.tsx    # 用户认证
│   │   └── ProtectedRoute.tsx # 路由保护
│   ├── pages/              # 页面组件
│   │   ├── Index.tsx       # 首页
│   │   ├── GameDetail.tsx  # 游戏详情页
│   │   ├── AdminDashboard.tsx # 管理后台首页
│   │   ├── PostManagement.tsx # 内容管理
│   │   ├── PostEditor.tsx  # 内容编辑器
│   │   ├── AdminSettings.tsx # 管理员设置
│   │   └── NotFound.tsx    # 404 页面
│   ├── hooks/              # 自定义钩子
│   │   ├── useAuth.tsx     # 认证钩子
│   │   └── useSupabaseData.tsx # 数据获取钩子
│   ├── lib/                # 工具库
│   │   ├── supabase.ts     # Supabase 客户端
│   │   ├── siliconFlowAPI.ts # Silicon Flow API
│   │   ├── hideContentModule.ts # 隐藏内容模块
│   │   ├── imgbbUpload.ts  # 图片上传工具
│   │   └── testHideContent.ts # 测试数据
│   ├── integrations/       # 第三方集成
│   │   └── supabase/       # Supabase 配置
│   └── styles/             # 样式文件
│       └── globals.css     # 全局样式
├── public/                 # 静态资源
├── package.json            # 项目依赖
├── vite.config.ts         # Vite 配置
├── tailwind.config.js     # Tailwind 配置
├── tsconfig.json          # TypeScript 配置
└── CLAUDE.md              # 本文档
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖
```bash
npm install
```

### 环境变量配置
创建 `.env.local` 文件：
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_IMGBB_API_KEY=your_imgbb_api_key
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 🗄️ 数据库结构

### games 表 (游戏内容)
```sql
CREATE TABLE games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  cover_image TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  author TEXT,
  download_link TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### categories 表 (游戏分类)
```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### admin_settings 表 (管理员设置)
```sql
CREATE TABLE admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  silicon_flow_api_key TEXT,
  preferred_ai_model TEXT DEFAULT 'Qwen/Qwen2.5-7B-Instruct',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 权限系统

### Row Level Security (RLS) 策略

#### games 表权限
- **查看**: 所有用户可以查看已发布的游戏
- **创建**: 仅认证用户可以创建
- **更新**: 仅创建者或管理员可以更新
- **删除**: 仅创建者或管理员可以删除

#### admin_settings 表权限
- **查看**: 仅设置所有者可以查看
- **创建**: 认证用户可以创建自己的设置
- **更新**: 仅设置所有者可以更新
- **删除**: 仅设置所有者可以删除

## 🤖 AI 集成功能

### Silicon Flow API 集成
项目集成了 Silicon Flow AI 服务，支持多种 AI 模型：

#### 支持的模型
- **Qwen/Qwen2.5-7B-Instruct** (默认)
- **THUDM/glm-4-9b-chat**
- **meta-llama/Meta-Llama-3.1-8B-Instruct**
- **01-ai/Yi-1.5-9B-Chat-16K**

#### AI 功能
- **智能内容生成**: 根据游戏标题和分类自动生成游戏介绍
- **多语言支持**: 支持中英文内容生成
- **模板化生成**: 使用专业的游戏介绍模板
- **错误处理**: 完善的 API 调用错误处理机制

### 使用方法
1. 在管理员设置页面配置 Silicon Flow API Key
2. 选择偏好的 AI 模型
3. 在内容编辑器中点击 AI 按钮自动生成内容

## 🔒 隐藏内容功能

### 功能概述
支持 `[hide][/hide]` 标签创建回复可见的隐藏内容，类似论坛的隐藏回复功能。

### 实现原理

#### 编辑器端 (`RichTextEditor.tsx`)
- **工具栏按钮**: 🔒 按钮用于插入隐藏标签
- **实时预览**: 编辑器中显示隐藏内容的可视化预览
- **智能包装**: 自动将选中文本包装在 `[hide][/hide]` 标签中

#### 显示端 (`HideContent.tsx`)
- **内容解析**: 解析 HTML 内容中的隐藏标签
- **交互式显示**: 点击解锁隐藏内容
- **权限控制**: 支持登录要求和回复要求
- **动画效果**: 流畅的显示和隐藏动画

### 使用示例
```html
这是普通内容

[hide]
这是隐藏的攻略内容：
- 隐藏通道位置
- 特殊道具获取方法
[/hide]

继续普通内容
```

## 📝 内容管理系统

### 内容编辑器功能
- **富文本编辑**: 基于 React Quill 的强大编辑器
- **图片上传**: 集成 ImgBB 免费图床
- **AI 辅助**: 一键生成游戏介绍内容
- **隐藏内容**: 支持隐藏标签插入
- **实时预览**: 所见即所得的编辑体验

### 内容管理功能
- **内容列表**: 分页显示所有游戏内容
- **快速操作**: 编辑、删除、发布/下架
- **分类筛选**: 按分类查看内容
- **搜索功能**: 标题和内容搜索

## 🎨 UI/UX 设计

### 设计理念
- **马里奥主题**: 经典的游戏色彩和元素
- **现代简约**: 清晰的信息层次
- **响应式设计**: 适配各种屏幕尺寸
- **交互友好**: 流畅的用户体验

### 核心样式类
```css
.mario-button - 马里奥风格按钮
.block-card - 块状卡片样式
.coin-shine - 金币光泽效果
.floating-animation - 浮动动画
.power-up - 能力提升动画
```

### 色彩方案
- **主色**: HSL 蓝色系 (primary)
- **辅色**: HSL 橙色系 (secondary)  
- **强调色**: HSL 黄色系 (accent)
- **文本**: 深灰色系

## 🔧 开发指南

### 代码规范
- **TypeScript**: 严格的类型检查
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **组件化**: 功能模块化开发

### Git 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 样式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 常用开发命令
```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run preview    # 预览生产版本
npm run lint       # 代码检查
npm run type-check # 类型检查
```

## 🚀 部署指南

### Lovable 平台部署
1. 推送代码到 GitHub 仓库
2. 在 Lovable 平台导入项目
3. 配置环境变量
4. 自动部署

### 手动部署
1. 执行 `npm run build`
2. 将 `dist` 目录部署到静态托管服务
3. 配置环境变量
4. 设置域名和 SSL

### 环境变量配置
```env
# Supabase 配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ImgBB 图床配置
VITE_IMGBB_API_KEY=your_imgbb_api_key

# Silicon Flow AI 配置 (在管理后台设置)
# SILICON_FLOW_API_KEY=your_silicon_flow_api_key
```

## 🐛 故障排除

### 常见问题

#### 1. 邮箱验证问题
**问题**: 注册后显示 "Email not confirmed"
**解决**: 
- 开发环境: 使用 `/admin/dev-setup` 路径创建开发管理员
- 生产环境: 检查邮箱验证邮件

#### 2. 图片上传失败
**问题**: 封面图片上传失败
**解决**: 
- 检查 ImgBB API Key 配置
- 确认网络连接正常
- 检查图片格式和大小限制

#### 3. AI 生成失败
**问题**: AI 内容生成不工作
**解决**: 
- 在管理员设置中配置 Silicon Flow API Key
- 检查 API Key 余额和权限
- 确认选择的 AI 模型可用

#### 4. 隐藏内容不显示
**问题**: 隐藏内容标签不生效
**解决**: 
- 确认使用正确的 `[hide][/hide]` 标签格式
- 检查 HideContent 组件是否正确集成
- 确认内容保存时标签没有被过滤

## 🔄 更新日志

### v1.3.0 (2024-12-XX)
- ✅ 新增隐藏内容功能 `[hide][/hide]`
- ✅ 创建游戏详情页面
- ✅ 优化内容编辑器界面
- ✅ 改进浮动操作面板

### v1.2.0 (2024-11-XX)
- ✅ 集成 Silicon Flow AI 内容生成
- ✅ 新增管理员设置页面
- ✅ 优化富文本编辑器
- ✅ 简化内容创建界面

### v1.1.0 (2024-10-XX)
- ✅ 完善管理员认证系统
- ✅ 新增内容管理功能
- ✅ 集成 ImgBB 图片上传
- ✅ 优化响应式设计

### v1.0.0 (2024-09-XX)
- ✅ 项目初始化
- ✅ 基础 UI 框架搭建
- ✅ Supabase 数据库集成
- ✅ 基本功能实现

## 📞 技术支持

### 联系方式
- **项目地址**: https://github.com/velist/warp-zone-gems
- **问题反馈**: GitHub Issues
- **技术讨论**: GitHub Discussions

### 开发团队
- **主要开发**: Claude AI Assistant
- **项目维护**: GitHub @velist
- **技术栈**: React + Supabase + Lovable

### 许可证
本项目采用 MIT 许可证，详情请查看 LICENSE 文件。

---

**感谢使用 Warp Zone Gems！🎮**

如有任何问题或建议，欢迎通过 GitHub Issues 联系我们。让我们一起打造更好的马里奥游戏资源分享平台！