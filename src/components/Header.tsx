import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Star, Trophy, Gamepad2, Menu, X } from "lucide-react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center floating-animation">
                <Gamepad2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-coin-spin"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Warp Zone Gems
              </h1>
              <p className="text-xs text-muted-foreground">马里奥游戏资源宝库</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="relative group">
              首页
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
            </Button>
            <Button variant="ghost" className="relative group">
              游戏资源
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
            </Button>
            <Button variant="ghost" className="relative group">
              分类浏览
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
            </Button>
            <Button variant="ghost" className="relative group">
              关于我们
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
            </Button>
          </nav>

          {/* Stats & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Badge variant="secondary" className="coin-shine">
              <Coins className="w-4 h-4 mr-1" />
              1,247
            </Badge>
            <Badge variant="outline" className="coin-shine">
              <Star className="w-4 h-4 mr-1" />
              收藏
            </Badge>
            <Badge variant="outline" className="coin-shine">
              <Trophy className="w-4 h-4 mr-1" />
              排行榜
            </Badge>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-bounce-in">
            <Button variant="ghost" className="w-full justify-start">
              首页
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              游戏资源
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              分类浏览
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              关于我们
            </Button>
            <div className="flex items-center space-x-2 pt-2">
              <Badge variant="secondary" className="coin-shine">
                <Coins className="w-4 h-4 mr-1" />
                1,247
              </Badge>
              <Badge variant="outline" className="coin-shine">
                <Star className="w-4 h-4 mr-1" />
                收藏
              </Badge>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};