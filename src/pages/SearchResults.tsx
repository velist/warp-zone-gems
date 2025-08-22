import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { GameCard } from '@/components/GameCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  ArrowLeft, 
  TrendingUp,
  Clock,
  Star,
  SlidersHorizontal
} from 'lucide-react';
import { useSupabaseData } from '@/hooks/useSupabaseData';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'rating' | 'downloads'>('relevance');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const { games, categories, loading } = useSupabaseData();

  // 搜索过滤逻辑
  const filteredGames = games.filter(game => {
    const matchesSearch = 
      game.title.toLowerCase().includes(query.toLowerCase()) ||
      game.description?.toLowerCase().includes(query.toLowerCase()) ||
      game.category.toLowerCase().includes(query.toLowerCase()) ||
      game.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || game.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // 排序逻辑
  const sortedGames = [...filteredGames].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime();
      case 'rating':
        return 4.8 - 4.5; // 模拟评分排序
      case 'downloads':
        return Math.random() - 0.5; // 模拟下载量排序
      default:
        return 0; // relevance保持原顺序
    }
  });

  const handleNewSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>

        {/* 搜索区域 */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="搜索游戏、攻略、资源..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNewSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleNewSearch} className="mario-button">
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 搜索结果标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            搜索结果: "{query}"
          </h1>
          <p className="text-muted-foreground">
            找到 {sortedGames.length} 个相关游戏
          </p>
        </div>

        {/* 过滤器和排序 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">筛选:</span>
              </div>
              
              {/* 分类筛选 */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={filterCategory === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setFilterCategory('all')}
                >
                  全部分类
                </Badge>
                {categories.map(category => (
                  <Badge
                    key={category.id}
                    variant={filterCategory === category.id ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setFilterCategory(category.id)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>

              {/* 排序选择 */}
              <div className="flex items-center space-x-2 ml-auto">
                <span className="text-sm text-muted-foreground">排序:</span>
                <div className="flex gap-2">
                  <Button
                    variant={sortBy === 'relevance' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('relevance')}
                  >
                    相关度
                  </Button>
                  <Button
                    variant={sortBy === 'date' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('date')}
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    最新
                  </Button>
                  <Button
                    variant={sortBy === 'rating' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('rating')}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    评分
                  </Button>
                  <Button
                    variant={sortBy === 'downloads' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('downloads')}
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    热门
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 搜索结果 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-48 rounded-lg mb-4"></div>
                <div className="bg-muted h-4 rounded w-3/4 mb-2"></div>
                <div className="bg-muted h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : sortedGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedGames.map((game, index) => (
              <div
                key={game.id}
                className="animate-bounce-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <GameCard game={game} />
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">没有找到相关游戏</h3>
              <p className="text-muted-foreground mb-6">
                尝试使用不同的关键词或者浏览我们的游戏分类
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/categories')}
                >
                  浏览所有分类
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  className="mario-button"
                >
                  返回首页
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 搜索建议 */}
        {sortedGames.length === 0 && !loading && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">搜索建议:</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• 检查拼写是否正确</p>
                <p>• 尝试使用更简单的关键词</p>
                <p>• 使用相关的同义词</p>
                <p>• 减少搜索条件的限制</p>
              </div>
              
              <div className="mt-6">
                <p className="font-medium mb-3">热门搜索词:</p>
                <div className="flex flex-wrap gap-2">
                  {['超级马里奥', '马里奥卡丁车', '耀西', '银河', '奥德赛'].map(term => (
                    <Badge
                      key={term}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary/20"
                      onClick={() => {
                        setSearchTerm(term);
                        navigate(`/search?q=${encodeURIComponent(term)}`);
                      }}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchResults;