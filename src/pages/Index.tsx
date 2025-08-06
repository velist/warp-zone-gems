import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { CategoryGrid } from "@/components/CategoryGrid";
import { GameCard } from "@/components/GameCard";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronRight, Gamepad2, TrendingUp, Clock } from "lucide-react";

const Index = () => {
  const { games, categories, loading, error } = useSupabaseData();

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert className="max-w-md mx-auto">
            <AlertDescription>
              数据加载失败: {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Categories Section */}
      {loading ? (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="block-card">
                  <Skeleton className="h-48 w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <CategoryGrid categories={categories} />
      )}

      {/* Featured Games Section */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                🏆 精选游戏推荐
              </h2>
              <p className="text-muted-foreground">
                最热门和最新的马里奥风格游戏资源
              </p>
            </div>
            <Button variant="outline" className="hidden md:flex items-center">
              查看全部
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button variant="default" size="sm" className="mario-button">
              <TrendingUp className="w-4 h-4 mr-1" />
              热门推荐
            </Button>
            <Button variant="outline" size="sm">
              <Clock className="w-4 h-4 mr-1" />
              最新上传
            </Button>
            <Button variant="outline" size="sm">
              <Gamepad2 className="w-4 h-4 mr-1" />
              经典收藏
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="block-card">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.slice(0, 8).map((game, index) => (
                <div
                  key={game.id}
                  className="animate-bounce-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <GameCard game={game} />
                </div>
              ))}
            </div>
          )}

          {/* Show All Button for Mobile */}
          <div className="text-center mt-8 md:hidden">
            <Button className="mario-button">
              查看更多游戏
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            🌟 社区成就统计
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="block-card">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2 floating-animation">
                {games.length}+
              </div>
              <div className="text-sm text-muted-foreground">游戏资源</div>
              <div className="text-xs text-muted-foreground mt-1">持续更新中</div>
            </div>
            <div className="block-card">
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-2 floating-animation" style={{ animationDelay: '0.5s' }}>
                {categories.length}
              </div>
              <div className="text-sm text-muted-foreground">游戏分类</div>
              <div className="text-xs text-muted-foreground mt-1">精心分类</div>
            </div>
            <div className="block-card">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2 floating-animation" style={{ animationDelay: '1s' }}>
                1.2K+
              </div>
              <div className="text-sm text-muted-foreground">累计下载</div>
              <div className="text-xs text-muted-foreground mt-1">深受喜爱</div>
            </div>
            <div className="block-card">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2 floating-animation" style={{ animationDelay: '1.5s' }}>
                98%
              </div>
              <div className="text-sm text-muted-foreground">满意度</div>
              <div className="text-xs text-muted-foreground mt-1">用户好评</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 floating-animation">
              <Gamepad2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Warp Zone Gems
            </h3>
          </div>
          
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            致力于为马里奥游戏爱好者提供最优质的游戏资源和体验。
            让我们一起重温经典，探索无限可能！
          </p>
          
          <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
            <span>© 2024 Warp Zone Gems</span>
            <span>Made with ❤️ for gamers</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
