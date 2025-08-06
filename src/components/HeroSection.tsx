import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Download, Users, Trophy, ChevronDown } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/10"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-8 h-8 bg-accent rounded-full floating-animation opacity-60"></div>
      <div className="absolute top-32 right-20 w-6 h-6 bg-primary rounded-full floating-animation opacity-70" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-40 left-1/4 w-10 h-10 bg-secondary rounded-xl floating-animation opacity-50" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-accent/30 rounded-full floating-animation" style={{ animationDelay: '0.5s' }}></div>

      {/* Mario-style blocks */}
      <div className="absolute top-16 right-32 w-16 h-16 pipe-entrance floating-animation" style={{ animationDelay: '1.5s' }}></div>
      <div className="absolute bottom-32 right-16 text-4xl floating-animation" style={{ animationDelay: '2.5s' }}>🍄</div>
      <div className="absolute top-48 left-32 text-3xl floating-animation" style={{ animationDelay: '3s' }}>⭐</div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <Badge className="mb-6 coin-shine animate-bounce-in" style={{ animationDelay: '0.2s' }}>
            <Star className="w-4 h-4 mr-1" />
            欢迎来到马里奥游戏世界
          </Badge>

          {/* Main Title */}
          <h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-bounce-in"
            style={{ animationDelay: '0.4s' }}
          >
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Warp Zone Gems
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-bounce-in"
            style={{ animationDelay: '0.6s' }}
          >
            🎮 探索最全面的马里奥风格游戏资源库，重温经典，发现新奇！
            <br />
            <span className="text-lg">从经典平台跳跃到创新玩法，应有尽有</span>
          </p>

          {/* Stats */}
          <div 
            className="flex flex-wrap justify-center gap-6 mb-8 animate-bounce-in"
            style={{ animationDelay: '0.8s' }}
          >
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Download className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-muted-foreground">1,247+ 下载</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-secondary-foreground" />
              </div>
              <span className="text-muted-foreground">500+ 玩家</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="text-muted-foreground">4.9/5 评分</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-bounce-in"
            style={{ animationDelay: '1s' }}
          >
            <Button size="lg" className="mario-button text-lg px-8 py-6">
              <Download className="w-5 h-5 mr-2" />
              开始探索游戏
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover:scale-105 transition-transform duration-300">
              <Star className="w-5 h-5 mr-2" />
              查看热门资源
            </Button>
          </div>

          {/* Description */}
          <p 
            className="text-sm text-muted-foreground mt-6 max-w-2xl mx-auto animate-bounce-in"
            style={{ animationDelay: '1.2s' }}
          >
            所有游戏资源均经过精心筛选和测试，确保为您提供最佳的游戏体验。
            支持多平台，包含完整的游戏文件、说明文档和相关资源。
          </p>
        </div>

        {/* Scroll Indicator */}
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-in"
          style={{ animationDelay: '1.4s' }}
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground animate-bounce" />
        </div>
      </div>

      {/* Mario-style decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-card/20 to-transparent"></div>
    </section>
  );
};