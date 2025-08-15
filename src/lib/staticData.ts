// 静态数据管理 - 无需数据库的数据访问层
import gamesData from '@/data/games.json';
import categoriesData from '@/data/categories.json';

// 游戏数据接口
export interface Game {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  cover_image: string;
  download_link: string;
  published_at: string;
  view_count: number;
  download_count: number;
  content?: string;
}

// 分类数据接口
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  games_count: number;
}

// 本地存储键名
const STORAGE_KEYS = {
  FAVORITES: 'warp_zone_favorites',
  VIEW_HISTORY: 'warp_zone_view_history',
  SEARCH_HISTORY: 'warp_zone_search_history',
  USER_PREFERENCES: 'warp_zone_preferences'
};

// 静态数据服务类
export class StaticDataService {
  // 获取所有游戏
  static getGames(options: {
    limit?: number;
    offset?: number;
    category?: string;
    search?: string;
    sortBy?: 'title' | 'published_at' | 'view_count' | 'download_count';
    sortOrder?: 'asc' | 'desc';
  } = {}): { games: Game[]; total: number } {
    let games = [...gamesData] as Game[];
    
    // 分类筛选
    if (options.category) {
      games = games.filter(game => game.category === options.category);
    }
    
    // 搜索筛选
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      games = games.filter(game => 
        game.title.toLowerCase().includes(searchTerm) ||
        game.description.toLowerCase().includes(searchTerm) ||
        game.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // 排序
    if (options.sortBy) {
      games.sort((a, b) => {
        const aValue = a[options.sortBy!];
        const bValue = b[options.sortBy!];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return options.sortOrder === 'desc' 
            ? bValue.localeCompare(aValue)
            : aValue.localeCompare(bValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return options.sortOrder === 'desc' 
            ? bValue - aValue
            : aValue - bValue;
        }
        
        return 0;
      });
    }
    
    const total = games.length;
    
    // 分页
    if (options.limit) {
      const offset = options.offset || 0;
      games = games.slice(offset, offset + options.limit);
    }
    
    return { games, total };
  }
  
  // 根据ID获取游戏
  static getGameById(id: string): Game | null {
    return gamesData.find(game => game.id === id) as Game || null;
  }
  
  // 获取热门游戏
  static getPopularGames(limit: number = 6): Game[] {
    return [...gamesData]
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, limit) as Game[];
  }
  
  // 获取最新游戏
  static getLatestGames(limit: number = 6): Game[] {
    return [...gamesData]
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, limit) as Game[];
  }
  
  // 获取推荐游戏（基于分类）
  static getRecommendedGames(currentGameId: string, limit: number = 4): Game[] {
    const currentGame = this.getGameById(currentGameId);
    if (!currentGame) return [];
    
    return gamesData
      .filter(game => game.id !== currentGameId && game.category === currentGame.category)
      .slice(0, limit) as Game[];
  }
  
  // 获取所有分类
  static getCategories(): Category[] {
    return categoriesData as Category[];
  }
  
  // 根据slug获取分类
  static getCategoryBySlug(slug: string): Category | null {
    return categoriesData.find(cat => cat.slug === slug) as Category || null;
  }
  
  // 获取分类统计
  static getCategoryStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    
    gamesData.forEach(game => {
      stats[game.category] = (stats[game.category] || 0) + 1;
    });
    
    return stats;
  }
  
  // 搜索建议
  static getSearchSuggestions(query: string, limit: number = 5): string[] {
    if (!query || query.length < 2) return [];
    
    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();
    
    // 从游戏标题中提取建议
    gamesData.forEach(game => {
      if (game.title.toLowerCase().includes(queryLower)) {
        suggestions.add(game.title);
      }
      
      // 从标签中提取建议
      game.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          suggestions.add(tag);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, limit);
  }
}

// 本地存储服务类（替代用户相关功能）
export class LocalStorageService {
  // 收藏功能
  static getFavorites(): string[] {
    const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return favorites ? JSON.parse(favorites) : [];
  }
  
  static addToFavorites(gameId: string): void {
    const favorites = this.getFavorites();
    if (!favorites.includes(gameId)) {
      favorites.push(gameId);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    }
  }
  
  static removeFromFavorites(gameId: string): void {
    const favorites = this.getFavorites();
    const updated = favorites.filter(id => id !== gameId);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
  }
  
  static isFavorite(gameId: string): boolean {
    return this.getFavorites().includes(gameId);
  }
  
  static getFavoriteGames(): Game[] {
    const favoriteIds = this.getFavorites();
    return favoriteIds
      .map(id => StaticDataService.getGameById(id))
      .filter(game => game !== null) as Game[];
  }
  
  // 浏览历史
  static getViewHistory(): string[] {
    const history = localStorage.getItem(STORAGE_KEYS.VIEW_HISTORY);
    return history ? JSON.parse(history) : [];
  }
  
  static addToViewHistory(gameId: string): void {
    let history = this.getViewHistory();
    
    // 移除已存在的记录
    history = history.filter(id => id !== gameId);
    
    // 添加到开头
    history.unshift(gameId);
    
    // 限制历史记录数量
    if (history.length > 50) {
      history = history.slice(0, 50);
    }
    
    localStorage.setItem(STORAGE_KEYS.VIEW_HISTORY, JSON.stringify(history));
  }
  
  static getViewHistoryGames(limit: number = 10): Game[] {
    const historyIds = this.getViewHistory().slice(0, limit);
    return historyIds
      .map(id => StaticDataService.getGameById(id))
      .filter(game => game !== null) as Game[];
  }
  
  // 搜索历史
  static getSearchHistory(): string[] {
    const history = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
    return history ? JSON.parse(history) : [];
  }
  
  static addToSearchHistory(query: string): void {
    if (!query.trim()) return;
    
    let history = this.getSearchHistory();
    
    // 移除已存在的记录
    history = history.filter(q => q !== query);
    
    // 添加到开头
    history.unshift(query);
    
    // 限制历史记录数量
    if (history.length > 20) {
      history = history.slice(0, 20);
    }
    
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history));
  }
  
  // 用户偏好设置
  static getPreferences(): {
    theme?: 'light' | 'dark' | 'auto';
    language?: 'zh' | 'en';
    itemsPerPage?: number;
    defaultSort?: string;
  } {
    const prefs = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return prefs ? JSON.parse(prefs) : {};
  }
  
  static setPreferences(preferences: any): void {
    const current = this.getPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
  }
  
  // 清除所有本地数据
  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// 统计服务（模拟数据库统计）
export class StatsService {
  static getOverallStats() {
    const games = StaticDataService.getGames();
    const categories = StaticDataService.getCategories();
    
    return {
      totalGames: games.total,
      totalCategories: categories.length,
      totalDownloads: games.games.reduce((sum, game) => sum + game.download_count, 0),
      totalViews: games.games.reduce((sum, game) => sum + game.view_count, 0),
      averageRating: 4.5, // 模拟数据
      activeUsers: 1234, // 模拟数据
    };
  }
  
  static getTopGames(type: 'downloads' | 'views' = 'downloads', limit: number = 10) {
    const { games } = StaticDataService.getGames();
    const sortKey = type === 'downloads' ? 'download_count' : 'view_count';
    
    return games
      .sort((a, b) => b[sortKey] - a[sortKey])
      .slice(0, limit);
  }
  
  static getCategoryStats() {
    const categories = StaticDataService.getCategories();
    const categoryStats = StaticDataService.getCategoryStats();
    
    return categories.map(cat => ({
      ...cat,
      games_count: categoryStats[cat.name] || 0
    }));
  }
}

// 导出默认服务
export default StaticDataService;