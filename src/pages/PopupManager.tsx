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
  MessageSquare,
  ExternalLink,
  Calendar,
  Clock,
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

interface Popup {
  id: string;
  title: string;
  content: string;
  type: 'welcome' | 'announcement' | 'promotion' | 'notification';
  position: 'center' | 'top' | 'bottom';
  image?: string;
  button_text?: string;
  button_url?: string;
  delay: number;
  auto_close: number;
  frequency: 'once' | 'daily' | 'session' | 'always';
  start_date?: string;
  end_date?: string;
  enabled: boolean;
}

const PopupManager = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [popups, setPopups] = useState<Popup[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newPopup, setNewPopup] = useState<Partial<Popup>>({
    title: '',
    content: '',
    type: 'notification',
    position: 'center',
    delay: 2,
    auto_close: 0,
    frequency: 'once',
    enabled: true
  });

  // 加载Popup数据
  useEffect(() => {
    loadPopups();
  }, []);

  const loadPopups = async () => {
    try {
      setLoading(true);
      const data = await fetchData<Popup[]>('popups');
      setPopups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load popups:', error);
      setPopups([]);
    } finally {
      setLoading(false);
    }
  };

  const savePopups = async (popupData: Popup[]) => {
    try {
      // 这里需要实现保存到JSON文件的逻辑
      // 由于我们使用静态文件，暂时只能在控制台显示
      console.log('保存弹窗配置:', popupData);
      
      // 模拟保存成功
      setPopups(popupData);
      alert('弹窗配置已保存！\\n注意：由于使用静态文件，需要手动更新data/popups.json文件。');
      
      return true;
    } catch (error) {
      console.error('Failed to save popups:', error);
      return false;
    }
  };

  const handleAddPopup = async () => {
    if (newPopup.title && newPopup.content) {
      const popup: Popup = {
        id: Date.now().toString(),
        title: newPopup.title,
        content: newPopup.content,
        type: newPopup.type || 'notification',
        position: newPopup.position || 'center',
        image: newPopup.image || '',
        button_text: newPopup.button_text || '',
        button_url: newPopup.button_url || '',
        delay: newPopup.delay || 2,
        auto_close: newPopup.auto_close || 0,
        frequency: newPopup.frequency || 'once',
        start_date: newPopup.start_date || '',
        end_date: newPopup.end_date || '',
        enabled: newPopup.enabled !== false
      };
      
      const updatedPopups = [...popups, popup];
      await savePopups(updatedPopups);
      
      setNewPopup({
        title: '',
        content: '',
        type: 'notification',
        position: 'center',
        delay: 2,
        auto_close: 0,
        frequency: 'once',
        enabled: true
      });
      setIsAddingNew(false);
    }
  };

  const handleEditPopup = (popup: Popup) => {
    setEditingPopup({ ...popup });
  };

  const handleSaveEdit = async () => {
    if (editingPopup) {
      const updatedPopups = popups.map(popup => 
        popup.id === editingPopup.id ? editingPopup : popup
      );
      await savePopups(updatedPopups);
      setEditingPopup(null);
    }
  };

  const handleDeletePopup = async (id: string) => {
    if (confirm('确定要删除这个弹窗吗？')) {
      const updatedPopups = popups.filter(popup => popup.id !== id);
      await savePopups(updatedPopups);
    }
  };

  const handleToggleStatus = async (id: string) => {
    const updatedPopups = popups.map(popup =>
      popup.id === id 
        ? { ...popup, enabled: !popup.enabled }
        : popup
    );
    await savePopups(updatedPopups);
  };

  const handleExportConfig = () => {
    const config = JSON.stringify(popups, null, 2);
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'popups-config.json';
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
          const importedPopups = JSON.parse(content);
          
          if (Array.isArray(importedPopups)) {
            await savePopups(importedPopups);
            console.log('弹窗配置导入成功');
          } else {
            alert('导入失败：文件格式不正确');
          }
        } catch (error) {
          console.error('弹窗配置导入失败:', error);
          alert('导入失败：文件格式错误');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetToDefault = async () => {
    if (confirm('确定要重置为默认配置吗？这将删除所有自定义弹窗。')) {
      const defaultPopups: Popup[] = [
        {
          id: '1',
          title: '欢迎来到游戏世界！',
          content: '发现最新最热门的游戏资源，开启您的游戏之旅！',
          type: 'welcome',
          position: 'center',
          delay: 3,
          auto_close: 10,
          frequency: 'once',
          enabled: true
        }
      ];
      await savePopups(defaultPopups);
    }
  };

  const getTypeLabel = (type: string) => {
    const types = {
      welcome: '欢迎',
      announcement: '公告',
      promotion: '推广',
      notification: '通知'
    };
    return types[type as keyof typeof types] || type;
  };

  const getPositionLabel = (position: string) => {
    const positions = {
      center: '居中',
      top: '顶部',
      bottom: '底部'
    };
    return positions[position as keyof typeof positions] || position;
  };

  const getFrequencyLabel = (frequency: string) => {
    const frequencies = {
      once: '仅一次',
      daily: '每日',
      session: '每次访问',
      always: '总是显示'
    };
    return frequencies[frequency as keyof typeof frequencies] || frequency;
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
                <h1 className="text-xl font-semibold text-gray-900">弹窗管理</h1>
                <p className="text-sm text-gray-500">管理网站弹窗和通知系统</p>
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
        {/* 弹窗预览区域 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>弹窗预览</CardTitle>
            <CardDescription>预览当前启用的弹窗效果</CardDescription>
          </CardHeader>
          <CardContent>
            {popups.filter(p => p.enabled).length > 0 ? (
              <div className="space-y-4">
                {popups
                  .filter(p => p.enabled)
                  .slice(0, 3)
                  .map(popup => (
                    <div key={popup.id} className="border rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                            <h4 className="font-medium">{popup.title}</h4>
                            <Badge variant="outline">{getTypeLabel(popup.type)}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{popup.content}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            <span>位置: {getPositionLabel(popup.position)}</span>
                            <span>延迟: {popup.delay}秒</span>
                            <span>频率: {getFrequencyLabel(popup.frequency)}</span>
                            {popup.auto_close > 0 && (
                              <span>自动关闭: {popup.auto_close}秒</span>
                            )}
                          </div>
                        </div>
                        {popup.image && (
                          <img
                            src={popup.image}
                            alt={popup.title}
                            className="w-16 h-16 object-cover rounded ml-4"
                          />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">暂无启用的弹窗</p>
            )}
          </CardContent>
        </Card>

        {/* 操作区域 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">弹窗管理</h2>
          <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                添加弹窗
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>添加新弹窗</DialogTitle>
                <DialogDescription>
                  创建一个新的弹窗通知
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label htmlFor="title">标题</Label>
                  <Input
                    id="title"
                    value={newPopup.title || ''}
                    onChange={(e) => setNewPopup({...newPopup, title: e.target.value})}
                    placeholder="弹窗标题"
                  />
                </div>
                <div>
                  <Label htmlFor="content">内容</Label>
                  <Textarea
                    id="content"
                    value={newPopup.content || ''}
                    onChange={(e) => setNewPopup({...newPopup, content: e.target.value})}
                    placeholder="弹窗内容，支持HTML格式"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">类型</Label>
                    <Select
                      value={newPopup.type}
                      onValueChange={(value: 'welcome' | 'announcement' | 'promotion' | 'notification') => 
                        setNewPopup({...newPopup, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="welcome">欢迎弹窗</SelectItem>
                        <SelectItem value="announcement">公告通知</SelectItem>
                        <SelectItem value="promotion">推广活动</SelectItem>
                        <SelectItem value="notification">一般通知</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="position">位置</Label>
                    <Select
                      value={newPopup.position}
                      onValueChange={(value: 'center' | 'top' | 'bottom') => 
                        setNewPopup({...newPopup, position: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="center">居中显示</SelectItem>
                        <SelectItem value="top">顶部显示</SelectItem>
                        <SelectItem value="bottom">底部显示</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="image">图片URL（可选）</Label>
                  <Input
                    id="image"
                    value={newPopup.image || ''}
                    onChange={(e) => setNewPopup({...newPopup, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="button_text">按钮文字（可选）</Label>
                    <Input
                      id="button_text"
                      value={newPopup.button_text || ''}
                      onChange={(e) => setNewPopup({...newPopup, button_text: e.target.value})}
                      placeholder="了解更多"
                    />
                  </div>
                  <div>
                    <Label htmlFor="button_url">按钮链接（可选）</Label>
                    <Input
                      id="button_url"
                      value={newPopup.button_url || ''}
                      onChange={(e) => setNewPopup({...newPopup, button_url: e.target.value})}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="delay">延迟显示（秒）</Label>
                    <Input
                      id="delay"
                      type="number"
                      value={newPopup.delay || 2}
                      onChange={(e) => setNewPopup({...newPopup, delay: parseInt(e.target.value) || 2})}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="auto_close">自动关闭（秒，0=不关闭）</Label>
                    <Input
                      id="auto_close"
                      type="number"
                      value={newPopup.auto_close || 0}
                      onChange={(e) => setNewPopup({...newPopup, auto_close: parseInt(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">显示频率</Label>
                    <Select
                      value={newPopup.frequency}
                      onValueChange={(value: 'once' | 'daily' | 'session' | 'always') => 
                        setNewPopup({...newPopup, frequency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">仅一次</SelectItem>
                        <SelectItem value="daily">每日一次</SelectItem>
                        <SelectItem value="session">每次访问</SelectItem>
                        <SelectItem value="always">总是显示</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">开始日期（可选）</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={newPopup.start_date || ''}
                      onChange={(e) => setNewPopup({...newPopup, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">结束日期（可选）</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={newPopup.end_date || ''}
                      onChange={(e) => setNewPopup({...newPopup, end_date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enabled"
                    checked={newPopup.enabled !== false}
                    onCheckedChange={(checked) => 
                      setNewPopup({...newPopup, enabled: checked})}
                  />
                  <Label htmlFor="enabled">启用状态</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                    取消
                  </Button>
                  <Button onClick={handleAddPopup}>添加</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 弹窗列表 */}
        {loading ? (
          <div className="text-center py-8">
            <p>加载中...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {popups.map((popup) => (
              <Card key={popup.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{popup.title}</h3>
                        <Badge variant={popup.enabled ? 'default' : 'secondary'}>
                          {popup.enabled ? '启用' : '禁用'}
                        </Badge>
                        <Badge variant="outline">{getTypeLabel(popup.type)}</Badge>
                        <Badge variant="outline">{getPositionLabel(popup.position)}</Badge>
                        <Badge variant="outline">{getFrequencyLabel(popup.frequency)}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{popup.content}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          延迟: {popup.delay}秒
                        </span>
                        {popup.auto_close > 0 && (
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            自动关闭: {popup.auto_close}秒
                          </span>
                        )}
                        {popup.start_date && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            开始: {new Date(popup.start_date).toLocaleString()}
                          </span>
                        )}
                        {popup.end_date && (
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            结束: {new Date(popup.end_date).toLocaleString()}
                          </span>
                        )}
                        {popup.button_url && (
                          <span className="flex items-center text-blue-500">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {popup.button_url}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(popup.id)}
                      >
                        {popup.enabled ? 
                          <Eye className="h-4 w-4" /> : 
                          <EyeOff className="h-4 w-4" />
                        }
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPopup(popup)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePopup(popup.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {popups.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">暂无弹窗配置</p>
                  <p className="text-sm text-gray-400">点击上方"添加弹窗"按钮创建第一个弹窗</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* 编辑对话框 */}
        <Dialog open={!!editingPopup} onOpenChange={() => setEditingPopup(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>编辑弹窗</DialogTitle>
              <DialogDescription>
                修改弹窗的信息和设置
              </DialogDescription>
            </DialogHeader>
            {editingPopup && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label htmlFor="edit-title">标题</Label>
                  <Input
                    id="edit-title"
                    value={editingPopup.title}
                    onChange={(e) => setEditingPopup({...editingPopup, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-content">内容</Label>
                  <Textarea
                    id="edit-content"
                    value={editingPopup.content}
                    onChange={(e) => setEditingPopup({...editingPopup, content: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-type">类型</Label>
                    <Select
                      value={editingPopup.type}
                      onValueChange={(value: 'welcome' | 'announcement' | 'promotion' | 'notification') => 
                        setEditingPopup({...editingPopup, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="welcome">欢迎弹窗</SelectItem>
                        <SelectItem value="announcement">公告通知</SelectItem>
                        <SelectItem value="promotion">推广活动</SelectItem>
                        <SelectItem value="notification">一般通知</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-position">位置</Label>
                    <Select
                      value={editingPopup.position}
                      onValueChange={(value: 'center' | 'top' | 'bottom') => 
                        setEditingPopup({...editingPopup, position: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="center">居中显示</SelectItem>
                        <SelectItem value="top">顶部显示</SelectItem>
                        <SelectItem value="bottom">底部显示</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-image">图片URL</Label>
                  <Input
                    id="edit-image"
                    value={editingPopup.image || ''}
                    onChange={(e) => setEditingPopup({...editingPopup, image: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-button_text">按钮文字</Label>
                    <Input
                      id="edit-button_text"
                      value={editingPopup.button_text || ''}
                      onChange={(e) => setEditingPopup({...editingPopup, button_text: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-button_url">按钮链接</Label>
                    <Input
                      id="edit-button_url"
                      value={editingPopup.button_url || ''}
                      onChange={(e) => setEditingPopup({...editingPopup, button_url: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-delay">延迟显示（秒）</Label>
                    <Input
                      id="edit-delay"
                      type="number"
                      value={editingPopup.delay}
                      onChange={(e) => setEditingPopup({...editingPopup, delay: parseInt(e.target.value) || 2})}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-auto_close">自动关闭（秒）</Label>
                    <Input
                      id="edit-auto_close"
                      type="number"
                      value={editingPopup.auto_close}
                      onChange={(e) => setEditingPopup({...editingPopup, auto_close: parseInt(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-frequency">显示频率</Label>
                    <Select
                      value={editingPopup.frequency}
                      onValueChange={(value: 'once' | 'daily' | 'session' | 'always') => 
                        setEditingPopup({...editingPopup, frequency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">仅一次</SelectItem>
                        <SelectItem value="daily">每日一次</SelectItem>
                        <SelectItem value="session">每次访问</SelectItem>
                        <SelectItem value="always">总是显示</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-start_date">开始日期</Label>
                    <Input
                      id="edit-start_date"
                      type="datetime-local"
                      value={editingPopup.start_date || ''}
                      onChange={(e) => setEditingPopup({...editingPopup, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-end_date">结束日期</Label>
                    <Input
                      id="edit-end_date"
                      type="datetime-local"
                      value={editingPopup.end_date || ''}
                      onChange={(e) => setEditingPopup({...editingPopup, end_date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-enabled"
                    checked={editingPopup.enabled}
                    onCheckedChange={(checked) => 
                      setEditingPopup({...editingPopup, enabled: checked})}
                  />
                  <Label htmlFor="edit-enabled">启用状态</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingPopup(null)}>
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

export default PopupManager;