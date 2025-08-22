import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { GameCard } from "@/components/GameCard";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { SEOHead } from "@/components/SEOHead";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Play,
  Download,
  Star,
  Loader2
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { games, categories, loading, error } = useSupabaseData();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [bannerIndex, setBannerIndex] = useState(0);
  const gamesPerPage = 12;

  // 轮播Banner数据 - 精选热门游戏
  const bannerGames = games.slice(0, 5);

  // 自动轮播
  useEffect(() => {
    if (bannerGames.length > 0) {
      const timer = setInterval(() => {
        setBannerIndex((prev) => (prev + 1) % bannerGames.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [bannerGames.length]);

  // 过滤游戏
  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (game.description && game.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "全部" || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 分页逻辑
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const startIndex = (currentPage - 1) * gamesPerPage;
  const currentGames = filteredGames.slice(startIndex, startIndex + gamesPerPage);

  // 处理搜索
  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // 处理搜索框回车
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 热门游戏 (按下载量排序)
  const hotGames = games
    .sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
    .slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">加载游戏数据中...</p>
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
      <SEOHead
        title="Warp Zone Gems - 精品游戏资源分享平台"
        description="专业的游戏资源分享平台，提供丰富的3A游戏、赛车游戏、动作游戏、冒险游戏和解谜游戏下载"
        keywords={['游戏下载', '3A游戏', '赛车游戏', '动作游戏', '冒险游戏', '解谜游戏', '游戏资源']}
      />
      
      {/* 导航栏 */}
      <Header />
      
      <div className="container mx-auto px-4">
        {/* 轮播Banner */}
        {bannerGames.length > 0 && (
          <div className="relative mb-8 mt-6">
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
              >
                {bannerGames.map((game, index) => (
                  <div
                    key={game.id}
                    className="min-w-full h-full relative cursor-pointer"
                    onClick={() => navigate(`/game/${game.id}`)}
                  >
                    <div 
                      className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center"
                      style={{
                        backgroundImage: game.cover_image ? `url(${game.cover_image})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                      <div className="relative z-10 text-center text-white p-8">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">{game.title}</h2>
                        <p className="text-lg mb-6 max-w-2xl mx-auto">
                          {game.description || "精彩游戏内容等你发现"}
                        </p>
                        <div className="flex items-center justify-center space-x-4 mb-6">
                          <Badge className="bg-white/20 text-white">{game.category}</Badge>
                          <div className="flex items-center text-sm">
                            <Download className="w-4 h-4 mr-1" />
                            {game.download_count || 0} 下载
                          </div>
                        </div>
                        <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                          <Play className="w-5 h-5 mr-2" />
                          立即体验
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Banner导航按钮 */}
            <button
              onClick={() => setBannerIndex((prev) => (prev - 1 + bannerGames.length) % bannerGames.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setBannerIndex((prev) => (prev + 1) % bannerGames.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            {/* Banner指示器 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {bannerGames.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setBannerIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === bannerIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* 搜索框 */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="搜索游戏..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="pl-10 h-12"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  size="lg"
                  className="h-12 px-8"
                  disabled={!searchTerm.trim()}
                >
                  <Search className="w-5 h-5 mr-2" />
                  搜索
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 热门游戏展示 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">🔥 热门游戏</h2>
            <Button 
              variant="outline"
              onClick={() => navigate('/categories')}
            >
              查看全部分类
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotGames.map((game) => (
              <GameCard
                key={game.id}
                id={game.id}
                title={game.title}
                description={game.description || ""}
                image={game.cover_image || "/placeholder.svg"}
                category={game.category}
                downloads={game.download_count || 0}
                rating={4.5}
                size="未知大小"
              />
            ))}
          </div>
        </div>

        {/* 分类筛选 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {["全部", ...categories.map(cat => cat.name)].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className="mb-2"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* 游戏列表 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCategory === "全部" ? "所有游戏" : selectedCategory}
              <span className="text-sm text-muted-foreground ml-2">
                ({filteredGames.length} 个游戏)
              </span>
            </h2>
          </div>
          
          {currentGames.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentGames.map((game) => (
                <GameCard
                  key={game.id}
                  id={game.id}
                  title={game.title}
                  description={game.description || ""}
                  image={game.cover_image || "/placeholder.svg"}
                  category={game.category}
                  downloads={game.download_count || 0}
                  rating={4.5}
                  size="未知大小"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无符合条件的游戏</p>
            </div>
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mb-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              上一页
            </Button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className="min-w-10"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              下一页
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;