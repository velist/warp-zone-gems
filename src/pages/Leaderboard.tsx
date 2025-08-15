import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
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
  Award
} from "lucide-react";

// 模拟排行榜数据
const downloadLeaderboard = [
  { id: 1, username: "马里奥大师", avatar: "/placeholder.svg", downloads: 2847, rank: 1, change: 0 },
  { id: 2, username: "路易吉粉丝", avatar: "/placeholder.svg", downloads: 2156, rank: 2, change: 1 },
  { id: 3, username: "耀西爱好者", avatar: "/placeholder.svg", downloads: 1923, rank: 3, change: -1 },
  { id: 4, username: "蘑菇王国", avatar: "/placeholder.svg", downloads: 1687, rank: 4, change: 2 },
  { id: 5, username: "酷霸王", avatar: "/placeholder.svg", downloads: 1534, rank: 5, change: 0 },
  { id: 6, username: "桃花公主", avatar: "/placeholder.svg", downloads: 1423, rank: 6, change: -2 },
  { id: 7, username: "库巴Jr", avatar: "/placeholder.svg", downloads: 1298, rank: 7, change: 1 },
  { id: 8, username: "奇诺比奥", avatar: "/placeholder.svg", downloads: 1156, rank: 8, change: -1 },
  { id: 9, username: "害羞幽灵", avatar: "/placeholder.svg", downloads: 1087, rank: 9, change: 0 },
  { id: 10, username: "栗子小子", avatar: "/placeholder.svg", downloads: 967, rank: 10, change: 0 }
];

const contributionLeaderboard = [
  { id: 1, username: "游戏收集家", avatar: "/placeholder.svg", contributions: 45, rank: 1, change: 0 },
  { id: 2, username: "资源分享者", avatar: "/placeholder.svg", contributions: 38, rank: 2, change: 1 },
  { id: 3, username: "马里奥专家", avatar: "/placeholder.svg", contributions: 32, rank: 3, change: -1 },
  { id: 4, username: "游戏猎人", avatar: "/placeholder.svg", contributions: 28, rank: 4, change: 0 },
  { id: 5, username: "经典守护者", avatar: "/placeholder.svg", contributions: 24, rank: 5, change: 2 }
];

const popularGames = [
  { id: 1, title: "Super Mario Bros.", downloads: 15420, rating: 4.9, rank: 1, change: 0 },
  { id: 2, title: "Mario Kart", downloads: 12856, rating: 4.8, rank: 2, change: 1 },
  { id: 3, title: "Super Mario World", downloads: 11743, rating: 4.9, rank: 3, change: -1 },
  { id: 4, title: "Mario Party", downloads: 9632, rating: 4.7, rank: 4, change: 0 },
  { id: 5, title: "Paper Mario", downloads: 8547, rating: 4.6, rank: 5, change: 2 }
];

const Leaderboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("downloads");

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (change < 0) {
      return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    } else {
      return <span className="w-4 h-4 text-muted-foreground">-</span>;
    }
  };

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
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
              <Trophy className="w-10 h-10 mr-3 text-yellow-500" />
              排行榜
            </h1>
            <p className="text-xl text-muted-foreground">
              查看社区中最活跃的用户和最受欢迎的游戏
            </p>
          </div>

          {/* 统计概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-sm text-muted-foreground">活跃用户</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Download className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">52,341</div>
                <div className="text-sm text-muted-foreground">总下载量</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">186</div>
                <div className="text-sm text-muted-foreground">游戏总数</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold">4.8</div>
                <div className="text-sm text-muted-foreground">平均评分</div>
              </CardContent>
            </Card>
          </div>

          {/* 排行榜标签页 */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="downloads">下载排行</TabsTrigger>
              <TabsTrigger value="contributions">贡献排行</TabsTrigger>
              <TabsTrigger value="games">热门游戏</TabsTrigger>
            </TabsList>
            
            {/* 下载排行榜 */}
            <TabsContent value="downloads" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="w-5 h-5 mr-2 text-green-500" />
                    下载达人排行榜
                  </CardTitle>
                  <CardDescription>
                    根据用户的游戏下载数量排名
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {downloadLeaderboard.map((user, index) => (
                      <div 
                        key={user.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
                          index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(user.rank)}
                          </div>
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{user.username}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.downloads} 次下载
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getChangeIcon(user.change)}
                          {user.rank <= 3 && (
                            <Badge variant={user.rank === 1 ? "default" : "secondary"}>
                              {user.rank === 1 ? "冠军" : user.rank === 2 ? "亚军" : "季军"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 贡献排行榜 */}
            <TabsContent value="contributions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-red-500" />
                    社区贡献排行榜
                  </CardTitle>
                  <CardDescription>
                    根据用户的游戏分享和社区贡献排名
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contributionLeaderboard.map((user, index) => (
                      <div 
                        key={user.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 ${
                          index < 3 ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(user.rank)}
                          </div>
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold">{user.username}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.contributions} 个贡献
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getChangeIcon(user.change)}
                          {user.rank <= 3 && (
                            <Badge variant={user.rank === 1 ? "default" : "secondary"}>
                              {user.rank === 1 ? "最佳贡献者" : user.rank === 2 ? "优秀贡献者" : "活跃贡献者"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 热门游戏排行榜 */}
            <TabsContent value="games" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Gamepad2 className="w-5 h-5 mr-2 text-purple-500" />
                    热门游戏排行榜
                  </CardTitle>
                  <CardDescription>
                    根据游戏的下载量和评分排名
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {popularGames.map((game, index) => (
                      <div 
                        key={game.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer ${
                          index < 3 ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200' : ''
                        }`}
                        onClick={() => navigate(`/game/${game.id}`)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8">
                            {getRankIcon(game.rank)}
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                            <Gamepad2 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold">{game.title}</div>
                            <div className="text-sm text-muted-foreground flex items-center space-x-4">
                              <span className="flex items-center">
                                <Download className="w-3 h-3 mr-1" />
                                {game.downloads.toLocaleString()}
                              </span>
                              <span className="flex items-center">
                                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                {game.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getChangeIcon(game.change)}
                          {game.rank <= 3 && (
                            <Badge variant={game.rank === 1 ? "default" : "secondary"}>
                              {game.rank === 1 ? "最热门" : game.rank === 2 ? "超人气" : "很受欢迎"}
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

          {/* 更新时间 */}
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>排行榜每日更新，最后更新时间：{new Date().toLocaleDateString('zh-CN')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;