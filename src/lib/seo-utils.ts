// SEO工具函数

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface Game {
  id: string;
  title: string;
  published_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  updated_at?: string;
}

// 生成sitemap.xml内容
export const generateSitemap = (
  games: Game[] = [],
  categories: Category[] = [],
  baseUrl: string = 'https://velist.github.io/warp-zone-gems'
): string => {
  const entries: SitemapEntry[] = [];

  // 首页
  entries.push({
    url: baseUrl + '/#/',
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: 1.0
  });

  // 分类页面
  entries.push({
    url: baseUrl + '/#/categories',
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: 0.9
  });

  // 各个分类页面
  categories.forEach(category => {
    entries.push({
      url: baseUrl + `/#/category/${category.id}`,
      lastmod: category.updated_at || new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8
    });
  });

  // 游戏详情页面
  games.forEach(game => {
    entries.push({
      url: baseUrl + `/#/game/${game.id}`,
      lastmod: game.updated_at || game.published_at || new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.7
    });
  });

  // 其他静态页面
  const staticPages = [
    { path: '/#/about', priority: 0.5 },
    { path: '/#/leaderboard', priority: 0.6 },
    { path: '/#/profile', priority: 0.3 },
    { path: '/#/favorites', priority: 0.3 }
  ];

  staticPages.forEach(page => {
    entries.push({
      url: baseUrl + page.path,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: page.priority
    });
  });

  // 生成XML
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(entry => `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xmlContent;
};

// 生成robots.txt内容
export const generateRobotsTxt = (
  baseUrl: string = 'https://velist.github.io/warp-zone-gems'
): string => {
  return `# Warp Zone Gems - 马里奥主题游戏资源网站
# 允许所有搜索引擎爬虫访问

User-agent: *
Allow: /

# 禁止访问管理后台和私有文件
Disallow: /admin/
Disallow: /api/
Disallow: /*.json$
Disallow: /src/
Disallow: /node_modules/
Disallow: /dist/
Disallow: /.git/
Disallow: /.env
Disallow: /package*.json

# 特别允许重要的数据文件用于SEO
Allow: /data/games.json
Allow: /data/categories.json
Allow: /data/banners.json

# 网站地图位置
Sitemap: ${baseUrl}/sitemap.xml

# 爬取延迟（礼貌性设置）
Crawl-delay: 1

# 特定搜索引擎设置
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Baiduspider
Allow: /
Crawl-delay: 2`;
};

// 转义XML字符
const escapeXml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// 获取页面的规范URL
export const getCanonicalUrl = (path: string, baseUrl: string = 'https://velist.github.io/warp-zone-gems'): string => {
  // 处理HashRouter的路径
  const cleanPath = path.startsWith('/#') ? path : `/#${path}`;
  return `${baseUrl}${cleanPath}`;
};

// 生成结构化数据
export const generateWebsiteStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Warp Zone Gems",
    "alternateName": "马里奥主题游戏资源网站",
    "description": "专为马里奥游戏爱好者打造的游戏资源分享平台，提供丰富的马里奥系列游戏下载、攻略和资源分享。",
    "url": "https://velist.github.io/warp-zone-gems",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://velist.github.io/warp-zone-gems/#/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Warp Zone Gems",
      "logo": {
        "@type": "ImageObject",
        "url": "https://velist.github.io/warp-zone-gems/logo.png",
        "width": 200,
        "height": 200
      }
    },
    "sameAs": [
      "https://github.com/velist/warp-zone-gems"
    ],
    "inLanguage": "zh-CN",
    "copyrightYear": new Date().getFullYear(),
    "genre": "Gaming",
    "keywords": "马里奥, 马里奥游戏, Mario, 任天堂, Nintendo, 平台游戏, 经典游戏, 游戏下载, 游戏资源"
  };
};

// 生成Organization结构化数据
export const generateOrganizationStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Warp Zone Gems",
    "alternateName": "马里奥主题游戏资源网站",
    "description": "专业的马里奥游戏资源分享平台",
    "url": "https://velist.github.io/warp-zone-gems",
    "logo": {
      "@type": "ImageObject",
      "url": "https://velist.github.io/warp-zone-gems/logo.png",
      "width": 200,
      "height": 200
    },
    "foundingDate": "2024",
    "sameAs": [
      "https://github.com/velist/warp-zone-gems"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": "https://github.com/velist/warp-zone-gems/issues"
    }
  };
};

// 生成网站导航结构化数据
export const generateNavigationStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "name": "主导航",
    "url": "https://velist.github.io/warp-zone-gems",
    "hasPart": [
      {
        "@type": "SiteNavigationElement",
        "name": "首页",
        "url": "https://velist.github.io/warp-zone-gems/#/"
      },
      {
        "@type": "SiteNavigationElement", 
        "name": "游戏分类",
        "url": "https://velist.github.io/warp-zone-gems/#/categories"
      },
      {
        "@type": "SiteNavigationElement",
        "name": "关于我们",
        "url": "https://velist.github.io/warp-zone-gems/#/about"
      },
      {
        "@type": "SiteNavigationElement",
        "name": "排行榜",
        "url": "https://velist.github.io/warp-zone-gems/#/leaderboard"
      }
    ]
  };
};

// 将sitemap保存到public目录
export const saveSitemapToPublic = async (
  games: Game[] = [],
  categories: Category[] = []
) => {
  const sitemapContent = generateSitemap(games, categories);
  const robotsContent = generateRobotsTxt();
  
  // 在客户端环境中，我们不能直接写文件
  // 这些内容需要在构建时或服务端生成
  console.log('Sitemap content generated:', sitemapContent);
  console.log('Robots.txt content generated:', robotsContent);
  
  return {
    sitemap: sitemapContent,
    robots: robotsContent
  };
};