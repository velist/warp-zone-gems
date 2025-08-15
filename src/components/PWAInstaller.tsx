import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Download, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'mobile' | 'desktop'>('mobile');

  useEffect(() => {
    // 检查是否已安装
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // 检查是否为移动设备中的已安装应用
      if ((navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    // 检测平台
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setPlatform(isMobile ? 'mobile' : 'desktop');
    };

    checkInstalled();
    detectPlatform();

    // 监听安装提示事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // 延迟显示安装提示
      setTimeout(() => {
        if (!isInstalled && !localStorage.getItem('pwa-install-dismissed')) {
          setIsVisible(true);
        }
      }, 10000); // 10秒后显示
    };

    // 监听应用安装事件
    const handleAppInstalled = () => {
      console.log('PWA安装成功');
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      
      // 显示成功消息
      if ('serviceWorker' in navigator && 'Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Warp Zone Gems', {
              body: '应用安装成功！现在您可以从桌面快速访问。',
              icon: '/icons/icon-192x192.png'
            });
          }
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('用户接受安装');
      } else {
        console.log('用户拒绝安装');
      }
      
      setDeferredPrompt(null);
      setIsVisible(false);
    } catch (error) {
      console.error('安装失败:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    
    // 7天后重新提示
    setTimeout(() => {
      localStorage.removeItem('pwa-install-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return platform === 'mobile' 
        ? '点击浏览器菜单，选择"添加到主屏幕"' 
        : '点击地址栏右侧的安装图标';
    }
    
    if (userAgent.includes('firefox')) {
      return platform === 'mobile'
        ? '点击浏览器菜单，选择"安装"'
        : '点击地址栏右侧的安装图标';
    }
    
    if (userAgent.includes('safari')) {
      return platform === 'mobile'
        ? '点击分享按钮，选择"添加到主屏幕"'
        : '文件菜单 → 添加到程序坞';
    }
    
    if (userAgent.includes('edg')) {
      return '点击浏览器菜单（...），选择"应用" → "将此站点安装为应用"';
    }
    
    return '在浏览器菜单中查找"安装应用"或"添加到主屏幕"选项';
  };

  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="border-2 border-primary/20 shadow-lg backdrop-blur-sm bg-card/95">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {platform === 'mobile' ? (
                <Smartphone className="w-5 h-5 text-primary" />
              ) : (
                <Monitor className="w-5 h-5 text-primary" />
              )}
              <h3 className="font-semibold text-sm">安装应用</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            将 Warp Zone Gems 安装到您的设备，享受更快的加载速度和离线访问功能。
          </p>

          <div className="space-y-2">
            {deferredPrompt ? (
              <Button 
                onClick={handleInstall}
                className="w-full text-sm"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                立即安装
              </Button>
            ) : (
              <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                <p className="font-medium mb-1">手动安装说明：</p>
                <p>{getInstallInstructions()}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground">
              <div className="text-center">
                <div className="w-6 h-6 mx-auto mb-1 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">⚡</span>
                </div>
                <span>更快加载</span>
              </div>
              <div className="text-center">
                <div className="w-6 h-6 mx-auto mb-1 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">📱</span>
                </div>
                <span>原生体验</span>
              </div>
              <div className="text-center">
                <div className="w-6 h-6 mx-auto mb-1 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">🔄</span>
                </div>
                <span>离线访问</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// PWA状态Hook
export const usePWA = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // 检查安装状态
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (navigator as any).standalone === true) {
        setIsInstalled(true);
      }
    };

    // 监听在线状态
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // 监听Service Worker更新
    const handleSWUpdate = () => {
      setUpdateAvailable(true);
    };

    checkInstalled();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 注册Service Worker更新监听
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleSWUpdate);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleSWUpdate);
      }
    };
  }, []);

  const updateApp = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.update();
        });
      });
      
      // 刷新页面以应用更新
      window.location.reload();
    }
  };

  return {
    isInstalled,
    isOnline,
    updateAvailable,
    updateApp
  };
};