import { useEffect, useState } from 'react';

interface Game {
  id: string;
  title: string;
  description?: string;
  content?: string;
  cover_image?: string;
  category: string;
  tags?: string[];
  author?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  status?: string;
  view_count?: number;
  download_count?: number;
  download_link?: string;
}

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  color?: string;
  icon?: string;
  games_count?: number;
  created_at?: string;
}

// 检测环境并获取数据源URL
const getDataSource = () => {
  const isProduction = window.location.hostname === 'velist.github.io' || 
                      window.location.protocol === 'https:' ||
                      process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // 生产环境：直接读取静态JSON文件
    return {
      type: 'static',
      gamesUrl: '/warp-zone-gems/data/games.json',
      categoriesUrl: '/warp-zone-gems/data/categories.json'
    };
  } else {
    // 开发环境：使用本地管理后台API
    return {
      type: 'api',
      baseUrl: 'http://localhost:3008/api',
      gamesUrl: 'http://localhost:3008/api/data/games',
      categoriesUrl: 'http://localhost:3008/api/data/categories'
    };
  }
};

export const useSupabaseData = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dataSource = getDataSource();
        
        let gamesData, categoriesData;

        if (dataSource.type === 'static') {
          // 生产环境：直接读取静态JSON文件
          console.log('Production mode: fetching static JSON files');
          
          const [gamesResponse, categoriesResponse] = await Promise.all([
            fetch(dataSource.gamesUrl),
            fetch(dataSource.categoriesUrl)
          ]);

          if (!gamesResponse.ok) {
            throw new Error(`Failed to fetch games: ${gamesResponse.status}`);
          }
          if (!categoriesResponse.ok) {
            throw new Error(`Failed to fetch categories: ${categoriesResponse.status}`);
          }

          gamesData = await gamesResponse.json();
          categoriesData = await categoriesResponse.json();
          
        } else {
          // 开发环境：使用本地管理后台API
          console.log('Development mode: fetching from local API');
          
          const [gamesResponse, categoriesResponse] = await Promise.all([
            fetch(dataSource.gamesUrl),
            fetch(dataSource.categoriesUrl)
          ]);

          const gamesResult = await gamesResponse.json();
          const categoriesResult = await categoriesResponse.json();
          
          if (!gamesResult.success) {
            throw new Error(gamesResult.error || 'Failed to fetch games');
          }
          if (!categoriesResult.success) {
            throw new Error(categoriesResult.error || 'Failed to fetch categories');
          }

          gamesData = gamesResult.data;
          categoriesData = categoriesResult.data;
        }

        // Filter only published games for frontend display
        const publishedGames = (gamesData || [])
          .filter((game: Game) => game.status === 'published')
          .sort((a: Game, b: Game) => {
            // Sort by published_at or created_at, latest first
            const dateA = new Date(a.published_at || a.created_at || 0).getTime();
            const dateB = new Date(b.published_at || b.created_at || 0).getTime();
            return dateB - dateA;
          });

        // Transform categories to match expected format
        const transformedCategories = (categoriesData || []).map((cat: any) => ({
          id: cat.id || cat.name?.toLowerCase().replace(/\s+/g, '-'),
          name: cat.name,
          slug: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-'),
          description: cat.description,
          color: cat.color,
          icon: cat.icon,
          games_count: cat.games_count || 0,
          created_at: cat.created_at
        }));

        setGames(publishedGames);
        setCategories(transformedCategories);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        
        // Fallback: set empty arrays to prevent UI crashes
        setGames([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refetch = async () => {
    setLoading(true);
    // Re-run the fetch logic
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to show loading state
    
    try {
      const dataSource = getDataSource();
      let gamesData, categoriesData;

      if (dataSource.type === 'static') {
        // 生产环境：重新读取静态JSON文件
        const [gamesResponse, categoriesResponse] = await Promise.all([
          fetch(dataSource.gamesUrl + '?t=' + Date.now()), // 添加时间戳避免缓存
          fetch(dataSource.categoriesUrl + '?t=' + Date.now())
        ]);

        if (gamesResponse.ok && categoriesResponse.ok) {
          gamesData = await gamesResponse.json();
          categoriesData = await categoriesResponse.json();
        }
      } else {
        // 开发环境：重新调用API
        const [gamesResponse, categoriesResponse] = await Promise.all([
          fetch(dataSource.gamesUrl),
          fetch(dataSource.categoriesUrl)
        ]);

        const gamesResult = await gamesResponse.json();
        const categoriesResult = await categoriesResponse.json();
        
        if (gamesResult.success) {
          gamesData = gamesResult.data;
        }
        if (categoriesResult.success) {
          categoriesData = categoriesResult.data;
        }
      }

      if (gamesData) {
        const publishedGames = (gamesData || [])
          .filter((game: Game) => game.status === 'published')
          .sort((a: Game, b: Game) => {
            const dateA = new Date(a.published_at || a.created_at || 0).getTime();
            const dateB = new Date(b.published_at || b.created_at || 0).getTime();
            return dateB - dateA;
          });
        setGames(publishedGames);
      }

      if (categoriesData) {
        const transformedCategories = (categoriesData || []).map((cat: any) => ({
          id: cat.id || cat.name?.toLowerCase().replace(/\s+/g, '-'),
          name: cat.name,
          slug: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-'),
          description: cat.description,
          color: cat.color,
          icon: cat.icon,
          games_count: cat.games_count || 0,
          created_at: cat.created_at
        }));
        setCategories(transformedCategories);
      }
    } catch (err) {
      console.error('Error refetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    games,
    categories,
    loading,
    error,
    refetch
  };
};