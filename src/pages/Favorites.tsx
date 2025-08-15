import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { GameCard } from "@/components/GameCard";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  Star, 
  Search, 
  Filter, 
  ArrowLeft,
  Heart,
  Download,
  Calendar,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 模拟收藏的游戏数据
const mockFavoriteGames = [
  {
    id: 1,
    title: "Super Mario Bros.",
    description: "经典的马里奥兄弟游戏",
    image: "/placeholder.svg",
    category: "平台跳跃",
    downloads: 1234,
    rating: 4.8,
    size: "2.5MB",
    addedDate: "2024-01-15"
  },
  {
    id: 2,
    title: "Mario Kart",
    description: "刺激的卡丁车竞速游戏",
    image: "/placeholder.svg",
    category: "竞速游戏",
    downloads: 987,
    rating: 4.7,
    size: "5.2MB",
    addedDate: "2024-01-10"
  },
  {
    id: 3,
    title: "Super Mario World",
    description: "马里奥的世界冒险",
    image: "/placeholder.svg",
    category: "冒险游戏",
    downloads: 2156,
    rating: 4.9,
    size: "3.8MB",
    addedDate: "2024-01-08"
  }
];

const Favorites = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("addedDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favoriteGames, setFavoriteGames] = useState(mockFavoriteGames);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  // 搜索和排序逻辑
  const filteredAndSortedGames = favoriteGames
    .filter(game => 
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "downloads":
          aValue = a.downloads;
          bValue = b.downloads;
          break;
        case "rating":
          aValue = a.rating;
          bValue = b.rating;
          break;
        case "addedDate":
          aValue = new Date(a.addedDate).getTime();
          bValue = new Date(b.addedDate).getTime();
          break;
        default:
          aValue = a.title;
          bValue = b.title;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleRemoveFromFavorites = (gameId: number) => {
    setFavoriteGames(prev => prev.filter(game => game.id !== gameId));
  };

  if (!user) {
    return null;
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

        <div className="max-w-6xl mx-auto">
          {/* 页面标题和统计 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <Star className="w-8 h-8 mr-3 text-yellow-500" />
                我的收藏
              </h1>
              <p className="text-muted-foreground mt-2">
                您收藏了 {favoriteGames.length} 个游戏
              </p>
            </div>
            
            {/* 统计卡片 */}
            <div className="hidden md:flex space-x-4">
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="text-2xl font-bold">{favoriteGames.length}</div>
                    <div className="text-xs text-muted-foreground">收藏游戏</div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Download className="w-5 h-5 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">
                      {favoriteGames.reduce((sum, game) => sum + game.downloads, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">总下载量</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* 搜索和筛选工具栏 */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* 搜索框 */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索收藏的游戏..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* 排序选择 */}
                <div className="flex items-center space-x-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="addedDate">添加时间</SelectItem>
                      <SelectItem value="title">游戏名称</SelectItem>
                      <SelectItem value="downloads">下载量</SelectItem>
                      <SelectItem value="rating">评分</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  >
                    {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </Button>
                </div>

                {/* 视图模式切换 */}
                <div className="flex items-center space-x-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 游戏列表 */}
          {filteredAndSortedGames.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchTerm ? "未找到匹配的游戏" : "暂无收藏的游戏"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm 
                    ? "尝试调整搜索条件或清空搜索框" 
                    : "去发现一些有趣的游戏并添加到收藏吧！"
                  }
                </p>
                <div className="space-x-2">
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      清空搜索
                    </Button>
                  )}
                  <Button onClick={() => navigate('/')}>
                    去发现游戏
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {filteredAndSortedGames.map((game) => (
                <div key={game.id} className="relative group">
                  {viewMode === "grid" ? (
                    <GameCard
                      id={game.id}
                      title={game.title}
                      description={game.description}
                      image={game.image}
                      category={game.category}
                      downloads={game.downloads}
                      rating={game.rating}
                      size={game.size}
                    />
                  ) : (
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={game.image} 
                            alt={game.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{game.title}</h3>
                            <p className="text-muted-foreground text-sm">{game.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="secondary">{game.category}</Badge>
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Download className="w-3 h-3 mr-1" />
                                {game.downloads}
                              </span>
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                {game.rating}
                              </span>
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(game.addedDate).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button 
                              size="sm"
                              onClick={() => navigate(`/game/${game.id}`)}
                            >
                              查看详情
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRemoveFromFavorites(game.id)}
                            >
                              取消收藏
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* 网格模式下的取消收藏按钮 */}
                  {viewMode === "grid" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveFromFavorites(game.id)}
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;