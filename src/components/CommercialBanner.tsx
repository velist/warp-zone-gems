import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Download, 
  Users, 
  TrendingUp, 
  Clock, 
  Gift,
  Zap,
  Trophy,
  ChevronRight,
  Play,
  Flame,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface HotGame {
  id: string;
  title: string;
  image: string;
  downloads: number;
  rating: number;
  isNew?: boolean;
  isTrending?: boolean;
}

export const CommercialBanner: React.FC = () => {
  const navigate = useNavigate();
  const { games } = useSupabaseData();
  const [currentTime, setCurrentTime] = useState(new Date());

  // 模拟热门游戏数据
  const hotGames: HotGame[] = [
    {
      id: 'super-mario-bros',
      title: '超级马里奥兄弟',
      image: '/placeholder.svg',
      downloads: 15420,
      rating: 4.9,
      isTrending: true
    },
    {
      id: 'mario-kart',
      title: '马里奥卡丁车',
      image: '/placeholder.svg',
      downloads: 12890,
      rating: 4.8,
      isNew: true
    },
    {
      id: 'mario-galaxy',
      title: '马里奥银河',
      image: '/placeholder.svg',
      downloads: 9876,
      rating: 4.9
    }
  ];

  // 实时时间更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 模拟实时统计
  const [liveStats, setLiveStats] = useState({
    onlineUsers: 2847,
    todayDownloads: 1256,
    totalGames: games.length || 156
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveStats(prev => ({
        onlineUsers: prev.onlineUsers + Math.floor(Math.random() * 10 - 5),
        todayDownloads: prev.todayDownloads + Math.floor(Math.random() * 3),
        totalGames: games.length || prev.totalGames
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, [games.length]);

  return (
    <div className="space-y-6">
      {/* 主要Banner - 今日推荐 */}
      <Card className="overflow-hidden bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-2 border-primary/20">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* 左侧 - 主要内容 */}
            <div className="lg:col-span-2 p-6 lg:p-8">
              <div className="flex items-center space-x-2 mb-4">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <Flame className="w-3 h-3 mr-1" />
                  今日精选
                </Badge>
                <Badge variant="outline" className="border-green-500 text-green-600">
                  <Zap className="w-3 h-3 mr-1" />
                  限时免费
                </Badge>
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                🎮 马里奥冒险大合集
              </h2>
              
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                包含50+经典马里奥游戏，从初代到最新作品全覆盖！
                <br />
                <span className="text-primary font-medium">今日下载量突破10,000次！</span>
              </p>

              {/* 特色功能 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm">免费下载</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm">4.9星好评</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm">即时游玩</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm">成就系统</span>
                </div>
              </div>

              {/* 下载进度模拟 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">今日下载进度</span>
                  <span className="text-sm text-muted-foreground">75% 已完成</span>
                </div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  还有 2小时25分钟 限时优惠结束
                </p>
              </div>

              {/* CTA按钮 */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg" 
                  className="mario-button flex-1 max-w-xs"
                  onClick={() => navigate('/categories')}
                >
                  <Download className="w-5 h-5 mr-2" />
                  立即免费下载
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="flex-1 max-w-xs hover:scale-105 transition-transform"
                  onClick={() => navigate('/game/super-mario-bros')}
                >
                  <Play className="w-5 h-5 mr-2" />
                  在线试玩
                </Button>
              </div>
            </div>

            {/* 右侧 - 热门游戏预览 */}
            <div className="bg-card/50 p-6 border-l border-border">
              <h3 className="font-semibold mb-4 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
                实时热门
              </h3>
              
              <div className="space-y-3">
                {hotGames.map((game, index) => (
                  <div 
                    key={game.id}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background/80 transition-colors cursor-pointer"
                    onClick={() => navigate(`/game/${game.id}`)}
                  >
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-lg">🎮</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium truncate text-sm">{game.title}</h4>
                        {game.isNew && (
                          <Badge variant="secondary" className="text-xs px-1">新</Badge>
                        )}
                        {game.isTrending && (
                          <Badge variant="destructive" className="text-xs px-1">热</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Download className="w-3 h-3 mr-1" />
                          {game.downloads.toLocaleString()}
                        </span>
                        <span className="flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          {game.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                variant="ghost" 
                className="w-full mt-4 text-sm"
                onClick={() => navigate('/categories')}
              >
                查看所有热门游戏
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 实时统计栏 */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <div className="text-2xl font-bold text-green-600">{liveStats.onlineUsers.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">在线用户</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <Download className="w-4 h-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{liveStats.todayDownloads.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">今日下载</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{liveStats.totalGames}</div>
                <div className="text-xs text-muted-foreground">游戏总数</div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <div>
                <div className="text-lg font-bold text-purple-600">
                  {currentTime.toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                <div className="text-xs text-muted-foreground">当前时间</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 限时活动Banner */}
      <Card className="overflow-hidden bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                  🎁 新用户福利
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  注册即送VIP会员7天，尊享无限下载！
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => navigate('/auth')}
              >
                立即注册
              </Button>
              <Button 
                variant="outline" 
                className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                onClick={() => navigate('/about')}
              >
                了解详情
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};