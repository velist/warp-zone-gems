import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from "@/components/Header";
import { SEOHead, createGameSEO } from "@/components/SEOHead";
import { QRCodeModal } from "@/components/QRCodeModal";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import HideContent from '@/components/HideContent';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Download, Star, Eye, Clock, Tag, User, Calendar } from 'lucide-react';

interface DownloadLink {
  type: string;
  url: string;
  password?: string;
  label?: string;
}

interface Game {
  id: string;
  title: string;
  description?: string;
  content?: string;
  cover_image?: string;
  category: string;
  tags?: string[];
  author?: string;
  published_at?: string;
  download_link?: string;
  download_links?: DownloadLink[];
}

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGame(id);
    }
  }, [id]);

  const fetchGame = async (gameId: string) => {
    try {
      setLoading(true);
      
      // 检测环境并选择数据源
      const isProduction = window.location.hostname === 'velist.github.io' || 
                          window.location.hostname === 'aigame.lol' ||
                          window.location.protocol === 'https:' ||
                          process.env.NODE_ENV === 'production';
      
      let gamesData;
      
      if (isProduction) {
        // 生产环境：直接读取静态JSON文件
        console.log('Production mode: fetching games from static JSON');
        const response = await fetch('/data/games.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch games: ${response.status}`);
        }
        gamesData = await response.json();
      } else {
        // 开发环境：使用本地管理后台API
        console.log('Development mode: fetching games from local API');
        const response = await fetch('http://localhost:3008/api/data/games');
        const result = await response.json();

        if (!result.success) {
          setError(result.error || '获取游戏数据失败');
          return;
        }
        gamesData = result.data;
      }

      // 查找指定ID的游戏
      const foundGame = gamesData?.find((game: Game) => game.id === gameId);
      
      if (!foundGame) {
        setError('游戏不存在');
      } else if (foundGame.status !== 'published') {
        setError('游戏未发布或已下架');
      } else {
        setGame(foundGame);
      }
    } catch (err) {
      console.error('Fetch game error:', err);
      const errorMessage = isProduction ? 
        '获取游戏详情失败' : 
        '获取游戏详情失败，请确保管理后台服务正在运行';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRevealContent = (postId: string, blockId: string) => {
    // 这里可以记录用户查看隐藏内容的行为
    console.log(`User revealed hidden content: ${blockId} in post: ${postId}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDownloadLinks = (): DownloadLink[] => {
    if (!game) return [];
    
    const links: DownloadLink[] = [];
    
    // 优先使用新的 download_links 数组
    if (game.download_links && game.download_links.length > 0) {
      return game.download_links;
    }
    
    // 兼容旧的 download_link 字段
    if (game.download_link && game.download_link !== '#') {
      links.push({
        type: '下载链接',
        url: game.download_link,
        label: '默认下载'
      });
    }
    
    return links;
  };

  const handleDownloadClick = () => {
    const downloadLinks = getDownloadLinks();
    
    if (downloadLinks.length === 0) {
      return; // 没有下载链接
    }
    
    if (downloadLinks.length === 1) {
      // 只有一个链接，直接打开
      window.open(downloadLinks[0].url, '_blank');
    } else {
      // 多个链接，显示QR码模态框
      setShowQRModal(true);
    }
  };

  const downloadLinks = getDownloadLinks();
  const hasDownload = downloadLinks.length > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-2/3 mb-8" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-48 w-full mb-6" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <Alert className="max-w-md mx-auto">
            <AlertDescription>
              {error || '游戏不存在'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...createGameSEO(game)} />
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容区域 */}
          <div className="lg:col-span-2">
            {/* 游戏封面 */}
            <div className="relative mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
              {game.cover_image ? (
                <img
                  src={game.cover_image}
                  alt={game.title}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="text-4xl">🎮</span>
                  </div>
                </div>
              )}
              
              {/* 分类标签 */}
              <Badge 
                className="absolute top-4 left-4 coin-shine"
                style={{ backgroundColor: `hsl(var(--accent))`, color: `hsl(var(--accent-foreground))` }}
              >
                <Tag className="w-3 h-3 mr-1" />
                {game.category}
              </Badge>
            </div>

            {/* 游戏标题和基本信息 */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {game.title}
              </h1>
              
              {game.description && (
                <p className="text-muted-foreground text-lg mb-4">
                  {game.description}
                </p>
              )}

              {/* 元信息 */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                {game.author && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    作者: {game.author}
                  </div>
                )}
                {game.published_at && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    发布: {formatDate(game.published_at)}
                  </div>
                )}
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  浏览: {game.view_count || 0}
                </div>
                <div className="flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  下载: {game.download_count || 0}
                </div>
              </div>

              {/* 标签 */}
              {game.tags && game.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {game.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="coin-shine hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* 游戏详细内容 */}
            {game.content && (
              <Card className="block-card">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    📖 游戏详情
                  </h2>
                  <div className="prose max-w-none">
                    <HideContent 
                      content={game.content}
                      postId={game.id}
                      userId={user?.id}
                      requireLogin={false}
                      requireReply={false}
                      onReveal={handleRevealContent}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 侧边栏 */}
          <div>
            {/* 游戏信息卡片 */}
            <Card className="block-card mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  ℹ️ 游戏信息
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">分类:</span>
                    <Badge variant="secondary">{game.category}</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">评分:</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span>4.8/5.0</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">文件大小:</span>
                    <span>{Math.floor(Math.random() * 500) + 50} MB</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">更新时间:</span>
                    <span>{formatDate(game.published_at)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 下载按钮 */}
            <div className="space-y-3">
              <Button 
                className="w-full mario-button animate-power-up" 
                size="lg"
                onClick={handleDownloadClick}
                disabled={!hasDownload}
              >
                <Download className="w-5 h-5 mr-2" />
                {hasDownload ? (downloadLinks.length > 1 ? `立即下载 (${downloadLinks.length} 个选项)` : '立即下载') : '暂无下载'}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                size="lg"
              >
                <Star className="w-5 h-5 mr-2" />
                收藏游戏
              </Button>
            </div>

            {/* 相关推荐 */}
            <Card className="block-card mt-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  🎯 相关推荐
                </h3>
                <p className="text-sm text-muted-foreground">
                  基于当前游戏的相关推荐功能即将上线...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal 
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        downloadLinks={downloadLinks}
        gameTitle={game?.title || ''}
      />
    </div>
  );
};

export default GameDetail;