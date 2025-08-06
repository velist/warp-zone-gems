import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Gamepad2, Puzzle, Sword, Car, Heart, Zap } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

interface CategoryGridProps {
  categories: Category[];
}

const categoryIcons: Record<string, any> = {
  'platform': Gamepad2,
  'puzzle': Puzzle,
  'action': Sword,
  'racing': Car,
  'adventure': Heart,
  'arcade': Zap,
};

const getCategoryIcon = (slug: string) => {
  const IconComponent = categoryIcons[slug] || Gamepad2;
  return IconComponent;
};

export const CategoryGrid = ({ categories }: CategoryGridProps) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            🎮 游戏分类探索
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            精心整理的游戏资源分类，每个分类都包含经典的马里奥风格游戏和资源
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const IconComponent = getCategoryIcon(category.slug);
            const gameCount = Math.floor(Math.random() * 50) + 10; // 模拟游戏数量
            
            return (
              <Card
                key={category.id}
                className="block-card group cursor-pointer overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="relative">
                  <div 
                    className="absolute inset-0 opacity-10 rounded-t-xl"
                    style={{ backgroundColor: category.color || '#FF6B6B' }}
                  />
                  
                  <div className="relative flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center floating-animation"
                      style={{ backgroundColor: category.color || '#FF6B6B' }}
                    >
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                        {category.name}
                      </CardTitle>
                      <Badge 
                        variant="secondary" 
                        className="mt-1 coin-shine"
                      >
                        {gameCount} 个游戏
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative">
                  {category.description && (
                    <p className="text-muted-foreground mb-4">
                      {category.description}
                    </p>
                  )}

                  {/* 装饰性的马里奥元素 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-accent animate-coin-spin"></div>
                      <div className="w-3 h-3 rounded-full bg-primary" style={{ animationDelay: '0.5s' }}></div>
                      <div className="w-3 h-3 rounded-full bg-secondary" style={{ animationDelay: '1s' }}></div>
                    </div>
                    
                    <div className="text-2xl floating-animation">
                      {index % 4 === 0 && '🍄'}
                      {index % 4 === 1 && '⭐'}
                      {index % 4 === 2 && '🏆'}
                      {index % 4 === 3 && '💎'}
                    </div>
                  </div>

                  <Button 
                    className="w-full mario-button group-hover:animate-power-up"
                    style={{ backgroundColor: category.color || undefined }}
                  >
                    探索分类
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 统计信息 */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
            <div className="block-card">
              <div className="text-2xl font-bold text-primary">6</div>
              <div className="text-sm text-muted-foreground">游戏分类</div>
            </div>
            <div className="block-card">
              <div className="text-2xl font-bold text-secondary">180+</div>
              <div className="text-sm text-muted-foreground">游戏资源</div>
            </div>
            <div className="block-card">
              <div className="text-2xl font-bold text-accent">1.2k+</div>
              <div className="text-sm text-muted-foreground">累计下载</div>
            </div>
            <div className="block-card">
              <div className="text-2xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">用户满意度</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};