// 页面预加载和资源优化工具

interface PreloadConfig {
  images?: string[];
  pages?: string[];
  data?: string[];
  scripts?: string[];
  styles?: string[];
}

// 图片预加载
export const preloadImages = (imageUrls: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(
    imageUrls.map((url) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    })
  );
};

// 数据预加载
export const preloadData = async (dataUrls: string[]): Promise<any[]> => {
  try {
    const promises = dataUrls.map(url => fetch(url).then(res => res.json()));
    return await Promise.all(promises);
  } catch (error) {
    console.error('Data preload failed:', error);
    return [];
  }
};

// 关键CSS预加载
export const preloadCriticalCSS = (cssUrls: string[]): void => {
  cssUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = url;
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  });
};

// 预连接到外部域名
export const setupPreconnections = (domains: string[]): void => {
  domains.forEach(domain => {
    // DNS预解析
    const dnsLink = document.createElement('link');
    dnsLink.rel = 'dns-prefetch';
    dnsLink.href = domain;
    document.head.appendChild(dnsLink);

    // 预连接
    const preconnectLink = document.createElement('link');
    preconnectLink.rel = 'preconnect';
    preconnectLink.href = domain;
    document.head.appendChild(preconnectLink);
  });
};

// 智能资源预加载器
export class SmartPreloader {
  private cache = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();

  // 预加载游戏数据
  async preloadGames(limit = 10): Promise<any[]> {
    const cacheKey = `games_${limit}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    const promise = this.fetchGames(limit);
    this.loadingPromises.set(cacheKey, promise);

    try {
      const games = await promise;
      this.cache.set(cacheKey, games);
      return games;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  private async fetchGames(limit: number): Promise<any[]> {
    // 检测环境
    const isProduction = window.location.hostname === 'velist.github.io' ||
                        window.location.hostname === 'aigame.lol' ||
                        window.location.protocol === 'https:' ||
                        process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      const response = await fetch('/data/games.json');
      const games = await response.json();
      return games.slice(0, limit);
    } else {
      const response = await fetch('http://localhost:3008/api/data/games');
      const result = await response.json();
      return result.data?.slice(0, limit) || [];
    }
  }

  // 预加载游戏封面图片
  async preloadGameImages(games: any[]): Promise<void> {
    const imageUrls = games
      .map(game => game.cover_image)
      .filter(Boolean)
      .slice(0, 6); // 只预加载前6张图片

    try {
      await preloadImages(imageUrls);
      console.log(`预加载了 ${imageUrls.length} 张游戏封面图片`);
    } catch (error) {
      console.warn('图片预加载失败:', error);
    }
  }

  // 预加载下一页数据
  async preloadNextPage(currentPage: number, itemsPerPage: number): Promise<any[]> {
    const nextPage = currentPage + 1;
    const cacheKey = `page_${nextPage}_${itemsPerPage}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // 延迟预加载，避免阻塞当前页面
    setTimeout(async () => {
      try {
        const games = await this.fetchGames(itemsPerPage * nextPage);
        const pageData = games.slice(itemsPerPage * currentPage, itemsPerPage * nextPage);
        this.cache.set(cacheKey, pageData);
        
        // 预加载这一页的图片
        this.preloadGameImages(pageData);
      } catch (error) {
        console.warn(`预加载第 ${nextPage} 页数据失败:`, error);
      }
    }, 1000); // 1秒后开始预加载

    return [];
  }

  // 获取缓存的数据
  getCached(key: string): any {
    return this.cache.get(key);
  }

  // 清理缓存
  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }
}

// 路由预加载
export const preloadRoute = async (routePath: string): Promise<void> => {
  try {
    // 预加载路由组件（需要配合代码分割）
    switch (routePath) {
      case '/categories':
        // 预加载分类数据
        await preloadData(['/data/categories.json']);
        break;
      case '/game':
        // 预加载游戏数据
        await preloadData(['/data/games.json']);
        break;
      default:
        break;
    }
  } catch (error) {
    console.warn(`路由预加载失败 ${routePath}:`, error);
  }
};

// 懒加载观察器设置
export const createLazyObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px 0px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, defaultOptions);
};

// 初始化预加载配置
export const initializePreloader = (): void => {
  // 预连接到常用的外部服务
  setupPreconnections([
    'https://api.siliconflow.cn',
    'https://api.imgbb.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ]);

  // 预加载关键资源
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // 在空闲时预加载
      const preloader = new SmartPreloader();
      preloader.preloadGames(8).then(games => {
        preloader.preloadGameImages(games);
      });
    });
  }
};

// 导出单例实例
export const smartPreloader = new SmartPreloader();