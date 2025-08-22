import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  TrendingUp, 
  Clock, 
  Star, 
  Gamepad2,
  Zap,
  Flame,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface SearchSuggestion {
  id: string;
  title: string;
  category: string;
  type: 'game' | 'category';
}

export const EnhancedSearch: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { games, categories } = useSupabaseData();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // 热门搜索标签
  const hotSearchTags = [
    { text: '超级马里奥', icon: '🍄' },
    { text: '马里奥卡丁车', icon: '🏎️' },
    { text: '耀西岛', icon: '🦕' },
    { text: '银河探险', icon: '🌟' },
    { text: '奥德赛', icon: '🎩' },
    { text: '新超级马里奥', icon: '⭐' },
  ];

  // 最近搜索（从localStorage获取）
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // 保存搜索历史
  const saveSearchHistory = (term: string) => {
    const updated = [term, ...recentSearches.filter(item => item !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // 实时搜索建议
  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        const gameSuggestions = games
          .filter(game => 
            game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            game.description?.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, 3)
          .map(game => ({
            id: game.id,
            title: game.title,
            category: game.category,
            type: 'game' as const
          }));

        const categorySuggestions = categories
          .filter(cat => 
            cat.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .slice(0, 2)
          .map(cat => ({
            id: cat.id,
            title: cat.name,
            category: 'category',
            type: 'category' as const
          }));

        setSuggestions([...gameSuggestions, ...categorySuggestions]);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }
  }, [searchTerm, games, categories]);

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (term: string = searchTerm) => {
    if (term.trim()) {
      saveSearchHistory(term.trim());
      setShowSuggestions(false);
      // 这里可以跳转到搜索结果页面
      navigate(`/search?q=${encodeURIComponent(term.trim())}`);
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag);
    handleSearch(tag);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'game') {
      navigate(`/game/${suggestion.id}`);
    } else {
      navigate(`/category/${suggestion.id}`);
    }
    setShowSuggestions(false);
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <Card className="bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border-2 border-primary/20 shadow-lg">
        <CardContent className="p-6">
          {/* 搜索标题 */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              🔍 发现你的下一个游戏冒险
            </h2>
            <p className="text-muted-foreground">
              搜索马里奥宇宙中的所有精彩内容
            </p>
          </div>

          {/* 主搜索框 */}
          <div className="relative mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="搜索游戏、攻略、资源..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="pl-12 pr-24 py-4 text-lg border-2 border-primary/30 focus:border-primary rounded-xl shadow-sm"
              />
              <Button
                onClick={() => handleSearch()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 mario-button px-6"
                disabled={!searchTerm.trim()}
              >
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
            </div>

            {/* 搜索建议下拉 */}
            {showSuggestions && (searchTerm.length > 1 || suggestions.length > 0) && (
              <Card className="absolute top-full left-0 right-0 mt-2 z-50 border-2 border-primary/20 shadow-xl">
                <CardContent className="p-4">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2 text-muted-foreground">搜索中...</span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground mb-3">搜索建议</p>
                      {suggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/10 cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            {suggestion.type === 'game' ? (
                              <Gamepad2 className="w-4 h-4 text-primary" />
                            ) : (
                              <Star className="w-4 h-4 text-accent" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{suggestion.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {suggestion.type === 'game' ? `游戏 · ${suggestion.category}` : '分类'}
                            </p>
                          </div>
                          <Search className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  ) : searchTerm.length > 1 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      没有找到相关内容
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </div>

          {/* 热门搜索标签 */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-muted-foreground">热门搜索</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {hotSearchTags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20 hover:scale-105 transition-all duration-200 px-3 py-1"
                  onClick={() => handleTagClick(tag.text)}
                >
                  <span className="mr-1">{tag.icon}</span>
                  {tag.text}
                </Badge>
              ))}
            </div>
          </div>

          {/* 最近搜索 */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-muted-foreground">最近搜索</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('recentSearches');
                  }}
                  className="text-xs"
                >
                  <X className="w-3 h-3" />
                  清除
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleTagClick(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 统计信息 */}
          <div className="flex justify-center space-x-8 mt-6 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{games.length}+</div>
              <div className="text-xs text-muted-foreground">可搜索游戏</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{categories.length}</div>
              <div className="text-xs text-muted-foreground">游戏分类</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">24/7</div>
              <div className="text-xs text-muted-foreground">在线服务</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};