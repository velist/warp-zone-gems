import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Star, Trophy, Gamepad2, Menu, X, User, LogOut, Search, Home, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { NavigationStore, NavigationItem } from "@/lib/navigationStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // 加载导航配置
  useEffect(() => {
    const items = NavigationStore.getNavigationItems();
    setNavigationItems(items);
  }, []);

  // 监听滚动状态
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 点击外部关闭移动端菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // 触摸手势处理
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    (e.currentTarget as any).startY = touch.clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const startY = (e.currentTarget as any).startY;
    const endY = touch.clientY;
    const diffY = startY - endY;

    // 向上滑动超过50px关闭菜单
    if (diffY > 50) {
      setIsMenuOpen(false);
    }
  };

  // 图标渲染函数
  const renderIcon = (iconName?: string) => {
    const iconProps = { className: "w-4 h-4" };
    switch (iconName) {
      case 'Home':
        return <Home {...iconProps} />;
      case 'Gamepad2':
        return <Gamepad2 {...iconProps} />;
      case 'Menu':
        return <Menu {...iconProps} />;
      case 'Info':
        return <Info {...iconProps} />;
      case 'Search':
        return <Search {...iconProps} />;
      case 'Star':
        return <Star {...iconProps} />;
      case 'User':
        return <User {...iconProps} />;
      default:
        return <Menu {...iconProps} />;
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
      isScrolled 
        ? 'bg-card/95 backdrop-blur-lg shadow-lg' 
        : 'bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer transition-transform hover:scale-105" onClick={() => navigate('/')}>
            <div className="relative">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center floating-animation">
                <Gamepad2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-coin-spin"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Warp Zone Gems
              </h1>
              <p className="text-xs text-muted-foreground">精品游戏资源宝库</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems
              .filter(item => item.visible)
              .sort((a, b) => a.order - b.order)
              .map(item => (
                <Button 
                  key={item.id}
                  variant="ghost" 
                  className="relative group"
                  onClick={() => {
                    if (item.type === 'external' && item.target === '_blank') {
                      window.open(item.path, '_blank');
                    } else {
                      navigate(item.path);
                    }
                  }}
                >
                  {item.name}
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></div>
                </Button>
              ))}
          </nav>

          {/* Search & Stats & User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="relative group"
            >
              <Search className="w-5 h-5" />
            </Button>

            <Badge variant="secondary" className="coin-shine hover:scale-105 transition-transform cursor-pointer">
              <Coins className="w-4 h-4 mr-1" />
              1,247
            </Badge>
            <Badge 
              variant="outline" 
              className="coin-shine hover:scale-105 transition-transform cursor-pointer"
              onClick={() => navigate('/favorites')}
            >
              <Star className="w-4 h-4 mr-1" />
              收藏
            </Badge>
            <Badge 
              variant="outline" 
              className="coin-shine hover:scale-105 transition-transform cursor-pointer"
              onClick={() => navigate('/leaderboard')}
            >
              <Trophy className="w-4 h-4 mr-1" />
              排行榜
            </Badge>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    {user.user_metadata?.username || user.email?.split('@')[0] || '用户'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    个人资料
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/favorites')}>
                    我的收藏
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/auth')}
              >
                <User className="w-4 h-4 mr-2" />
                登录/注册
              </Button>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-2 md:hidden">
            {/* Mobile Search Button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative"
            >
              <div className={`transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : 'rotate-0'}`}>
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden py-4 space-y-2 animate-in slide-in-from-top-5 duration-300"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* 滑动提示 */}
            <div className="flex justify-center pb-2">
              <div className="w-8 h-1 bg-muted-foreground/30 rounded-full"></div>
            </div>

            {navigationItems
              .filter(item => item.visible)
              .sort((a, b) => a.order - b.order)
              .map(item => (
                <Button 
                  key={item.id}
                  variant="ghost" 
                  className="w-full justify-start hover:bg-primary/10 transition-colors"
                  onClick={() => {
                    if (item.type === 'external' && item.target === '_blank') {
                      window.open(item.path, '_blank');
                    } else {
                      navigate(item.path);
                    }
                    setIsMenuOpen(false);
                  }}
                >
                  {renderIcon(item.icon)}
                  <span className="ml-2">{item.name}</span>
                </Button>
              ))}
            
            {/* Mobile User Actions */}
            {user ? (
              <>
                <div className="pt-3 border-t border-muted">
                  <div className="bg-muted/50 rounded-lg p-3 mb-2">
                    <p className="text-sm font-medium">
                      欢迎回来！
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.user_metadata?.username || user.email?.split('@')[0]}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start hover:bg-primary/10"
                    onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    个人资料
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start hover:bg-primary/10"
                    onClick={() => { navigate('/favorites'); setIsMenuOpen(false); }}
                  >
                    <Star className="w-4 h-4 mr-2" />
                    我的收藏
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600 hover:bg-red-50"
                    onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </Button>
                </div>
              </>
            ) : (
              <div className="pt-3 border-t border-muted">
                <Button 
                  variant="default" 
                  className="w-full mario-button"
                  onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}
                >
                  <User className="w-4 h-4 mr-2" />
                  登录/注册
                </Button>
              </div>
            )}
            
            {/* Mobile Stats */}
            <div className="flex items-center justify-center space-x-2 pt-3 border-t border-muted">
              <Badge variant="secondary" className="coin-shine hover:scale-105 transition-transform">
                <Coins className="w-4 h-4 mr-1" />
                1,247
              </Badge>
              <Badge 
                variant="outline" 
                className="coin-shine hover:scale-105 transition-transform cursor-pointer"
                onClick={() => { navigate('/favorites'); setIsMenuOpen(false); }}
              >
                <Star className="w-4 h-4 mr-1" />
                收藏
              </Badge>
              <Badge 
                variant="outline" 
                className="coin-shine hover:scale-105 transition-transform cursor-pointer"
                onClick={() => { navigate('/leaderboard'); setIsMenuOpen(false); }}
              >
                <Trophy className="w-4 h-4 mr-1" />
                排行
              </Badge>
            </div>
          </div>
        )}

        {/* Search Overlay */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 bg-card/95 backdrop-blur-lg border-b shadow-lg animate-in slide-in-from-top-5 duration-300">
            <div className="container mx-auto px-4 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="search-input"
                  type="text"
                  placeholder="搜索游戏资源..."
                  className="w-full pl-10 pr-24 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsSearchOpen(false);
                    } else if (e.key === 'Enter') {
                      const query = (e.target as HTMLInputElement).value.trim();
                      console.log('🔍 搜索查询:', query);
                      if (query) {
                        setIsSearchOpen(false);
                        console.log('🚀 跳转到搜索页:', `/search?q=${encodeURIComponent(query)}`);
                        navigate(`/search?q=${encodeURIComponent(query)}`);
                      }
                    }
                  }}
                />
                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <Button
                    size="sm"
                    className="h-8 px-3 mario-button text-xs"
                    onClick={() => {
                      const input = document.getElementById('search-input') as HTMLInputElement;
                      if (input) {
                        const query = input.value.trim();
                        console.log('🔘 按钮搜索查询:', query);
                        if (query) {
                          setIsSearchOpen(false);
                          console.log('🎯 按钮跳转到搜索页:', `/search?q=${encodeURIComponent(query)}`);
                          navigate(`/search?q=${encodeURIComponent(query)}`);
                        }
                      }
                    }}
                  >
                    搜索
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Search Suggestions */}
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground mb-2">热门搜索</p>
                <div className="flex flex-wrap gap-2">
                  {['3A游戏', '赛车游戏', '动作游戏', '冒险游戏', '解谜游戏'].map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => {
                        setIsSearchOpen(false);
                        navigate(`/search?q=${encodeURIComponent(tag)}`);
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};