import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Copy, Download, ExternalLink } from 'lucide-react';

interface FloatingElement {
  id: string;
  title: string;
  type: 'qrcode' | 'social' | 'contact' | 'download' | 'custom';
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center-right' | 'center-left';
  icon: string;
  bg_color: string;
  action: 'link' | 'popup' | 'download' | 'copy';
  content: string;
  qr_code?: string;
  size: 'small' | 'medium' | 'large';
  z_index: number;
  enabled: boolean;
}

export const FloatingElements: React.FC = () => {
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const [activePopup, setActivePopup] = useState<string | null>(null);

  useEffect(() => {
    fetchFloatingElements();
  }, []);

  const fetchFloatingElements = async () => {
    try {
      // 检测环境并选择数据源
      const isProduction = window.location.hostname === 'velist.github.io' || 
                          window.location.protocol === 'https:' ||
                          process.env.NODE_ENV === 'production';
      
      let elementsData;
      
      if (isProduction) {
        // 生产环境：直接读取静态JSON文件
        const response = await fetch('/data/floating-windows.json');
        if (response.ok) {
          elementsData = await response.json();
        } else {
          elementsData = [];
        }
      } else {
        // 开发环境：使用本地管理后台API
        const response = await fetch('http://localhost:3008/api/data/floating-windows');
        const result = await response.json();
        elementsData = result.success ? result.data : [];
      }

      // 只显示启用的元素
      const activeElements = elementsData.filter((element: FloatingElement) => element.enabled);
      setElements(activeElements);
    } catch (error) {
      console.error('获取悬浮元素数据失败:', error);
    }
  };

  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'center-right':
        return 'top-1/2 right-4 transform -translate-y-1/2';
      case 'center-left':
        return 'top-1/2 left-4 transform -translate-y-1/2';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small':
        return 'w-12 h-12 text-sm';
      case 'large':
        return 'w-16 h-16 text-lg';
      case 'medium':
      default:
        return 'w-14 h-14 text-base';
    }
  };

  const handleElementClick = (element: FloatingElement) => {
    switch (element.action) {
      case 'link':
        if (element.content) {
          window.open(element.content, '_blank');
        }
        break;
        
      case 'popup':
        setActivePopup(element.id);
        break;
        
      case 'download':
        if (element.content) {
          const link = document.createElement('a');
          link.href = element.content;
          link.download = element.title;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        break;
        
      case 'copy':
        if (element.content) {
          navigator.clipboard.writeText(element.content).then(() => {
            // 显示复制成功提示
            showToast('已复制到剪贴板！');
          });
        }
        break;
    }
  };

  const showToast = (message: string) => {
    // 创建临时toast提示
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50 transition-opacity';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 2000);
  };

  const renderPopup = (element: FloatingElement) => {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={() => setActivePopup(null)}
      >
        <Card
          className="max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{element.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActivePopup(null)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {element.qr_code && (
              <div className="text-center mb-4">
                <img
                  src={element.qr_code}
                  alt={`${element.title} 二维码`}
                  className="w-48 h-48 mx-auto object-contain"
                />
              </div>
            )}
            
            <div className="text-gray-700 mb-4">{element.content}</div>
            
            <div className="flex space-x-2">
              {element.action === 'copy' && (
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(element.content);
                    showToast('已复制到剪贴板！');
                    setActivePopup(null);
                  }}
                  className="flex-1"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  复制
                </Button>
              )}
              
              {element.action === 'link' && (
                <Button
                  onClick={() => {
                    window.open(element.content, '_blank');
                    setActivePopup(null);
                  }}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  打开链接
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => setActivePopup(null)}
                className="flex-1"
              >
                关闭
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      {/* 悬浮元素 */}
      {elements.map((element) => (
        <div
          key={element.id}
          className={`fixed ${getPositionClasses(element.position)}`}
          style={{ zIndex: element.z_index }}
        >
          <Button
            onClick={() => handleElementClick(element)}
            className={`${getSizeClasses(element.size)} rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110`}
            style={{ backgroundColor: element.bg_color }}
            title={element.title}
          >
            <span className="text-white">{element.icon}</span>
          </Button>
        </div>
      ))}
      
      {/* 弹窗 */}
      {activePopup && elements.find(e => e.id === activePopup) && 
        renderPopup(elements.find(e => e.id === activePopup)!)
      }
    </>
  );
};