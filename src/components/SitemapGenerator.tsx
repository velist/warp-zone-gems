import { useEffect } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { generateSitemap, generateRobotsTxt } from '@/lib/seo-utils';

// 这个组件在应用启动时运行，生成并更新sitemap
export const SitemapGenerator: React.FC = () => {
  const { games, categories, loading } = useSupabaseData();

  useEffect(() => {
    if (!loading && games.length > 0) {
      // 生成sitemap内容
      const sitemapContent = generateSitemap(games, categories);
      
      // 在开发环境中输出到控制台，生产环境中可以发送到服务器
      if (process.env.NODE_ENV === 'development') {
        console.log('Generated Sitemap:', sitemapContent);
        
        // 创建并下载sitemap文件（开发时使用）
        const blob = new Blob([sitemapContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        
        // 存储到 sessionStorage 供其他组件使用
        sessionStorage.setItem('generated_sitemap', sitemapContent);
        
        console.log('Sitemap generated and stored in sessionStorage');
        console.log('To download manually, use: ', url);
      }
    }
  }, [games, categories, loading]);

  // 这个组件不渲染任何内容
  return null;
};

// 手动下载sitemap的工具函数
export const downloadSitemap = () => {
  const sitemapContent = sessionStorage.getItem('generated_sitemap');
  if (sitemapContent) {
    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// 手动下载robots.txt的工具函数  
export const downloadRobotsTxt = () => {
  const robotsContent = generateRobotsTxt();
  const blob = new Blob([robotsContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'robots.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};