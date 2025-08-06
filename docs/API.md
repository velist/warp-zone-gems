# API 接口文档

## 概述

本项目使用Supabase作为后端服务，提供RESTful API和实时订阅功能。

## 认证

所有API请求都通过Supabase客户端进行，客户端会自动处理认证token。

```typescript
import { supabase } from '@/integrations/supabase/client';
```

## 数据模型

### GameCategory (游戏分类)

```typescript
interface GameCategory {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  created_at: string;
  updated_at: string;
}
```

### GameResource (游戏资源)

```typescript
interface GameResource {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  download_url?: string;
  category_id?: string;
  resource_type: string;
  tags?: string[];
  download_count: number;
  created_at: string;
  updated_at: string;
}
```

## API 端点

### 游戏分类 API

#### 获取所有分类
```typescript
const getCategories = async () => {
  const { data, error } = await supabase
    .from('game_categories')
    .select('*')
    .order('name');
  
  return { data, error };
};
```

#### 获取单个分类
```typescript
const getCategory = async (id: string) => {
  const { data, error } = await supabase
    .from('game_categories')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
};
```

#### 创建分类
```typescript
const createCategory = async (category: Omit<GameCategory, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('game_categories')
    .insert([category])
    .select()
    .single();
  
  return { data, error };
};
```

#### 更新分类
```typescript
const updateCategory = async (id: string, updates: Partial<GameCategory>) => {
  const { data, error } = await supabase
    .from('game_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
};
```

#### 删除分类
```typescript
const deleteCategory = async (id: string) => {
  const { error } = await supabase
    .from('game_categories')
    .delete()
    .eq('id', id);
  
  return { error };
};
```

### 游戏资源 API

#### 获取所有资源
```typescript
const getResources = async (page = 1, limit = 20) => {
  const { data, error, count } = await supabase
    .from('game_resources')
    .select('*, game_categories(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);
  
  return { data, error, count };
};
```

#### 按分类获取资源
```typescript
const getResourcesByCategory = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('game_resources')
    .select('*, game_categories(*)')
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};
```

#### 搜索资源
```typescript
const searchResources = async (query: string) => {
  const { data, error } = await supabase
    .from('game_resources')
    .select('*, game_categories(*)')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });
  
  return { data, error };
};
```

#### 获取单个资源
```typescript
const getResource = async (id: string) => {
  const { data, error } = await supabase
    .from('game_resources')
    .select('*, game_categories(*)')
    .eq('id', id)
    .single();
  
  return { data, error };
};
```

#### 创建资源
```typescript
const createResource = async (resource: Omit<GameResource, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('game_resources')
    .insert([resource])
    .select('*, game_categories(*)')
    .single();
  
  return { data, error };
};
```

#### 更新资源
```typescript
const updateResource = async (id: string, updates: Partial<GameResource>) => {
  const { data, error } = await supabase
    .from('game_resources')
    .update(updates)
    .eq('id', id)
    .select('*, game_categories(*)')
    .single();
  
  return { data, error };
};
```

#### 删除资源
```typescript
const deleteResource = async (id: string) => {
  const { error } = await supabase
    .from('game_resources')
    .delete()
    .eq('id', id);
  
  return { error };
};
```

#### 增加下载计数
```typescript
const incrementDownloadCount = async (id: string) => {
  const { data, error } = await supabase
    .rpc('increment_download_count', { resource_id: id });
  
  return { data, error };
};
```

### 实时订阅

#### 监听分类变化
```typescript
const subscribeToCategories = (callback: (payload: any) => void) => {
  return supabase
    .channel('game_categories')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'game_categories' 
    }, callback)
    .subscribe();
};
```

#### 监听资源变化
```typescript
const subscribeToResources = (callback: (payload: any) => void) => {
  return supabase
    .channel('game_resources')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'game_resources' 
    }, callback)
    .subscribe();
};
```

## 错误处理

所有API调用都应该包含错误处理：

```typescript
const handleApiCall = async () => {
  try {
    const { data, error } = await supabase
      .from('game_resources')
      .select('*');
    
    if (error) {
      console.error('Supabase error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
};
```

## React Query 集成

推荐使用React Query进行数据获取和缓存：

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 查询Hook
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
};

export const useResources = (page = 1) => {
  return useQuery({
    queryKey: ['resources', page],
    queryFn: () => getResources(page),
  });
};

// 变更Hook
export const useCreateResource = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
};
```

## 性能优化建议

1. **分页**: 对大量数据使用分页查询
2. **选择性字段**: 只选择需要的字段
3. **缓存**: 使用React Query进行智能缓存
4. **实时订阅**: 仅在必要时使用实时功能
5. **索引**: 确保数据库查询使用适当的索引

## 安全注意事项

1. **RLS策略**: 确保所有表都启用了适当的行级安全策略
2. **输入验证**: 在前端和后端都进行数据验证
3. **权限检查**: 确保用户只能访问授权的数据
4. **SQL注入防护**: 使用参数化查询

---

*API文档会随着项目发展持续更新*