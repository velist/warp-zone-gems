import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  siteName?: string;
  locale?: string;
  structuredData?: any;
}

const DEFAULT_SEO: Required<SEOProps> = {
  title: 'Warp Zone Gems - 马里奥主题游戏资源网站',
  description: '专为马里奥游戏爱好者打造的游戏资源分享平台，提供丰富的马里奥系列游戏下载、攻略和资源分享。',
  keywords: ['马里奥', '马里奥游戏', '游戏下载', '游戏资源', '任天堂', 'Mario', '平台游戏', '经典游戏'],
  image: 'https://velist.github.io/warp-zone-gems/og-image.jpg',
  url: 'https://velist.github.io/warp-zone-gems',
  type: 'website',
  author: 'Velist',
  publishedTime: new Date().toISOString(),
  modifiedTime: new Date().toISOString(),
  siteName: 'Warp Zone Gems',
  locale: 'zh_CN',
  structuredData: null
};

export const SEOHead: React.FC<SEOProps> = (props) => {
  const location = useLocation();
  const seo = { ...DEFAULT_SEO, ...props };
  
  // 构建完整URL
  const fullUrl = props.url || `${DEFAULT_SEO.url}/#${location.pathname}`;
  
  // 构建完整title
  const fullTitle = props.title 
    ? `${props.title} - ${DEFAULT_SEO.siteName}`
    : DEFAULT_SEO.title;

  useEffect(() => {
    // 更新页面标题
    document.title = fullTitle;
    
    // 更新或创建meta标签
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // 基础SEO标签
    updateMetaTag('description', seo.description);
    updateMetaTag('keywords', seo.keywords.join(', '));
    updateMetaTag('author', seo.author);
    
    // Open Graph 标签
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', seo.description, true);
    updateMetaTag('og:type', seo.type, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:image', seo.image, true);
    updateMetaTag('og:site_name', seo.siteName, true);
    updateMetaTag('og:locale', seo.locale, true);
    
    // Twitter Card 标签
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', seo.description);
    updateMetaTag('twitter:image', seo.image);
    
    // 文章类型特定标签
    if (seo.type === 'article') {
      updateMetaTag('article:author', seo.author, true);
      updateMetaTag('article:published_time', seo.publishedTime, true);
      updateMetaTag('article:modified_time', seo.modifiedTime, true);
    }
    
    // 结构化数据
    if (seo.structuredData) {
      let structuredDataScript = document.getElementById('structured-data');
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script');
        structuredDataScript.id = 'structured-data';
        structuredDataScript.type = 'application/ld+json';
        document.head.appendChild(structuredDataScript);
      }
      structuredDataScript.textContent = JSON.stringify(seo.structuredData);
    }
    
    // 规范链接
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = fullUrl;
    
  }, [fullTitle, seo, fullUrl]);

  return null; // 这是一个无渲染组件
};

// 预设的SEO配置
export const createGameSEO = (game: {
  id: string;
  title: string;
  description?: string;
  cover_image?: string;
  tags?: string[];
  category?: string;
  published_at?: string;
  updated_at?: string;
}): SEOProps => ({
  title: game.title,
  description: game.description || `下载 ${game.title} - 马里奥系列游戏资源`,
  keywords: [
    '马里奥游戏',
    game.title,
    ...(game.tags || []),
    game.category || '平台游戏',
    '游戏下载'
  ],
  image: game.cover_image || DEFAULT_SEO.image,
  url: `${DEFAULT_SEO.url}/#/game/${game.id}`,
  type: 'article',
  publishedTime: game.published_at,
  modifiedTime: game.updated_at,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": game.title,
    "description": game.description,
    "image": game.cover_image,
    "genre": game.category,
    "keywords": game.tags?.join(', '),
    "datePublished": game.published_at,
    "dateModified": game.updated_at,
    "author": {
      "@type": "Organization",
      "name": "Warp Zone Gems"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Warp Zone Gems"
    }
  }
});

export const createCategorySEO = (category: {
  name: string;
  description?: string;
  gameCount?: number;
}): SEOProps => ({
  title: `${category.name}游戏合集`,
  description: category.description || `浏览 ${category.name} 分类的马里奥游戏，包含 ${category.gameCount || 0} 款精品游戏`,
  keywords: [
    category.name,
    '马里奥游戏',
    '游戏分类',
    '游戏合集',
    '游戏下载'
  ],
  type: 'website',
  structuredData: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.name}游戏合集`,
    "description": category.description,
    "numberOfItems": category.gameCount,
    "about": {
      "@type": "VideoGame",
      "genre": category.name
    }
  }
});