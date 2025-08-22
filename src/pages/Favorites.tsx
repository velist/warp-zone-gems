import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { GameCard } from "@/components/GameCard";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseData } from "@/hooks/useSupabaseData";
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
  SortDesc,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 收藏管理工具函数
const getFavoriteIds = (): string[] => {
  try {
    const favorites = localStorage.getItem('gamesFavorites');
    return favorites ? JSON.parse(favorites) : [];
  } catch {
    return [];
  }
};

const addToFavorites = (gameId: string) => {
  const favorites = getFavoriteIds();
  if (!favorites.includes(gameId)) {
    favorites.push(gameId);
    localStorage.setItem('gamesFavorites', JSON.stringify(favorites));
  }
};

const removeFromFavorites = (gameId: string) => {
  const favorites = getFavoriteIds();
  const updated = favorites.filter(id => id !== gameId);
  localStorage.setItem('gamesFavorites', JSON.stringify(updated));
};

const Favorites = () => {
  const { user } = useAuth();
  const { games, loading, error } = useSupabaseData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // 获取收藏的游戏ID列表
  useEffect(() => {
    setFavoriteIds(getFavoriteIds());
  }, []);

  // 获取收藏的游戏数据
  const favoriteGames = games.filter(game => favoriteIds.includes(game.id));

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
      (game.description && game.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
          aValue = a.download_count || 0;
          bValue = b.download_count || 0;
          break;
        case "category":
          aValue = a.category;
          bValue = b.category;
          break;
        case "date":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
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

  const handleRemoveFromFavorites = (gameId: string) => {
    removeFromFavorites(gameId);
    setFavoriteIds(getFavoriteIds());
  };

  // 如果数据加载中，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">加载收藏数据中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                      <SelectItem value="title">游戏名称</SelectItem>
                      <SelectItem value="downloads">下载量</SelectItem>
                      <SelectItem value="category">分类</SelectItem>
                      <SelectItem value="date">创建时间</SelectItem>
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
                      description={game.description || ""}
                      image={game.cover_image || "/placeholder.svg"}
                      category={game.category}
                      downloads={game.download_count || 0}
                      rating={4.5}
                      size="未知大小"
                    />
                  ) : (
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <img 
                            src={game.cover_image || "/placeholder.svg"} 
                            alt={game.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{game.title}</h3>
                            <p className="text-muted-foreground text-sm">{game.description || "暂无描述"}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="secondary">{game.category}</Badge>
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Download className="w-3 h-3 mr-1" />
                                {game.download_count || 0}
                              </span>
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                                4.5
                              </span>
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(game.created_at).toLocaleDateString('zh-CN')}
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