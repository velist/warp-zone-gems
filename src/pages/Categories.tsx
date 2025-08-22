import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { SEOHead, createCategorySEO } from "@/components/SEOHead";
import { GameCard } from "@/components/GameCard";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  ArrowLeft,
  Gamepad2,
  Zap,
  Car,
  Puzzle,
  Sword,
  Music,
  Trophy,
  Users,
  Filter,
  Grid3X3,
  List,
  Loader2
} from "lucide-react";

// 分类图标映射
const categoryIconMap: Record<string, any> = {
  "平台跳跃": Gamepad2,
  "动作冒险": Zap,
  "竞速游戏": Car,
  "赛车竞速": Car,
  "解谜益智": Puzzle,
  "角色扮演": Sword,
  "音乐游戏": Music,
  "体感运动": Trophy,
  "派对游戏": Users,
  "体育游戏": Trophy,
  "default": Gamepad2
};

// 分类颜色映射
const categoryColorMap: Record<string, string> = {
  "平台跳跃": "bg-blue-500",
  "动作冒险": "bg-red-500",
  "竞速游戏": "bg-green-500",
  "赛车竞速": "bg-green-500",
  "解谜益智": "bg-purple-500",
  "角色扮演": "bg-orange-500",
  "音乐游戏": "bg-pink-500",
  "体感运动": "bg-yellow-500",
  "派对游戏": "bg-indigo-500",
  "体育游戏": "bg-yellow-500",
  "default": "bg-gray-500"
};

const Categories = () => {
  const navigate = useNavigate();
  const { games, categories, loading, error } = useSupabaseData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"categories" | "games">("categories");

  // 处理分类数据，添加图标和颜色，统计游戏数量
  const processedCategories = categories.map(category => {
    const gamesInCategory = games.filter(game => game.category === category.name);
    const IconComponent = categoryIconMap[category.name] || categoryIconMap.default;
    const color = categoryColorMap[category.name] || categoryColorMap.default;
    
    return {
      ...category,
      icon: IconComponent,
      color,
      count: gamesInCategory.length,
      games: gamesInCategory
    };
  });

  // 过滤分类
  const filteredCategories = processedCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 获取选中分类的游戏
  const selectedCategoryData = processedCategories.find(cat => cat.slug === selectedCategory || cat.name === selectedCategory);
  const categoryGames = selectedCategoryData?.games || [];

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setViewMode("games");
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setViewMode("categories");
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
              <p className="text-muted-foreground">加载分类数据中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 如果数据加载出错，显示错误状态
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
        title={viewMode === "categories" ? "游戏分类" : selectedCategoryData?.name}
        description={
          viewMode === "categories" 
            ? "浏览所有马里奥游戏分类，包括平台跳跃、竞速、动作、益智等多种类型游戏资源" 
            : `${selectedCategoryData?.description} - 共${selectedCategoryData?.count}款游戏`
        }
        keywords={
          viewMode === "categories"
            ? ['游戏分类', '马里奥游戏', '平台游戏', '竞速游戏', '动作游戏', '益智游戏']
            : [selectedCategoryData?.name || '', '马里奥游戏', '游戏下载', '游戏资源']
        }
        structuredData={
          selectedCategoryData ? createCategorySEO({
            name: selectedCategoryData.name,
            description: selectedCategoryData.description,
            gameCount: selectedCategoryData.count
          }).structuredData : undefined
        }
      />
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
          {/* 页面标题 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                {viewMode === "categories" ? (
                  <>
                    <Grid3X3 className="w-8 h-8 mr-3 text-primary" />
                    游戏分类
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleBackToCategories}
                      className="mr-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    {selectedCategoryData?.name}
                  </>
                )}
              </h1>
              <p className="text-muted-foreground mt-2">
                {viewMode === "categories" 
                  ? "浏览不同类型的马里奥游戏资源"
                  : `${selectedCategoryData?.description} - ${selectedCategoryData?.count} 个游戏`
                }
              </p>
            </div>
          </div>

          {/* 搜索框 */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={viewMode === "categories" ? "搜索游戏分类..." : "搜索游戏..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* 分类视图 */}
          {viewMode === "categories" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card 
                    key={category.id}
                    className="hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105"
                    onClick={() => handleCategoryClick(category.slug || category.name)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{category.description || `精选的${category.name}游戏`}</p>
                      <Badge variant="secondary" className="text-sm">
                        {category.count} 个游戏
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* 游戏列表视图 */}
          {viewMode === "games" && (
            <div>
              {categoryGames.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <div className={`w-16 h-16 ${selectedCategoryData?.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      {selectedCategoryData?.icon && (
                        <selectedCategoryData.icon className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">即将推出</h3>
                    <p className="text-muted-foreground mb-6">
                      该分类下的游戏正在整理中，敬请期待！
                    </p>
                    <div className="space-x-2">
                      <Button onClick={handleBackToCategories}>
                        浏览其他分类
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/')}>
                        返回首页
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryGames.map((game) => (
                    <GameCard
                      key={game.id}
                      id={game.id}
                      title={game.title}
                      description={game.description || ""}
                      image={game.cover_image || "/placeholder.svg"}
                      category={game.category}
                      downloads={game.download_count || 0}
                      rating={4.5} // 默认评分，可以后续添加评分系统
                      size="未知大小" // 可以后续添加文件大小字段
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 分类统计 */}
          {viewMode === "categories" && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>分类统计</CardTitle>
                <CardDescription>
                  各类游戏的数量分布
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {games.length}
                    </div>
                    <div className="text-sm text-muted-foreground">总游戏数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {processedCategories.length}
                    </div>
                    <div className="text-sm text-muted-foreground">游戏分类</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {processedCategories.length > 0 ? Math.max(...processedCategories.map(cat => cat.count)) : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">最多游戏</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {processedCategories.length > 0 ? Math.round(games.length / processedCategories.length) : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">平均数量</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;