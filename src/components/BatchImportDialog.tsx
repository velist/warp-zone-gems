import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  FileText, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Copy,
  Trash2
} from 'lucide-react';
import { AIContentProcessor, GameInfo, BatchProcessResult, ContentRecognitionMode } from '@/lib/aiContentProcessor';
import { useToast } from '@/hooks/use-toast';

interface BatchImportDialogProps {
  apiKey: string;
  model: string;
  onImportComplete: (games: GameInfo[]) => void;
}

export function BatchImportDialog({ apiKey, model, onImportComplete }: BatchImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BatchProcessResult | null>(null);
  const [selectedGames, setSelectedGames] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputText(content);
      toast({
        title: "文件上传成功",
        description: `已读取 ${content.length} 个字符`,
      });
    };
    reader.readAsText(file);
  };

  // 开始批量处理
  const handleBatchProcess = async () => {
    if (!inputText.trim()) {
      toast({
        title: "输入为空",
        description: "请输入游戏信息或上传文件",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "API Key 未配置",
        description: "请先在管理员设置中配置 Silicon Flow API Key",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      const processor = new AIContentProcessor(apiKey, model, 3, 1500); // 3个并发，1.5秒延迟
      
      // 提取游戏列表
      const gameList = await processor.extractGameList(inputText);
      
      if (gameList.length === 0) {
        throw new Error('未能从输入内容中提取到游戏信息');
      }

      // 批量处理
      const batchResult = await processor.batchProcessGames(
        gameList,
        (processed, total) => {
          setProgress((processed / total) * 100);
        }
      );

      setResult(batchResult);
      setSelectedGames(new Set(batchResult.success.map((_, index) => index)));

      toast({
        title: "批量处理完成",
        description: `成功处理 ${batchResult.success.length} 个游戏，失败 ${batchResult.failed.length} 个`,
      });

    } catch (error) {
      console.error('Batch processing failed:', error);
      toast({
        title: "批量处理失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 导入选中的游戏
  const handleImportSelected = () => {
    if (!result || selectedGames.size === 0) return;

    const selectedGameList = result.success.filter((_, index) => selectedGames.has(index));
    onImportComplete(selectedGameList);
    
    toast({
      title: "导入成功",
      description: `已导入 ${selectedGameList.length} 个游戏`,
    });

    // 重置状态
    setIsOpen(false);
    setInputText('');
    setResult(null);
    setSelectedGames(new Set());
    setProgress(0);
  };

  // 切换游戏选择
  const toggleGameSelection = (index: number) => {
    const newSelected = new Set(selectedGames);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedGames(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (!result) return;
    
    if (selectedGames.size === result.success.length) {
      setSelectedGames(new Set());
    } else {
      setSelectedGames(new Set(result.success.map((_, index) => index)));
    }
  };

  // 清空结果
  const clearResults = () => {
    setResult(null);
    setSelectedGames(new Set());
    setProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          批量导入
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            AI 批量游戏导入
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="input" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="input">输入内容</TabsTrigger>
            <TabsTrigger value="results" disabled={!result}>
              处理结果 {result && `(${result.success.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="input" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">输入游戏信息</CardTitle>
                <CardDescription>
                  支持多种格式：游戏标题列表、带描述的游戏信息、或混合内容
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    上传文件
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setInputText('')}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    清空
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <Textarea
                  placeholder={`请输入游戏信息，支持以下格式：

1. 简单列表：
Super Mario Bros.
Mario Kart 8 Deluxe
Super Mario Odyssey

2. 带描述：
Super Mario Bros. - 经典的平台跳跃游戏
Mario Kart 8 Deluxe - 最受欢迎的赛车游戏

3. 详细信息：
标题：Super Mario Bros.
分类：平台跳跃
描述：经典的马里奥游戏...

支持复制粘贴任何包含游戏信息的文本！`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    字符数：{inputText.length}
                  </div>
                  <Button
                    onClick={handleBatchProcess}
                    disabled={isProcessing || !inputText.trim()}
                    className="gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    {isProcessing ? '处理中...' : '开始处理'}
                  </Button>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>处理进度</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="mt-4 overflow-hidden">
            {result && (
              <div className="space-y-4 h-full overflow-hidden">
                {/* 结果统计 */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      成功 {result.success.length}
                    </Badge>
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      失败 {result.failed.length}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      已选 {selectedGames.size}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectAll}
                    >
                      {selectedGames.size === result.success.length ? '取消全选' : '全选'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearResults}
                      className="gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      清空
                    </Button>
                    <Button
                      onClick={handleImportSelected}
                      disabled={selectedGames.size === 0}
                      className="gap-1"
                    >
                      <Download className="h-3 w-3" />
                      导入选中 ({selectedGames.size})
                    </Button>
                  </div>
                </div>

                {/* 成功结果列表 */}
                <ScrollArea className="flex-1 border rounded-lg">
                  <div className="p-4 space-y-3">
                    {result.success.map((game, index) => (
                      <Card 
                        key={index}
                        className={`cursor-pointer transition-colors ${
                          selectedGames.has(index) 
                            ? 'ring-2 ring-blue-500 bg-blue-50' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => toggleGameSelection(index)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{game.title}</h4>
                              {game.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                  {game.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {game.category && (
                                  <Badge variant="secondary">{game.category}</Badge>
                                )}
                                {game.platform && (
                                  <Badge variant="outline">{game.platform}</Badge>
                                )}
                                {game.tags?.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="ml-4">
                              {selectedGames.has(index) ? (
                                <CheckCircle className="h-5 w-5 text-blue-500" />
                              ) : (
                                <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                {/* 失败结果 */}
                {result.failed.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <details className="mt-2">
                        <summary className="cursor-pointer font-medium">
                          {result.failed.length} 个项目处理失败，点击查看详情
                        </summary>
                        <div className="mt-2 space-y-2 text-sm">
                          {result.failed.map((failure, index) => (
                            <div key={index} className="p-2 bg-red-50 rounded border-l-4 border-red-200">
                              <div className="font-medium">输入内容：</div>
                              <div className="text-gray-600 mb-1">{failure.input}</div>
                              <div className="font-medium">错误信息：</div>
                              <div className="text-red-600">{failure.error}</div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}