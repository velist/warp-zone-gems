import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { fetchData } from '@/lib/dataConfig';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Save,
  X,
  Image,
  ExternalLink,
  Move,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  linkText?: string;
  position: 'hero' | 'sidebar' | 'content';
  status: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
  order?: number;
}

const BannerManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newBanner, setNewBanner] = useState<Partial<Banner>>({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    linkText: '',
    position: 'hero',
    status: 'active',
    order: 1
  });

  // 加载Banner数据
  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await fetchData<Banner[]>('banners');
      setBanners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load banners:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  const saveBanners = async (bannerData: Banner[]) => {
    try {
      // 这里需要实现保存到JSON文件的逻辑
      // 由于我们使用静态文件，暂时只能在控制台显示
      console.log('保存Banner配置:', bannerData);
      
      // 模拟保存成功
      setBanners(bannerData);
      alert('Banner配置已保存！\n注意：由于使用静态文件，需要手动更新data/banners.json文件。');
      
      return true;
    } catch (error) {
      console.error('Failed to save banners:', error);
      return false;
    }
  };

  const handleAddBanner = async () => {
    if (newBanner.title && newBanner.imageUrl) {
      const banner: Banner = {
        id: Date.now().toString(),
        title: newBanner.title,
        description: newBanner.description || '',
        imageUrl: newBanner.imageUrl,
        linkUrl: newBanner.linkUrl || '',
        linkText: newBanner.linkText || '了解更多',
        position: newBanner.position || 'hero',
        status: newBanner.status || 'active',
        order: newBanner.order || banners.length + 1
      };
      
      const updatedBanners = [...banners, banner];
      await saveBanners(updatedBanners);
      
      setNewBanner({
        title: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        linkText: '',
        position: 'hero',
        status: 'active',
        order: 1
      });
      setIsAddingNew(false);
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner({ ...banner });
  };

  const handleSaveEdit = async () => {
    if (editingBanner) {
      const updatedBanners = banners.map(banner => 
        banner.id === editingBanner.id ? editingBanner : banner
      );
      await saveBanners(updatedBanners);
      setEditingBanner(null);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirm('确定要删除这个Banner吗？')) {
      const updatedBanners = banners.filter(banner => banner.id !== id);
      await saveBanners(updatedBanners);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const updatedBanners = banners.map(banner =>
      banner.id === id 
        ? { ...banner, status: banner.status === 'active' ? 'inactive' : 'active' }
        : banner
    );
    await saveBanners(updatedBanners);
  };

  const moveBanner = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex(banner => banner.id === id);
    if (currentIndex === -1) return;

    const newBanners = [...banners];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < newBanners.length) {
      [newBanners[currentIndex], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[currentIndex]];
      
      // 更新order
      newBanners.forEach((banner, index) => {
        banner.order = index + 1;
      });
      
      await saveBanners(newBanners);
    }
  };

  const handleExportConfig = () => {
    const config = JSON.stringify(banners, null, 2);
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'banners-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const importedBanners = JSON.parse(content);
          
          if (Array.isArray(importedBanners)) {
            await saveBanners(importedBanners);
            console.log('Banner配置导入成功');
          } else {
            alert('导入失败：文件格式不正确');
          }
        } catch (error) {
          console.error('Banner配置导入失败:', error);
          alert('导入失败：文件格式错误');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetToDefault = async () => {
    if (confirm('确定要重置为默认配置吗？这将删除所有自定义Banner。')) {
      const defaultBanners: Banner[] = [
        {
          id: '1',
          title: '欢迎来到游戏资源平台',
          description: '发现最新最热门的游戏资源',
          imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80',
          linkUrl: '#',
          linkText: '开始探索',
          position: 'hero',
          status: 'active',
          order: 1
        }
      ];
      await saveBanners(defaultBanners);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回仪表盘
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Banner管理</h1>
                <p className="text-sm text-gray-500">管理网站轮播图和横幅广告</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleResetToDefault}>
                <RotateCcw className="h-4 w-4 mr-2" />
                重置默认
              </Button>
              <Button variant="outline" onClick={handleExportConfig}>
                <Download className="h-4 w-4 mr-2" />
                导出配置
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportConfig}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  导入配置
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Banner预览区域 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Banner预览</CardTitle>
            <CardDescription>预览当前活跃的Banner显示效果</CardDescription>
          </CardHeader>
          <CardContent>
            {banners.filter(b => b.status === 'active').length > 0 ? (
              <div className="space-y-4">
                {banners
                  .filter(b => b.status === 'active')
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .slice(0, 3)
                  .map(banner => (
                    <div key={banner.id} className="relative rounded-lg overflow-hidden">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                        <div className="text-white p-6">
                          <h3 className="text-lg font-bold">{banner.title}</h3>
                          {banner.description && (
                            <p className="text-sm opacity-90">{banner.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">暂无活跃的Banner</p>
            )}
          </CardContent>
        </Card>

        {/* 操作区域 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Banner管理</h2>
          <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                添加Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>添加新Banner</DialogTitle>
                <DialogDescription>
                  创建一个新的Banner横幅
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    value={newBanner.title || ''}
                    onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                    placeholder="Banner标题"
                  />
                </div>
                <div>
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    value={newBanner.description || ''}
                    onChange={(e) => setNewBanner({...newBanner, description: e.target.value})}
                    placeholder="Banner描述信息"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">图片URL</Label>
                  <Input
                    id="imageUrl"
                    value={newBanner.imageUrl || ''}
                    onChange={(e) => setNewBanner({...newBanner, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="linkUrl">链接地址</Label>
                  <Input
                    id="linkUrl"
                    value={newBanner.linkUrl || ''}
                    onChange={(e) => setNewBanner({...newBanner, linkUrl: e.target.value})}
                    placeholder="点击跳转的链接地址"
                  />
                </div>
                <div>
                  <Label htmlFor="linkText">按钮文字</Label>
                  <Input
                    id="linkText"
                    value={newBanner.linkText || ''}
                    onChange={(e) => setNewBanner({...newBanner, linkText: e.target.value})}
                    placeholder="按钮显示文字"
                  />
                </div>
                <div>
                  <Label htmlFor="position">显示位置</Label>
                  <Select
                    value={newBanner.position}
                    onValueChange={(value: 'hero' | 'sidebar' | 'content') => 
                      setNewBanner({...newBanner, position: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">主要横幅</SelectItem>
                      <SelectItem value="sidebar">侧边栏</SelectItem>
                      <SelectItem value="content">内容区</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="status"
                    checked={newBanner.status === 'active'}
                    onCheckedChange={(checked) => 
                      setNewBanner({...newBanner, status: checked ? 'active' : 'inactive'})}
                  />
                  <Label htmlFor="status">启用状态</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                    取消
                  </Button>
                  <Button onClick={handleAddBanner}>添加</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Banner列表 */}
        {loading ? (
          <div className="text-center py-8">
            <p>加载中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {banners
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((banner, index) => (
                <Card key={banner.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveBanner(banner.id, 'up')}
                            disabled={index === 0}
                          >
                            <Move className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveBanner(banner.id, 'down')}
                            disabled={index === banners.length - 1}
                          >
                            <Move className="h-3 w-3 rotate-180" />
                          </Button>
                        </div>
                        
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{banner.title}</h3>
                            <Badge variant={banner.status === 'active' ? 'default' : 'secondary'}>
                              {banner.status === 'active' ? '启用' : '禁用'}
                            </Badge>
                            <Badge variant="outline">{banner.position}</Badge>
                          </div>
                          {banner.description && (
                            <p className="text-sm text-gray-500 mt-1">{banner.description}</p>
                          )}
                          {banner.linkUrl && (
                            <p className="text-xs text-blue-500 mt-1">
                              <ExternalLink className="w-3 h-3 inline mr-1" />
                              {banner.linkUrl}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(banner.id)}
                        >
                          {banner.status === 'active' ? 
                            <Eye className="h-4 w-4" /> : 
                            <EyeOff className="h-4 w-4" />
                          }
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditBanner(banner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {banners.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">暂无Banner配置</p>
                  <p className="text-sm text-gray-400">点击上方"添加Banner"按钮创建第一个Banner</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* 编辑对话框 */}
        <Dialog open={!!editingBanner} onOpenChange={() => setEditingBanner(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>编辑Banner</DialogTitle>
              <DialogDescription>
                修改Banner的信息和设置
              </DialogDescription>
            </DialogHeader>
            {editingBanner && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label htmlFor="edit-title">标题</Label>
                  <Input
                    id="edit-title"
                    value={editingBanner.title}
                    onChange={(e) => setEditingBanner({...editingBanner, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">描述</Label>
                  <Textarea
                    id="edit-description"
                    value={editingBanner.description || ''}
                    onChange={(e) => setEditingBanner({...editingBanner, description: e.target.value})}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-imageUrl">图片URL</Label>
                  <Input
                    id="edit-imageUrl"
                    value={editingBanner.imageUrl}
                    onChange={(e) => setEditingBanner({...editingBanner, imageUrl: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-linkUrl">链接地址</Label>
                  <Input
                    id="edit-linkUrl"
                    value={editingBanner.linkUrl || ''}
                    onChange={(e) => setEditingBanner({...editingBanner, linkUrl: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-linkText">按钮文字</Label>
                  <Input
                    id="edit-linkText"
                    value={editingBanner.linkText || ''}
                    onChange={(e) => setEditingBanner({...editingBanner, linkText: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-position">显示位置</Label>
                  <Select
                    value={editingBanner.position}
                    onValueChange={(value: 'hero' | 'sidebar' | 'content') => 
                      setEditingBanner({...editingBanner, position: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hero">主要横幅</SelectItem>
                      <SelectItem value="sidebar">侧边栏</SelectItem>
                      <SelectItem value="content">内容区</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-status"
                    checked={editingBanner.status === 'active'}
                    onCheckedChange={(checked) => 
                      setEditingBanner({...editingBanner, status: checked ? 'active' : 'inactive'})}
                  />
                  <Label htmlFor="edit-status">启用状态</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingBanner(null)}>
                    取消
                  </Button>
                  <Button onClick={handleSaveEdit}>保存</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default BannerManager;