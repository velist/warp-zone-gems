import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Save, TestTube, Key, Settings, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { SiliconFlowAPI, DEFAULT_SILICONFLOW_CONFIG, AVAILABLE_MODELS } from '@/lib/siliconFlowAPI';
import type { SiliconFlowConfig } from '@/lib/siliconFlowAPI';

interface SystemSettings {
  siliconflow_api_key: string;
  siliconflow_model: string;
  siliconflow_base_url: string;
  site_name: string;
  site_description: string;
  max_upload_size: number;
}

const AdminSettings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  const [settings, setSettings] = useState<SystemSettings>({
    siliconflow_api_key: '',
    siliconflow_model: DEFAULT_SILICONFLOW_CONFIG.model,
    siliconflow_base_url: DEFAULT_SILICONFLOW_CONFIG.baseURL,
    site_name: 'Warp Zone Gems',
    site_description: '马里奥游戏资源宝库',
    max_upload_size: 16
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // 从localStorage读取设置（实际项目中可以存储到数据库）
      const savedSettings = localStorage.getItem('admin_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (err) {
      setError('加载设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // 保存到localStorage（实际项目中应该保存到数据库）
      localStorage.setItem('admin_settings', JSON.stringify(settings));
      setSuccess('设置保存成功！');
    } catch (err) {
      setError('保存设置失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleTestAPI = async () => {
    if (!settings.siliconflow_api_key.trim()) {
      setError('请先输入API密钥');
      return;
    }

    setTesting(true);
    setTestResult(null);
    setError('');

    try {
      const apiConfig: SiliconFlowConfig = {
        apiKey: settings.siliconflow_api_key,
        baseURL: settings.siliconflow_base_url,
        model: settings.siliconflow_model
      };

      const api = new SiliconFlowAPI(apiConfig);
      const result = await api.testConnection();
      setTestResult(result);

      if (result.success) {
        setSuccess('API连接测试成功！');
      } else {
        setError(`API连接测试失败: ${result.error}`);
      }
    } catch (err) {
      setTestResult({ success: false, error: '测试过程中发生错误' });
      setError('测试过程中发生错误');
    } finally {
      setTesting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleInputChange = (field: keyof SystemSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setTestResult(null); // 清除之前的测试结果
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回仪表盘
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">系统设置</h1>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              退出登录
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="ai" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai">AI设置</TabsTrigger>
            <TabsTrigger value="general">通用设置</TabsTrigger>
            <TabsTrigger value="upload">上传设置</TabsTrigger>
          </TabsList>

          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  硅基流动 AI 配置
                </CardTitle>
                <CardDescription>
                  配置硅基流动API来启用AI自动生成功能。
                  <a 
                    href="https://cloud.siliconflow.cn/account/ak" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 ml-1"
                  >
                    获取API密钥
                  </a>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="api_key">API 密钥 *</Label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      id="api_key"
                      type="password"
                      value={settings.siliconflow_api_key}
                      onChange={(e) => handleInputChange('siliconflow_api_key', e.target.value)}
                      placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={handleTestAPI}
                      disabled={testing || !settings.siliconflow_api_key.trim()}
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      {testing ? '测试中...' : '测试连接'}
                    </Button>
                  </div>
                  {testResult && (
                    <div className={`flex items-center mt-2 text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {testResult.success ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1" />
                      )}
                      {testResult.success ? '连接成功' : testResult.error}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="model">AI 模型</Label>
                  <Select
                    value={settings.siliconflow_model}
                    onValueChange={(value) => handleInputChange('siliconflow_model', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择AI模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div>
                            <div className="font-medium">{model.name}</div>
                            <div className="text-xs text-gray-500">{model.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="base_url">API 基础地址</Label>
                  <Input
                    id="base_url"
                    value={settings.siliconflow_base_url}
                    onChange={(e) => handleInputChange('siliconflow_base_url', e.target.value)}
                    placeholder="https://api.siliconflow.cn/v1"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  网站基本设置
                </CardTitle>
                <CardDescription>
                  配置网站的基本信息和显示设置
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site_name">网站名称</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name}
                    onChange={(e) => handleInputChange('site_name', e.target.value)}
                    placeholder="网站名称"
                  />
                </div>

                <div>
                  <Label htmlFor="site_description">网站描述</Label>
                  <Input
                    id="site_description"
                    value={settings.site_description}
                    onChange={(e) => handleInputChange('site_description', e.target.value)}
                    placeholder="网站简短描述"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>上传设置</CardTitle>
                <CardDescription>
                  配置图片上传的相关参数
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="max_upload_size">最大上传大小 (MB)</Label>
                  <Input
                    id="max_upload_size"
                    type="number"
                    value={settings.max_upload_size}
                    onChange={(e) => handleInputChange('max_upload_size', parseInt(e.target.value) || 16)}
                    min="1"
                    max="50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    建议不超过16MB，过大的文件可能影响上传速度
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 保存按钮 */}
        <div className="flex justify-end pt-6">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;