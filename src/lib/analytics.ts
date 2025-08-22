// Google Analytics 和其他分析工具配置

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Google Analytics 配置
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // 替换为实际的 GA 测量 ID

// 初始化 Google Analytics
export const initializeGoogleAnalytics = () => {
  // 只在生产环境启用
  if (process.env.NODE_ENV !== 'production') {
    console.log('Google Analytics disabled in development');
    return;
  }

  // 检查是否已经加载
  if (window.gtag) {
    console.log('Google Analytics already loaded');
    return;
  }

  // 创建 dataLayer
  window.dataLayer = window.dataLayer || [];
  
  // 定义 gtag 函数
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };

  // 初始化
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    // 用户隐私设置
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  // 动态加载 GA 脚本
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  console.log('Google Analytics initialized');
};

// 页面浏览事件
export const trackPageView = (url: string, title?: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title || document.title,
    });
  }
};

// 自定义事件跟踪
export const trackEvent = (
  action: string,
  category: string = 'engagement',
  label?: string,
  value?: number,
  customParameters?: Record<string, any>
) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...customParameters
    });
  }
};

// 游戏相关事件跟踪
export const trackGameEvent = (action: 'view' | 'download' | 'favorite' | 'share', gameId: string, gameTitle: string) => {
  trackEvent(action, 'game', `${gameTitle} (${gameId})`, undefined, {
    game_id: gameId,
    game_title: gameTitle
  });
};

// 搜索事件跟踪
export const trackSearch = (searchTerm: string, resultCount: number) => {
  trackEvent('search', 'site_search', searchTerm, resultCount, {
    search_term: searchTerm,
    result_count: resultCount
  });
};

// 下载事件跟踪
export const trackDownload = (fileName: string, fileUrl: string, gameId?: string) => {
  trackEvent('download', 'file_download', fileName, undefined, {
    file_name: fileName,
    file_url: fileUrl,
    game_id: gameId
  });
};

// 错误事件跟踪
export const trackError = (errorMessage: string, errorType: string = 'javascript', fatal: boolean = false) => {
  trackEvent('exception', 'error', errorMessage, undefined, {
    description: errorMessage,
    fatal: fatal,
    error_type: errorType
  });
};

// 性能事件跟踪
export const trackPerformance = (metricName: string, value: number, rating: string) => {
  trackEvent(metricName, 'web_vitals', rating, Math.round(value), {
    metric_value: value,
    metric_rating: rating
  });
};

// 转化事件跟踪
export const trackConversion = (action: string, value?: number, currency: string = 'USD') => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'conversion', {
      send_to: GA_MEASUREMENT_ID,
      event_category: 'conversion',
      event_label: action,
      value: value,
      currency: currency
    });
  }
};

// 用户engagement跟踪
export const trackEngagement = (action: string, duration?: number) => {
  trackEvent(action, 'user_engagement', undefined, duration, {
    engagement_time_msec: duration
  });
};

// 社交分享跟踪
export const trackSocialShare = (platform: string, url: string, title: string) => {
  trackEvent('share', 'social', platform, undefined, {
    method: platform,
    content_type: 'game',
    item_id: url,
    content_title: title
  });
};

// 创建自动跟踪路由变化的Hook
export const useAnalyticsPageTracking = () => {
  const trackPageChange = (location: Location) => {
    const path = location.pathname + location.search + location.hash;
    trackPageView(path);
  };

  return { trackPageChange };
};

// 百度统计配置（中文网站推荐）
const BAIDU_ANALYTICS_ID = 'your_baidu_analytics_id'; // 替换为实际的百度统计ID

export const initializeBaiduAnalytics = () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Baidu Analytics disabled in development');
    return;
  }

  // 百度统计代码
  const script = document.createElement('script');
  script.innerHTML = `
    var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?${BAIDU_ANALYTICS_ID}";
      var s = document.getElementsByTagName("script")[0]; 
      s.parentNode.insertBefore(hm, s);
    })();
  `;
  document.head.appendChild(script);

  // 设置全局变量
  (window as any)._hmt = (window as any)._hmt || [];

  console.log('Baidu Analytics initialized');
};

// 百度统计事件跟踪
export const trackBaiduEvent = (category: string, action: string, label?: string, value?: number) => {
  if (typeof (window as any)._hmt !== 'undefined') {
    (window as any)._hmt.push(['_trackEvent', category, action, label, value]);
  }
};

// 百度统计页面跟踪
export const trackBaiduPageView = (url: string) => {
  if (typeof (window as any)._hmt !== 'undefined') {
    (window as any)._hmt.push(['_trackPageview', url]);
  }
};

// 初始化所有分析工具
export const initializeAnalytics = () => {
  // Google Analytics
  initializeGoogleAnalytics();
  
  // 百度统计（针对中文用户）
  initializeBaiduAnalytics();
  
  // 设置全局错误处理
  window.addEventListener('error', (event) => {
    trackError(event.message, 'javascript', true);
  });

  window.addEventListener('unhandledrejection', (event) => {
    trackError(event.reason?.toString() || 'Unhandled Promise Rejection', 'promise', true);
  });
};

// 隐私友好的分析配置
export const configurePrivacyFriendlyAnalytics = () => {
  // 检查用户是否同意cookies
  const hasConsent = localStorage.getItem('analytics_consent') === 'true';
  
  if (!hasConsent) {
    // 显示cookie同意横幅或使用无cookie的分析
    console.log('Analytics consent not granted');
    return false;
  }

  initializeAnalytics();
  return true;
};

// 设置分析同意
export const setAnalyticsConsent = (consent: boolean) => {
  localStorage.setItem('analytics_consent', consent.toString());
  
  if (consent) {
    initializeAnalytics();
  } else {
    // 清除现有的分析cookies和数据
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }
};