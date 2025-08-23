/**
 * 前端数据配置统一管理
 * 解决前后端数据同步和路径配置问题
 */

// 环境检测函数
export const getEnvironmentConfig = () => {
  // 使用更精确的生产环境检测
  const isProduction = import.meta.env.PROD || 
                       window.location.hostname === 'velist.github.io' || 
                       window.location.protocol === 'https:';
  
  const baseUrl = isProduction ? '/warp-zone-gems' : '';
  
  return {
    isProduction,
    baseUrl,
    hostname: window.location.hostname,
    protocol: window.location.protocol
  };
};

// 数据API配置
export const getDataConfig = () => {
  const { isProduction, baseUrl } = getEnvironmentConfig();
  
  if (isProduction) {
    // 生产环境：使用静态JSON文件
    return {
      type: 'static' as const,
      baseUrl,
      urls: {
        games: `${baseUrl}/data/games.json`,
        categories: `${baseUrl}/data/categories.json`,
        banners: `${baseUrl}/data/banners.json`,
        popups: `${baseUrl}/data/popups.json`,
        floatingWindows: `${baseUrl}/data/floating-windows.json`,
      }
    };
  } else {
    // 开发环境：使用本地API
    const apiBaseUrl = 'http://localhost:3008/api';
    return {
      type: 'api' as const,
      baseUrl: apiBaseUrl,
      urls: {
        games: `${apiBaseUrl}/data/games`,
        categories: `${apiBaseUrl}/data/categories`,
        banners: `${apiBaseUrl}/data/banners`,
        popups: `${apiBaseUrl}/data/popups`,
        floatingWindows: `${apiBaseUrl}/data/floating-windows`,
      }
    };
  }
};

// 通用数据获取函数
export const fetchData = async <T = any>(endpoint: keyof ReturnType<typeof getDataConfig>['urls']): Promise<T> => {
  const config = getDataConfig();
  const url = config.urls[endpoint];
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
    }
    
    if (config.type === 'api') {
      // API响应格式: { success: boolean, data: T }
      const result = await response.json();
      return result.success ? result.data : [];
    } else {
      // 静态文件直接返回JSON
      return await response.json();
    }
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    // 返回空数组作为后备方案
    return [] as T;
  }
};

// 资源路径辅助函数
export const getAssetUrl = (path: string): string => {
  const { baseUrl } = getEnvironmentConfig();
  // 处理绝对路径和相对路径
  if (path.startsWith('http') || path.startsWith('//')) {
    return path; // 外部链接直接返回
  }
  
  if (path.startsWith('/')) {
    return `${baseUrl}${path}`; // 绝对路径添加前缀
  }
  
  return `${baseUrl}/${path}`; // 相对路径添加前缀和斜杠
};

// 配置验证和调试
export const getDebugInfo = () => {
  const envConfig = getEnvironmentConfig();
  const dataConfig = getDataConfig();
  
  return {
    environment: envConfig,
    dataConfig,
    timestamp: new Date().toISOString()
  };
};

export default {
  getEnvironmentConfig,
  getDataConfig, 
  fetchData,
  getAssetUrl,
  getDebugInfo
};