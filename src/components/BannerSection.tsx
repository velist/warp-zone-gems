import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

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
                          window.location.protocol === 'https:' ||
                          process.env.NODE_ENV === 'production';
      
      let bannersData;
      
      if (isProduction) {
        // 生产环境：直接读取静态JSON文件
        const response = await fetch('/data/banners.json');
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

  const handlePrevious = () => {
    setCurrentBanner((prev) => 
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, '_blank');
    }
  };

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
            alt={banner.title}
            className="w-full h-full object-cover"
          />
          
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
          
          {/* 内容 */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-lg text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  {banner.title}
                </h2>
                {banner.description && (
                  <p className="text-lg mb-6 opacity-90">
                    {banner.description}
                  </p>
                )}
                {banner.linkUrl && banner.linkText && (
                  <Button
                    onClick={() => handleBannerClick(banner)}
                    className="mario-button"
                    size="lg"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {banner.linkText}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* 轮播控制 */}
          {banners.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              {/* 指示器 */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBanner(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentBanner ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    );
  }
  
  // 侧边栏或内容位置的Banner
  return (
    <div className={`space-y-4 ${className}`}>
      {banners.map((banner) => (
        <Card
          key={banner.id}
          className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => handleBannerClick(banner)}
        >
          <div className="relative">
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-2 left-2 right-2 text-white">
              <h3 className="font-semibold text-sm mb-1">{banner.title}</h3>
              {banner.description && (
                <p className="text-xs opacity-90 line-clamp-2">
                  {banner.description}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};