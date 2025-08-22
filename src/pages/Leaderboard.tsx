import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useNavigate } from "react-router-dom";
import { 
  Trophy, 
  ArrowLeft,
  Medal,
  Crown,
  Star,
  Download,
  Heart,
  Gamepad2,
  TrendingUp,
  Calendar,
  Users,
  Award,
  Loader2,
  Eye
} from "lucide-react";

const Leaderboard = () => {
  const navigate = useNavigate();
  const { games, loading, error } = useSupabaseData();
  const [activeTab, setActiveTab] = useState("downloads");

  // 根据下载量排序的游戏排行榜
  const popularGames = games
    .slice()
    .sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
    .slice(0, 10)
    .map((game, index) => ({
      ...game,
      rank: index + 1,
      change: 0
    }));

  // 根据浏览量排序
  const viewsRanking = games
    .slice()
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 10)
    .map((game, index) => ({
      ...game,
      rank: index + 1,
      change: 0
    }));

  // 最新游戏排行
  const latestGames = games
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map((game, index) => ({
      ...game,
      rank: index + 1,
      change: 0
    }));

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    }
    return <div className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">加载排行榜数据中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-4">数据加载失败: {error}</p>
              <Button onClick={() => window.location.reload()}>重新加载</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回首页
        </Button>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* 页面标题 */}
          <div className="text-center">
            <h1 className="text-4xl font-bold flex items-center justify-center">
              <Trophy className="w-10 h-10 mr-3 text-yellow-500" />
              排行榜
            </h1>
            <p className="text-xl text-muted-foreground">
              查看最受欢迎的游戏排行榜
            </p>
          </div>

          {/* 统计概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">-</div>
                <div className="text-sm text-muted-foreground">活跃用户</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Download className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">
                  {games.reduce((sum, game) => sum + (game.download_count || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">总下载量</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">{games.length}</div>
                <div className="text-sm text-muted-foreground">游戏总数</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold">4.5</div>
                <div className="text-sm text-muted-foreground">平均评分</div>
              </CardContent>
            </Card>
          </div>

          {/* 排行榜标签页 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="downloads">下载排行</TabsTrigger>
              <TabsTrigger value="views">浏览排行</TabsTrigger>
              <TabsTrigger value="latest">最新游戏</TabsTrigger>
            </TabsList>
            
            {/* 下载排行榜 */}
            <TabsContent value="downloads" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="w-5 h-5 mr-2 text-green-500" />
                    下载量排行榜
                  </CardTitle>
                  <CardDescription>
                    根据游戏的下载数量排名
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popularGames.map((game, index) => (
                      <div 
                        key={game.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer ${
                          index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : ''
                        }`}
                        onClick={() => navigate(`/game/${game.id}`)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(game.rank)}
                          </div>
                          <img 
                            src={game.cover_image || "/placeholder.svg"} 
                            alt={game.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-semibold">{game.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {game.category} • {game.download_count || 0} 次下载
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getChangeIcon(game.change)}
                          {game.rank <= 3 && (
                            <Badge variant={game.rank === 1 ? "default" : "secondary"}>
                              {game.rank === 1 ? "冠军" : game.rank === 2 ? "亚军" : "季军"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 浏览排行榜 */}
            <TabsContent value="views" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-500" />
                    浏览量排行榜
                  </CardTitle>
                  <CardDescription>
                    根据游戏的浏览次数排名
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {viewsRanking.map((game, index) => (
                      <div 
                        key={game.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer ${
                          index < 3 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : ''
                        }`}
                        onClick={() => navigate(`/game/${game.id}`)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(game.rank)}
                          </div>
                          <img 
                            src={game.cover_image || "/placeholder.svg"} 
                            alt={game.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-semibold">{game.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {game.category} • {game.view_count || 0} 次浏览
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getChangeIcon(game.change)}
                          {game.rank <= 3 && (
                            <Badge variant={game.rank === 1 ? "default" : "secondary"}>
                              {game.rank === 1 ? "最热" : game.rank === 2 ? "很热" : "热门"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 最新游戏 */}
            <TabsContent value="latest" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                    最新游戏排行榜
                  </CardTitle>
                  <CardDescription>
                    按发布时间排序的最新游戏
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {latestGames.map((game, index) => (
                      <div 
                        key={game.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer ${
                          index < 3 ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' : ''
                        }`}
                        onClick={() => navigate(`/game/${game.id}`)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(game.rank)}
                          </div>
                          <img 
                            src={game.cover_image || "/placeholder.svg"} 
                            alt={game.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-semibold">{game.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {game.category} • {new Date(game.created_at).toLocaleDateString('zh-CN')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {game.rank <= 3 && (
                            <Badge variant={game.rank === 1 ? "default" : "secondary"}>
                              {game.rank === 1 ? "最新" : game.rank === 2 ? "新品" : "新作"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;