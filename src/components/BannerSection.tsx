import React, { useState, useEffect } from 'react';

interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  linkText?: string;
  position: 'hero' | 'sidebar' | 'content';
  status: 'active' | 'inactive';
  startDate?: string;
  endDate?: string;
  order?: number;
}

interface BannerSectionProps {
  position: 'hero' | 'sidebar' | 'content';
  className?: string;
}

export const BannerSection: React.FC<BannerSectionProps> = ({ position, className = '' }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      
      // 检测环境并选择数据源
      const isProduction = window.location.hostname === 'velist.github.io' || 
                          window.location.hostname === 'aigame.lol' ||
                          window.location.protocol === 'https:' ||
                          process.env.NODE_ENV === 'production';
      
      let bannersData;
      
      if (isProduction) {
        // 生产环境：直接读取静态JSON文件
        const basePath = window.location.hostname === 'aigame.lol' ? '' : '/warp-zone-gems';
        const response = await fetch(`${basePath}/data/banners.json?v=${Date.now()}`);
        if (response.ok) {
          bannersData = await response.json();
        } else {
          console.warn('无法加载banner数据，使用默认数据');
          bannersData = [];
        }
      } else {
        // 开发环境：优先尝试管理后台API，备用静态文件
        try {
          const response = await fetch(`http://localhost:3008/api/data/banners?v=${Date.now()}`);
          if (response.ok) {
            const result = await response.json();
            bannersData = result.success ? result.data : [];
          } else {
            throw new Error('管理后台API不可用');
          }
        } catch (adminError) {
          console.warn('管理后台不可用，尝试静态文件:', adminError.message);
          // 备用方案：读取静态JSON文件
          try {
            const staticResponse = await fetch(`/data/banners.json?v=${Date.now()}`);
            if (staticResponse.ok) {
              bannersData = await staticResponse.json();
            } else {
              bannersData = [];
            }
          } catch (staticError) {
            console.error('无法加载静态banner数据:', staticError);
            bannersData = [];
          }
        }
      }

      // 过滤当前位置和状态的Banner
      const activeBanners = bannersData.filter((banner: Banner) => {
        if (banner.position !== position || banner.status !== 'active') {
          return false;
        }
        
        // 检查时间范围
        const now = new Date();
        if (banner.startDate && new Date(banner.startDate) > now) {
          return false;
        }
        if (banner.endDate && new Date(banner.endDate) < now) {
          return false;
        }
        
        return true;
      });

      // 按order排序
      activeBanners.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      setBanners(activeBanners);
    } catch (error) {
      console.error('获取Banner数据失败:', error);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  // 自动轮播
  useEffect(() => {
    if (banners.length > 1 && position === 'hero') {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000); // 5秒轮播
      
      return () => clearInterval(interval);
    }
  }, [banners.length, position]);

  if (loading || banners.length === 0) {
    return null;
  }

  // Hero位置的Banner轮播
  if (position === 'hero') {
    const banner = banners[currentBanner];
    
    return (
      <section className={`relative overflow-hidden ${className}`}>
        <div className="relative w-full h-64 md:h-80 lg:h-96 group">
          <img
            src={banner.imageUrl}
            alt={banner.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* 覆盖层 */}
          <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity duration-300"></div>
          
          {/* Banner内容 */}
          <div className="absolute inset-0 flex items-center justify-center text-white text-center">
            <div className="max-w-2xl px-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
                {banner.title}
              </h2>
              {banner.description && (
                <p className="text-lg md:text-xl mb-6 drop-shadow-md opacity-90">
                  {banner.description}
                </p>
              )}
              {banner.linkUrl && banner.linkText && (
                <a
                  href={banner.linkUrl}
                  className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
                  target={banner.linkUrl.startsWith('http') ? '_blank' : '_self'}
                  rel={banner.linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {banner.linkText}
                </a>
              )}
            </div>
          </div>
          
          {/* 轮播指示器 */}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentBanner 
                      ? 'bg-white scale-110' 
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                  aria-label={`切换到第${index + 1}个Banner`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }
  
  // 侧边栏或内容位置的Banner
  return (
    <div className={`space-y-4 ${className}`}>
      {banners.map((banner) => (
        <div key={banner.id} className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="relative group">
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* 覆盖层 */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
            
            {/* Banner内容 */}
            {(banner.title || banner.linkUrl) && (
              <div className="absolute inset-0 flex items-end">
                <div className="w-full p-3 bg-gradient-to-t from-black to-transparent text-white">
                  {banner.title && (
                    <h3 className="font-bold text-sm mb-1 line-clamp-1">
                      {banner.title}
                    </h3>
                  )}
                  {banner.linkUrl && banner.linkText && (
                    <a
                      href={banner.linkUrl}
                      className="inline-block text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-all duration-300"
                      target={banner.linkUrl.startsWith('http') ? '_blank' : '_self'}
                      rel={banner.linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {banner.linkText}
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};