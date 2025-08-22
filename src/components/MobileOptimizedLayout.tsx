import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Download, 
  Star, 
  TrendingUp, 
  Users,
  Zap,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MobileOptimizedLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="block md:hidden space-y-4">
      {/* 移动端快速搜索 */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardContent className="p-4">
          <div 
            className="flex items-center space-x-3 bg-background rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/search')}
          >
            <Search className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground flex-1">搜索马里奥游戏...</span>
            <Badge variant="secondary" className="text-xs">🔥</Badge>
          </div>
        </CardContent>
      </Card>

      {/* 移动端热门推荐 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
              今日热门
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/categories')}
            >
              更多
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {[
              { title: '超级马里奥兄弟', downloads: '15.4K', rating: 4.9, badge: '热' },
              { title: '马里奥卡丁车', downloads: '12.8K', rating: 4.8, badge: '新' },
              { title: '马里奥银河', downloads: '9.8K', rating: 4.9, badge: '' }
            ].map((game, index) => (
              <div 
                key={index}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => navigate(`/game/${game.title}`)}
              >
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <span className="text-sm">🎮</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-sm truncate">{game.title}</h4>
                    {game.badge && (
                      <Badge 
                        variant={game.badge === '热' ? 'destructive' : 'secondary'} 
                        className="text-xs px-1"
                      >
                        {game.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Download className="w-3 h-3 mr-1" />
                      {game.downloads}
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
        </CardContent>
      </Card>

      {/* 移动端快速统计 */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">2.8K</div>
              <div className="text-xs text-muted-foreground">在线</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">156</div>
              <div className="text-xs text-muted-foreground">游戏</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">1.2K</div>
              <div className="text-xs text-muted-foreground">今日下载</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 移动端快速操作 */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          className="mario-button"
          onClick={() => navigate('/categories')}
        >
          <Zap className="w-4 h-4 mr-2" />
          浏览游戏
        </Button>
        <Button 
          variant="outline"
          onClick={() => navigate('/auth')}
        >
          <Users className="w-4 h-4 mr-2" />
          注册会员
        </Button>
      </div>
    </div>
  );
};