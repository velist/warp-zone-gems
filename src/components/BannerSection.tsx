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
        const response = await fetch(`${basePath}/data/banners.json`);
        if (response.ok) {
          bannersData = await response.json();
        } else {
          bannersData = [];
        }
      } else {
        // 开发环境：使用本地管理后台API
        const response = await fetch('http://localhost:3008/api/data/banners');
        const result = await response.json();
        bannersData = result.success ? result.data : [];
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
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <img
            src={banner.imageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    );
  }
  
  // 侧边栏或内容位置的Banner
  return (
    <div className={`space-y-4 ${className}`}>
      {banners.map((banner) => (
        <div key={banner.id} className="overflow-hidden">
          <img
            src={banner.imageUrl}
            alt=""
            className="w-full h-32 object-cover"
          />
        </div>
      ))}
    </div>
  );
};