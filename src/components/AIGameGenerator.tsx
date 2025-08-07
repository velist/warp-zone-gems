import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Wand2, Copy, Check, X } from 'lucide-react';
import { SiliconFlowAPI } from '@/lib/siliconFlowAPI';
import type { GameGenerationRequest, GameGenerationResponse } from '@/lib/siliconFlowAPI';

interface AIGameGeneratorProps {
  onGenerate: (data: {
    title: string;
    description: string;
    content: string;
    tags: string[];
    category: string;
  }) => void;
}

const AIGameGenerator: React.FC<AIGameGeneratorProps> = ({ onGenerate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [copied, setCopied] = useState<string>('');

  const [formData, setFormData] = useState<GameGenerationRequest>({
    gameName: '',
    gameType: '',
    keywords: []
  });

  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords?.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || []
    }));
  };

  const handleGenerate = async () => {
    if (!formData.gameName?.trim() && !formData.gameType?.trim() && (!formData.keywords || formData.keywords.length === 0)) {
      setError('请至少填写游戏名称、游戏类型或关键词中的一项');
      return;
    }

    setGenerating(true);
    setError('');
    setGeneratedData(null);

    try {
      // 从localStorage获取API配置
      const settingsStr = localStorage.getItem('admin_settings');
      if (!settingsStr) {
        throw new Error('请先在系统设置中配置API密钥');
      }

      const settings = JSON.parse(settingsStr);
      if (!settings.siliconflow_api_key) {
        throw new Error('请先在系统设置中配置硅基流动API密钥');
      }

      const api = new SiliconFlowAPI({
        apiKey: settings.siliconflow_api_key,
        baseURL: settings.siliconflow_base_url || 'https://api.siliconflow.cn/v1',
        model: settings.siliconflow_model || 'Qwen/Qwen2.5-7B-Instruct'
      });

      const result: GameGenerationResponse = await api.generateGameInfo(formData);

      if (result.success && result.data) {
        setGeneratedData(result.data);
      } else {
        throw new Error(result.error || 'AI生成失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请稍后重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (field: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(field);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleApply = () => {
    if (generatedData) {
      onGenerate(generatedData);
      setIsOpen(false);
      setGeneratedData(null);
      setFormData({ gameName: '', gameType: '', keywords: [] });
    }
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        AI智能生成
      </Button>
    );
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
              AI智能生成游戏信息
            </CardTitle>
            <CardDescription>
              输入基本信息，AI将自动生成详细的游戏介绍内容
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!generatedData ? (
          <>
            {/* 输入表单 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gameName">游戏名称</Label>
                <Input
                  id="gameName"
                  value={formData.gameName}
                  onChange={(e) => setFormData(prev => ({ ...prev, gameName: e.target.value }))}
                  placeholder="例如：超级马里奥兄弟"
                />
              </div>
              <div>
                <Label htmlFor="gameType">游戏类型</Label>
                <Input
                  id="gameType"
                  value={formData.gameType}
                  onChange={(e) => setFormData(prev => ({ ...prev, gameType: e.target.value }))}
                  placeholder="例如：平台跳跃游戏"
                />
              </div>
            </div>

            {/* 关键词 */}
            <div>
              <Label>关键词标签</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="添加关键词..."
                  onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                />
                <Button type="button" onClick={handleAddKeyword}>
                  添加
                </Button>
              </div>
              {formData.keywords && formData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{keyword}</span>
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-600"
                        onClick={() => handleRemoveKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 生成按钮 */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                取消
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
              >
                {generating ? (
                  <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {generating ? '生成中...' : '开始生成'}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* 生成结果 */}
            <div className="space-y-4">
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertDescription>
                  AI已生成完整的游戏信息，您可以预览并选择应用到表单中。
                </AlertDescription>
              </Alert>

              {/* 标题 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-semibold">生成的标题</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy('title', generatedData.title)}
                  >
                    {copied === 'title' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  {generatedData.title}
                </div>
              </div>

              {/* 分类 */}
              <div>
                <Label className="font-semibold">分类</Label>
                <div className="mt-2">
                  <Badge variant="secondary">{generatedData.category}</Badge>
                </div>
              </div>

              {/* 简介 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-semibold">简介</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy('description', generatedData.description)}
                  >
                    {copied === 'description' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="p-3 bg-white rounded-lg border max-h-32 overflow-y-auto">
                  {generatedData.description}
                </div>
              </div>

              {/* 标签 */}
              <div>
                <Label className="font-semibold">标签</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {generatedData.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 详细内容 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-semibold">详细内容</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy('content', generatedData.content)}
                  >
                    {copied === 'content' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="p-3 bg-white rounded-lg border max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {generatedData.content}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setGeneratedData(null)}
              >
                重新生成
              </Button>
              <Button
                onClick={handleApply}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600"
              >
                应用到表单
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIGameGenerator;