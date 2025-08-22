export interface NavigationItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  description?: string;
  visible: boolean;
  order: number;
  type: 'page' | 'category' | 'external';
  target?: '_self' | '_blank';
}

const NAVIGATION_STORAGE_KEY = 'warp_zone_navigation_config';

const defaultNavigationItems: NavigationItem[] = [
  {
    id: '1',
    name: '首页',
    path: '/',
    icon: 'Home',
    description: '网站首页',
    visible: true,
    order: 1,
    type: 'page'
  },
  {
    id: '2', 
    name: '游戏资源',
    path: '/',
    icon: 'Gamepad2',
    description: '游戏资源页面',
    visible: true,
    order: 2,
    type: 'page'
  },
  {
    id: '3',
    name: '分类浏览', 
    path: '/categories',
    icon: 'Menu',
    description: '游戏分类页面',
    visible: true,
    order: 3,
    type: 'page'
  },
  {
    id: '4',
    name: '关于我们',
    path: '/about', 
    icon: 'Info',
    description: '关于页面',
    visible: true,
    order: 4,
    type: 'page'
  }
];

export class NavigationStore {
  static getNavigationItems(): NavigationItem[] {
    try {
      const stored = localStorage.getItem(NAVIGATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 验证数据结构
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load navigation config:', error);
    }
    
    // 如果没有存储的配置或加载失败，返回默认配置
    return defaultNavigationItems;
  }

  static saveNavigationItems(items: NavigationItem[]): boolean {
    try {
      localStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error('Failed to save navigation config:', error);
      return false;
    }
  }

  static resetToDefault(): NavigationItem[] {
    try {
      localStorage.removeItem(NAVIGATION_STORAGE_KEY);
      return defaultNavigationItems;
    } catch (error) {
      console.error('Failed to reset navigation config:', error);
      return defaultNavigationItems;
    }
  }

  static exportConfig(): string {
    const items = this.getNavigationItems();
    return JSON.stringify(items, null, 2);
  }

  static importConfig(configJson: string): boolean {
    try {
      const items = JSON.parse(configJson);
      if (Array.isArray(items)) {
        // 基本验证
        const validItems = items.every(item => 
          item.id && item.name && item.path && typeof item.visible === 'boolean'
        );
        
        if (validItems) {
          this.saveNavigationItems(items);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to import navigation config:', error);
      return false;
    }
  }
}