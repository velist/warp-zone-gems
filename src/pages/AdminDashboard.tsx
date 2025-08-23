import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Settings, BarChart3, FileText, Menu, Image, MessageSquare } from 'lucide-react';

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleCreatePost = () => {
    navigate('/admin/posts/create');
  };

  const handleManagePosts = () => {
    navigate('/admin/posts');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">管理后台</h1>
              <p className="text-sm text-gray-500">欢迎, {user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">仪表盘</h2>
          <p className="text-gray-600">管理您的游戏资源和内容</p>
        </div>

        {/* 快速操作卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCreatePost}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">创建新内容</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>添加新的游戏资源或文章</CardDescription>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleManagePosts}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">管理内容</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>查看和编辑已发布的内容</CardDescription>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">统计分析</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>查看访问量和下载统计</CardDescription>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/navigation')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">导航管理</CardTitle>
              <Menu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>管理网站导航菜单</CardDescription>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/banners')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banner管理</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>管理网站横幅和轮播图</CardDescription>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/popups')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">弹窗管理</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>管理网站弹窗和通知</CardDescription>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/settings')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">系统设置</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>配置API密钥和系统参数</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* 最近活动 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>最近发布</CardTitle>
              <CardDescription>您最近发布的内容</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">暂无最近发布的内容</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>系统概览</CardTitle>
              <CardDescription>网站统计信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">总内容数</span>
                  <span className="text-sm font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">草稿数</span>
                  <span className="text-sm font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">已发布</span>
                  <span className="text-sm font-medium">0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;