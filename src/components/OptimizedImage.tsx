import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // 高优先级图片，立即加载
  placeholder?: string; // 占位图片
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean; // 是否懒加载，默认true
  quality?: number; // 图片质量 1-100
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  title,
  className,
  width,
  height,
  priority = false,
  placeholder = '/placeholder.svg',
  onLoad,
  onError,
  lazy = true,
  quality = 80
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [inView, setInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  // 懒加载逻辑
  useEffect(() => {
    if (!lazy || priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, priority]);

  // 处理图片加载成功
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // 处理图片加载失败
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // 生成优化的图片URL（如果使用图床或CDN）
  const getOptimizedSrc = (originalSrc: string) => {
    // 如果是外部URL或已经是优化过的URL，直接返回
    if (originalSrc.startsWith('http') || originalSrc.includes('w_') || originalSrc.includes('q_')) {
      return originalSrc;
    }
    
    // 这里可以添加图片CDN优化参数
    // 例如：对于 Cloudinary, ImgBB 等图床的优化
    return originalSrc;
  };

  // 生成WebP格式的图片URL（现代浏览器支持）
  const getWebPSrc = (originalSrc: string) => {
    // 简单的WebP检测和转换逻辑
    if (originalSrc.includes('.jpg') || originalSrc.includes('.png')) {
      return originalSrc.replace(/\.(jpg|png)$/, '.webp');
    }
    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(src);
  const webpSrc = getWebPSrc(optimizedSrc);

  return (
    <div 
      ref={imgRef}
      className={cn('relative overflow-hidden', className)}
      style={{ width, height }}
    >
      {!inView && lazy && !priority && (
        <div 
          className="w-full h-full bg-muted animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-8 h-8 text-muted-foreground">
            📷
          </div>
        </div>
      )}

      {inView && (
        <>
          {/* 占位图片 - 在真实图片加载前显示 */}
          {!isLoaded && !hasError && (
            <img
              src={placeholder}
              alt=""
              className={cn(
                'absolute inset-0 w-full h-full object-cover filter blur-sm opacity-50',
                'transition-opacity duration-300'
              )}
              aria-hidden="true"
            />
          )}

          {/* 主要图片 - 支持WebP和fallback */}
          {!hasError && (
            <picture>
              {/* WebP 格式（现代浏览器支持） */}
              <source srcSet={webpSrc} type="image/webp" />
              
              {/* 原始格式作为fallback */}
              <img
                src={optimizedSrc}
                alt={alt}
                title={title || alt}
                width={width}
                height={height}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={handleLoad}
                onError={handleError}
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-500',
                  isLoaded ? 'opacity-100' : 'opacity-0'
                )}
                // SEO 友好的属性
                itemProp="image"
              />
            </picture>
          )}

          {/* 错误状态显示 */}
          {hasError && (
            <div 
              className="w-full h-full bg-muted flex items-center justify-center"
              style={{ width, height }}
            >
              <div className="text-center text-muted-foreground">
                <div className="w-12 h-12 mx-auto mb-2 text-4xl">🖼️</div>
                <div className="text-sm">图片加载失败</div>
              </div>
            </div>
          )}

          {/* 加载动画 */}
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
        </>
      )}
    </div>
  );
};

// 游戏卡片专用的优化图片组件
export const GameImage: React.FC<{
  src?: string;
  title: string;
  category?: string;
  className?: string;
  priority?: boolean;
}> = ({ src, title, category, className, priority = false }) => {
  // 为游戏图片生成SEO友好的alt文本
  const generateAlt = () => {
    let altText = title;
    if (category) {
      altText += ` - ${category}游戏`;
    }
    altText += ' - 游戏截图下载';
    return altText;
  };

  // 生成SEO友好的title属性
  const generateTitle = () => {
    return `${title} 游戏截图 - Warp Zone Gems马里奥游戏资源网站`;
  };

  return (
    <OptimizedImage
      src={src || '/placeholder.svg'}
      alt={generateAlt()}
      title={generateTitle()}
      className={cn('aspect-video', className)}
      priority={priority}
      placeholder="/game-placeholder.svg" // 游戏专用占位图
    />
  );
};

// 头像专用的优化图片组件
export const AvatarImage: React.FC<{
  src?: string;
  name: string;
  className?: string;
}> = ({ src, name, className }) => {
  return (
    <OptimizedImage
      src={src || '/avatar-placeholder.svg'}
      alt={`${name}的头像`}
      title={`${name} - 用户头像`}
      className={cn('aspect-square rounded-full', className)}
      placeholder="/avatar-placeholder.svg"
    />
  );
};

// Banner专用的优化图片组件
export const BannerImage: React.FC<{
  src?: string;
  title: string;
  description?: string;
  className?: string;
  priority?: boolean;
}> = ({ src, title, description, className, priority = true }) => {
  const generateAlt = () => {
    let altText = title;
    if (description) {
      altText += ` - ${description}`;
    }
    return altText;
  };

  return (
    <OptimizedImage
      src={src || '/banner-placeholder.svg'}
      alt={generateAlt()}
      title={`${title} - Warp Zone Gems横幅`}
      className={cn('aspect-[16/9]', className)}
      priority={priority}
      placeholder="/banner-placeholder.svg"
    />
  );
};

export default OptimizedImage;