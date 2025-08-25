import React, { useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

interface DownloadLink {
  type: string;
  url: string;
  password?: string;
  label?: string;
}

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadLinks: DownloadLink[];
  gameTitle: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ 
  isOpen, 
  onClose, 
  downloadLinks, 
  gameTitle 
}) => {
  const { toast } = useToast();
  const [selectedLink, setSelectedLink] = React.useState<DownloadLink | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (downloadLinks.length > 0 && !selectedLink) {
      setSelectedLink(downloadLinks[0]);
    }
  }, [downloadLinks, selectedLink]);

  useEffect(() => {
    if (selectedLink?.url && canvasRef.current) {
      generateQRCode(selectedLink.url);
    }
  }, [selectedLink]);

  const generateQRCode = async (url: string) => {
    try {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, url, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "生成二维码失败",
        description: "无法为该链接生成二维码",
        variant: "destructive",
      });
    }
  };

  const getCloudIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('百度') || lowerType.includes('baidu')) return '🌐';
    if (lowerType.includes('天翼') || lowerType.includes('189')) return '☁️';
    if (lowerType.includes('阿里') || lowerType.includes('ali')) return '📱';
    if (lowerType.includes('微云') || lowerType.includes('qq')) return '💫';
    if (lowerType.includes('115')) return '🔥';
    if (lowerType.includes('蓝奏') || lowerType.includes('lanzou')) return '💎';
    return '📦';
  };

  if (!selectedLink) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-center">
            {gameTitle} - 扫码下载
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 下载方式选择 - 仅在多个选项时显示 */}
          {downloadLinks.length > 1 && (
            <div className="grid grid-cols-2 gap-2">
              {downloadLinks.map((link, index) => (
                <Button
                  key={index}
                  variant={selectedLink === link ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLink(link)}
                  className="justify-center"
                >
                  <span className="mr-1">{getCloudIcon(link.type)}</span>
                  {link.type}
                </Button>
              ))}
            </div>
          )}

          {/* 二维码显示 - 核心内容 */}
          <div className="flex flex-col items-center space-y-3">
            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <canvas 
                ref={canvasRef}
                className="max-w-full h-auto"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              请使用手机扫描二维码
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};