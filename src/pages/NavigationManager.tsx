import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { NavigationStore, NavigationItem } from '@/lib/navigationStore';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Move, 
  Eye, 
  EyeOff,
  Save,
  X,
  Menu,
  Home,
  Gamepad2,
  Info,
  Search,
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
import { Switch } from '@/components/ui/switch';

const NavigationManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);

  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItem, setNewItem] = useState<Partial<NavigationItem>>({
    name: '',
    path: '',
    icon: 'Menu',
    description: '',
    visible: true,
    type: 'page',
    target: '_self'
  });

  // 加载导航配置
  useEffect(() => {
    const items = NavigationStore.getNavigationItems();
    setNavigationItems(items);
  }, []);

  const iconOptions = [
    { value: 'Home', label: '首页图标' },
    { value: 'Gamepad2', label: '游戏手柄' },
    { value: 'Menu', label: '菜单图标' },
    { value: 'Info', label: '信息图标' },
    { value: 'Search', label: '搜索图标' },
    { value: 'Star', label: '星星图标' },
    { value: 'Settings', label: '设置图标' },
    { value: 'User', label: '用户图标' },
    { value: 'Download', label: '下载图标' },
    { value: 'Heart', label: '心形图标' }
  ];

  const handleSaveNavigation = () => {
    const success = NavigationStore.saveNavigationItems(navigationItems);
    if (success) {
      // 可以添加成功提示
      console.log('导航配置保存成功');
    } else {
      // 可以添加错误提示
      console.error('导航配置保存失败');
    }
  };

  const handleResetToDefault = () => {
    const defaultItems = NavigationStore.resetToDefault();
    setNavigationItems(defaultItems);
  };

  const handleExportConfig = () => {
    const config = NavigationStore.exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'navigation-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const success = NavigationStore.importConfig(content);
        if (success) {
          const items = NavigationStore.getNavigationItems();
          setNavigationItems(items);
          console.log('导航配置导入成功');
        } else {
          console.error('导航配置导入失败');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.path) {
      const item: NavigationItem = {
        id: Date.now().toString(),
        name: newItem.name,
        path: newItem.path,
        icon: newItem.icon || 'Menu',
        description: newItem.description || '',
        visible: newItem.visible !== false,
        order: navigationItems.length + 1,
        type: newItem.type || 'page',
        target: newItem.target || '_self'
      };
      
      setNavigationItems([...navigationItems, item]);
      setNewItem({
        name: '',
        path: '',
        icon: 'Menu',
        description: '',
        visible: true,
        type: 'page',
        target: '_self'
      });
      setIsAddingNew(false);
    }
  };

  const handleEditItem = (item: NavigationItem) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      setNavigationItems(prev => 
        prev.map(item => 
          item.id === editingItem.id ? editingItem : item
        )
      );
      setEditingItem(null);
    }
  };

  const handleDeleteItem = (id: string) => {
    setNavigationItems(prev => prev.filter(item => item.id !== id));
  };

  const handleToggleVisibility = (id: string) => {
    setNavigationItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, visible: !item.visible } : item
      )
    );
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const currentIndex = navigationItems.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    const newItems = [...navigationItems];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      // 交换位置
      [newItems[currentIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[currentIndex]];
      // 更新order
      newItems.forEach((item, index) => {
        item.order = index + 1;
      });
      setNavigationItems(newItems);
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
                <h1 className="text-xl font-semibold text-gray-900">导航菜单管理</h1>
                <p className="text-sm text-gray-500">管理网站导航栏菜单项</p>
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
              <Button onClick={handleSaveNavigation}>
                <Save className="h-4 w-4 mr-2" />
                保存配置
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 预览区域 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>导航栏预览</CardTitle>
            <CardDescription>预览当前导航菜单的显示效果</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Gamepad2 className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-lg">Warp Zone Gems</span>
                </div>
                <nav className="flex items-center space-x-6">
                  {navigationItems
                    .filter(item => item.visible)
                    .sort((a, b) => a.order - b.order)
                    .map(item => (
                      <Button key={item.id} variant="ghost" className="text-sm">
                        {item.name}
                      </Button>
                    ))}
                </nav>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作区域 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">菜单项管理</h2>
          <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                添加菜单项
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加新菜单项</DialogTitle>
                <DialogDescription>
                  创建一个新的导航菜单项
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">菜单名称</Label>
                  <Input
                    id="name"
                    value={newItem.name || ''}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="例如：首页"
                  />
                </div>
                <div>
                  <Label htmlFor="path">链接地址</Label>
                  <Input
                    id="path"
                    value={newItem.path || ''}
                    onChange={(e) => setNewItem({...newItem, path: e.target.value})}
                    placeholder="例如：/home 或 https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="icon">图标</Label>
                  <Select
                    value={newItem.icon}
                    onValueChange={(value) => setNewItem({...newItem, icon: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">描述 (可选)</Label>
                  <Textarea
                    id="description"
                    value={newItem.description || ''}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    placeholder="菜单项的描述信息"
                    rows={2}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="visible"
                    checked={newItem.visible !== false}
                    onCheckedChange={(checked) => setNewItem({...newItem, visible: checked})}
                  />
                  <Label htmlFor="visible">显示在导航栏中</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                    取消
                  </Button>
                  <Button onClick={handleAddItem}>添加</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 菜单项列表 */}
        <div className="space-y-4">
          {navigationItems
            .sort((a, b) => a.order - b.order)
            .map((item, index) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveItem(item.id, 'up')}
                          disabled={index === 0}
                        >
                          <Move className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveItem(item.id, 'down')}
                          disabled={index === navigationItems.length - 1}
                        >
                          <Move className="h-3 w-3 rotate-180" />
                        </Button>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{item.name}</h3>
                          <Badge variant={item.visible ? 'default' : 'secondary'}>
                            {item.visible ? '显示' : '隐藏'}
                          </Badge>
                          <Badge variant="outline">{item.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{item.path}</p>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleVisibility(item.id)}
                      >
                        {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* 编辑对话框 */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑菜单项</DialogTitle>
              <DialogDescription>
                修改菜单项的信息
              </DialogDescription>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">菜单名称</Label>
                  <Input
                    id="edit-name"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-path">链接地址</Label>
                  <Input
                    id="edit-path"
                    value={editingItem.path}
                    onChange={(e) => setEditingItem({...editingItem, path: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-icon">图标</Label>
                  <Select
                    value={editingItem.icon}
                    onValueChange={(value) => setEditingItem({...editingItem, icon: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-description">描述</Label>
                  <Textarea
                    id="edit-description"
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                    rows={2}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-visible"
                    checked={editingItem.visible}
                    onCheckedChange={(checked) => setEditingItem({...editingItem, visible: checked})}
                  />
                  <Label htmlFor="edit-visible">显示在导航栏中</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingItem(null)}>
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

export default NavigationManager;