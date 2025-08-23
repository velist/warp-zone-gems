import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ExternalLink } from 'lucide-react';

interface Popup {
  id: string;
  title: string;
  content: string;
  type: 'welcome' | 'announcement' | 'promotion' | 'notification';
  position: 'center' | 'top' | 'bottom';
  image?: string;
  button_text?: string;
  button_url?: string;
  delay: number;
  auto_close: number;
  frequency: 'once' | 'daily' | 'session' | 'always';
  start_date?: string;
  end_date?: string;
  enabled: boolean;
}

export const PopupSystem: React.FC = () => {
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    checkAndShowPopups();
  }, []);

  const checkAndShowPopups = async () => {
    try {
      // 检测环境并选择数据源
      const isProduction = window.location.hostname === 'velist.github.io' || 
                          window.location.protocol === 'https:' ||
                          process.env.NODE_ENV === 'production';
      
      let popupsData;
      
      if (isProduction) {
        // 生产环境：直接读取静态JSON文件
        const response = await fetch('/warp-zone-gems/data/popups.json');
        if (response.ok) {
          popupsData = await response.json();
        } else {
          popupsData = [];
        }
      } else {
        // 开发环境：使用本地管理后台API
        const response = await fetch('http://localhost:3008/api/data/popups');
        const result = await response.json();
        popupsData = result.success ? result.data : [];
      }

      // 过滤可显示的弹窗
      const eligiblePopups = popupsData.filter((popup: Popup) => {
        if (!popup.enabled) return false;
        
        // 检查时间范围
        const now = new Date();
        if (popup.start_date && new Date(popup.start_date) > now) return false;
        if (popup.end_date && new Date(popup.end_date) < now) return false;
        
        // 检查显示频率
        return shouldShowPopup(popup);
      });

      if (eligiblePopups.length > 0) {
        // 选择第一个符合条件的弹窗
        const popup = eligiblePopups[0];
        
        // 延迟显示
        setTimeout(() => {
          setActivePopup(popup);
          setShowPopup(true);
          
          // 记录显示历史
          recordPopupShown(popup);
          
          // 自动关闭
          if (popup.auto_close > 0) {
            setTimeout(() => {
              closePopup();
            }, popup.auto_close * 1000);
          }
        }, popup.delay * 1000);
      }
    } catch (error) {
      console.error('获取弹窗数据失败:', error);
    }
  };

  const shouldShowPopup = (popup: Popup): boolean => {
    const storageKey = `popup_${popup.id}`;
    const now = new Date().getTime();
    
    switch (popup.frequency) {
      case 'once':
        // 只显示一次
        return !localStorage.getItem(storageKey);
        
      case 'daily':
        // 每天显示一次
        const lastShownDaily = localStorage.getItem(storageKey);
        if (!lastShownDaily) return true;
        
        const lastDateDaily = new Date(parseInt(lastShownDaily));
        const today = new Date();
        return lastDateDaily.toDateString() !== today.toDateString();
        
      case 'session':
        // 每次会话显示一次
        return !sessionStorage.getItem(storageKey);
        
      case 'always':
        // 每次访问都显示
        return true;
        
      default:
        return false;
    }
  };

  const recordPopupShown = (popup: Popup) => {
    const storageKey = `popup_${popup.id}`;
    const now = new Date().getTime().toString();
    
    switch (popup.frequency) {
      case 'once':
      case 'daily':
        localStorage.setItem(storageKey, now);
        break;
      case 'session':
        sessionStorage.setItem(storageKey, now);
        break;
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setTimeout(() => {
      setActivePopup(null);
    }, 300); // 等待动画完成
  };

  const handleButtonClick = () => {
    if (activePopup?.button_url) {
      window.open(activePopup.button_url, '_blank');
    }
    closePopup();
  };

  if (!activePopup) return null;

  const getPositionClasses = () => {
    switch (activePopup.position) {
      case 'top':
        return 'items-start pt-8';
      case 'bottom':
        return 'items-end pb-8';
      case 'center':
      default:
        return 'items-center';
    }
  };

  const getTypeIcon = () => {
    switch (activePopup.type) {
      case 'welcome':
        return '👋';
      case 'announcement':
        return '📢';
      case 'promotion':
        return '🎉';
      case 'notification':
        return '🔔';
      default:
        return '💬';
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center ${getPositionClasses()} px-4 transition-opacity duration-300 ${
        showPopup ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={closePopup}
    >
      <Card
        className={`max-w-md w-full transform transition-all duration-300 ${
          showPopup ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-0">
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <span className="text-xl">{getTypeIcon()}</span>
              <h3 className="font-semibold text-lg">{activePopup.title}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closePopup}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* 图片 */}
          {activePopup.image && (
            <div className="w-full">
              <img
                src={activePopup.image}
                alt={activePopup.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* 内容 */}
          <div className="p-4">
            <div
              className="text-gray-700 mb-4"
              dangerouslySetInnerHTML={{ __html: activePopup.content }}
            />

            {/* 按钮 */}
            <div className="flex space-x-2">
              {activePopup.button_text && (
                <Button
                  onClick={handleButtonClick}
                  className="mario-button flex-1"
                >
                  {activePopup.button_url && (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  {activePopup.button_text}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={closePopup}
                className="flex-1"
              >
                关闭
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};