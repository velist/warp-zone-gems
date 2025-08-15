import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BatchImportDialog } from '@/components/BatchImportDialog';
import { GameInfo } from '@/lib/aiContentProcessor';
import { useToast } from '@/hooks/use-toast';

interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  cover_image: string;
  author: string;
  published_at: string;
  created_at: string;
  tags: string[];
}

const PostManagement = () => {
  const [posts, setPosts] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [adminSettings, setAdminSettings] = useState<{ silicon_flow_api_key?: string; preferred_ai_model?: string } | null>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    fetchAdminSettings();
  }, []);

  const fetchAdminSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('silicon_flow_api_key, preferred_ai_model')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setAdminSettings(data);
      }
    } catch (err) {
      console.warn('Failed to fetch admin settings:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setPosts(data || []);
      }
    } catch (err) {
      setError('获取内容失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`确定要删除"${title}"吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) {
        setError(error.message);
      } else {
        setPosts(posts.filter(post => post.id !== id));
        alert('删除成功！');
      }
    } catch (err) {
      setError('删除失败');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // 处理批量导入完成
  const handleBatchImportComplete = async (games: GameInfo[]) => {
    try {
      const insertPromises = games.map(async (game) => {
        const gameData = {
          title: game.title,
          description: game.description || '',
          content: game.description || '',
          category: game.category || '平台跳跃',
          tags: game.tags || [],
          author: user?.email || 'AI导入',
          cover_image: game.coverImage || null,
          published_at: new Date().toISOString(),
        };

        return supabase.from('games').insert(gameData);
      });

      const results = await Promise.allSettled(insertPromises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      if (successful > 0) {
        toast({
          title: "批量导入完成",
          description: `成功导入 ${successful} 个游戏${failed > 0 ? `，失败 ${failed} 个` : ''}`,
        });
        
        // 刷新列表
        fetchPosts();
      } else {
        toast({
          title: "导入失败",
          description: "所有游戏导入都失败了，请检查数据格式",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Batch import error:', error);
      toast({
        title: "导入错误",
        description: "批量导入过程中发生错误",
        variant: "destructive",
      });
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">内容管理</h1>
              <p className="text-sm text-gray-500">管理您的游戏资源和文章</p>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => navigate('/admin/dashboard')}>
                返回仪表盘
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 操作栏 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <Button onClick={() => navigate('/admin/posts/create')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              创建新内容
            </Button>
            
            {/* 批量导入按钮 */}
            {adminSettings?.silicon_flow_api_key && (
              <BatchImportDialog
                apiKey={adminSettings.silicon_flow_api_key}
                model={adminSettings.preferred_ai_model || 'Qwen/Qwen2.5-7B-Instruct'}
                onImportComplete={handleBatchImportComplete}
              />
            )}
            
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                type="text"
                placeholder="搜索标题、描述或分类..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
          <div className="text-sm text-gray-500">
            共 {filteredPosts.length} 条内容
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500 mb-4">
                {searchTerm ? '没有找到匹配的内容' : '还没有任何内容'}
              </div>
              {!searchTerm && (
                <Button onClick={() => navigate('/admin/posts/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  创建第一个内容
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  {post.cover_image && (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-md mb-3"
                    />
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {post.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{post.category}</Badge>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open('/', '_blank')}
                          title="预览"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                          title="编辑"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(post.id, post.title)}
                          className="text-red-600 hover:text-red-700"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {post.author || '未知作者'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PostManagement;