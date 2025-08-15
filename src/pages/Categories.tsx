import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { GameCard } from "@/components/GameCard";
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
  List
} from "lucide-react";

// 游戏分类数据
const gameCategories = [
  {
    id: "platform",
    name: "平台跳跃",
    description: "经典的马里奥式平台跳跃游戏",
    icon: Gamepad2,
    color: "bg-blue-500",
    count: 45,
    games: [
      {
        id: 1,
        title: "Super Mario Bros.",
        description: "经典的马里奥兄弟游戏",
        image: "/placeholder.svg",
        category: "平台跳跃",
        downloads: 1234,
        rating: 4.8,
        size: "2.5MB"
      },
      {
        id: 2,
        title: "Super Mario World",
        description: "马里奥的世界冒险",
        image: "/placeholder.svg",
        category: "平台跳跃",
        downloads: 2156,
        rating: 4.9,
        size: "3.8MB"
      }
    ]
  },
  {
    id: "action",
    name: "动作游戏",
    description: "快节奏的动作冒险游戏",
    icon: Zap,
    color: "bg-red-500",
    count: 32,
    games: [
      {
        id: 3,
        title: "Mario vs Donkey Kong",
        description: "马里奥对战金刚",
        image: "/placeholder.svg",
        category: "动作游戏",
        downloads: 876,
        rating: 4.6,
        size: "4.2MB"
      }
    ]
  },
  {
    id: "racing",
    name: "竞速游戏",
    description: "刺激的卡丁车和竞速游戏",
    icon: Car,
    color: "bg-green-500",
    count: 28,
    games: [
      {
        id: 4,
        title: "Mario Kart",
        description: "刺激的卡丁车竞速游戏",
        image: "/placeholder.svg",
        category: "竞速游戏",
        downloads: 987,
        rating: 4.7,
        size: "5.2MB"
      }
    ]
  },
  {
    id: "puzzle",
    name: "益智游戏",
    description: "考验智力的解谜游戏",
    icon: Puzzle,
    color: "bg-purple-500",
    count: 21,
    games: []
  },
  {
    id: "rpg",
    name: "角色扮演",
    description: "深度的角色扮演游戏",
    icon: Sword,
    color: "bg-orange-500",
    count: 15,
    games: []
  },
  {
    id: "music",
    name: "音乐游戏",
    description: "节奏感十足的音乐游戏",
    icon: Music,
    color: "bg-pink-500",
    count: 12,
    games: []
  },
  {
    id: "sports",
    name: "体育游戏",
    description: "各种体育运动游戏",
    icon: Trophy,
    color: "bg-yellow-500",
    count: 18,
    games: []
  },
  {
    id: "party",
    name: "聚会游戏",
    description: "多人聚会娱乐游戏",
    icon: Users,
    color: "bg-indigo-500",
    count: 9,
    games: []
  }
];

const Categories = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"categories" | "games">("categories");

  // 过滤分类
  const filteredCategories = gameCategories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 获取选中分类的游戏
  const selectedCategoryData = gameCategories.find(cat => cat.id === selectedCategory);
  const categoryGames = selectedCategoryData?.games || [];

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setViewMode("games");
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setViewMode("categories");
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
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
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
                      description={game.description}
                      image={game.image}
                      category={game.category}
                      downloads={game.downloads}
                      rating={game.rating}
                      size={game.size}
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
                      {gameCategories.reduce((sum, cat) => sum + cat.count, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">总游戏数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {gameCategories.length}
                    </div>
                    <div className="text-sm text-muted-foreground">游戏分类</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {Math.max(...gameCategories.map(cat => cat.count))}
                    </div>
                    <div className="text-sm text-muted-foreground">最多游戏</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {Math.round(gameCategories.reduce((sum, cat) => sum + cat.count, 0) / gameCategories.length)}
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