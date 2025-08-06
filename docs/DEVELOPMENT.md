# 开发指南

## 项目概述

这是一个Mario风格的游戏资源网站，提供游戏角色、道具、音效等资源的展示和管理功能。

## 技术架构

### 前端技术栈
- **React 18**: 现代化的用户界面库
- **TypeScript**: 类型安全的JavaScript超集
- **Vite**: 快速的构建工具
- **Tailwind CSS**: 实用优先的CSS框架
- **shadcn/ui**: 高质量的UI组件库

### 后端技术栈
- **Supabase**: 后端即服务平台
  - PostgreSQL数据库
  - 实时订阅
  - 用户认证
  - 行级安全策略

### 数据库设计

#### 主要表结构

```sql
-- 游戏类别表
CREATE TABLE game_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 游戏资源表
CREATE TABLE game_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  download_url TEXT,
  category_id UUID REFERENCES game_categories(id),
  resource_type TEXT NOT NULL,
  tags TEXT[],
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 开发规范

### 代码结构
```
src/
├── components/           # 可复用组件
│   ├── ui/              # shadcn/ui基础组件
│   ├── Header.tsx       # 网站头部
│   ├── GameCard.tsx     # 游戏卡片组件
│   └── CategoryGrid.tsx # 分类网格组件
├── pages/               # 页面组件
│   ├── Index.tsx        # 首页
│   └── NotFound.tsx     # 404页面
├── hooks/               # 自定义Hooks
│   └── useSupabaseData.ts
├── integrations/        # 外部服务集成
│   └── supabase/        # Supabase配置
└── lib/                 # 工具函数
    └── utils.ts
```

### 命名规范
- **组件**: PascalCase (例: `GameCard.tsx`)
- **Hooks**: camelCase，以use开头 (例: `useSupabaseData.ts`)
- **工具函数**: camelCase (例: `formatDate`)
- **常量**: UPPER_SNAKE_CASE (例: `API_BASE_URL`)

### CSS规范
- 使用Tailwind CSS语义化token
- 避免直接使用颜色值，使用设计系统定义的颜色
- 所有颜色必须为HSL格式
- 优先使用组件变体而非内联样式

### TypeScript规范
- 为所有函数和组件提供类型注解
- 使用接口定义数据结构
- 启用严格模式检查
- 避免使用`any`类型

## 组件开发指南

### 创建新组件
```tsx
// components/ExampleComponent.tsx
import { cn } from "@/lib/utils";

interface ExampleComponentProps {
  title: string;
  className?: string;
}

export const ExampleComponent = ({ title, className }: ExampleComponentProps) => {
  return (
    <div className={cn("base-styles", className)}>
      <h2 className="text-primary">{title}</h2>
    </div>
  );
};
```

### 使用自定义Hooks
```tsx
// hooks/useExample.ts
import { useState, useEffect } from 'react';

export const useExample = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 数据获取逻辑
  }, []);

  return { data, loading };
};
```

### Supabase数据操作
```tsx
import { supabase } from '@/integrations/supabase/client';

// 查询数据
const { data, error } = await supabase
  .from('game_resources')
  .select('*')
  .eq('category_id', categoryId);

// 插入数据
const { data, error } = await supabase
  .from('game_resources')
  .insert([{ title, description, category_id }]);
```

## 部署流程

### 开发环境
```bash
npm run dev
```

### 生产构建
```bash
npm run build
npm run preview
```

### 数据库迁移
```bash
# 应用迁移
supabase db push

# 重置数据库
supabase db reset
```

## 性能优化

### 代码分割
- 使用React.lazy()进行组件懒加载
- 路由级别的代码分割

### 图片优化
- 使用WebP格式
- 实现懒加载
- 响应式图片

### 数据库优化
- 合理使用索引
- 实施分页查询
- 使用Supabase的实时功能

## 测试策略

### 单元测试
- 使用Jest + Testing Library
- 测试组件渲染和交互
- 测试自定义Hooks

### 集成测试
- 测试数据库操作
- 测试API调用
- 测试用户流程

## 安全注意事项

### 数据库安全
- 启用行级安全策略(RLS)
- 验证用户权限
- 防止SQL注入

### 前端安全
- 验证用户输入
- 防止XSS攻击
- 安全的路由保护

## 调试技巧

### 开发工具
- React Developer Tools
- Redux DevTools (如果使用)
- Supabase Dashboard

### 日志记录
```tsx
// 开发环境日志
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

### 错误处理
```tsx
try {
  const result = await someAsyncOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  // 用户友好的错误处理
}
```

## 贡献指南

1. Fork项目仓库
2. 创建功能分支
3. 提交更改
4. 创建Pull Request
5. 代码审查通过后合并

---

*如有问题，请查看项目Issues或联系开发团队*