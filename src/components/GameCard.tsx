import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GameImage } from "@/components/OptimizedImage";
import { QRCodeModal } from "@/components/QRCodeModal";
import { Star, Download, Eye, Clock, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

interface DownloadLink {
  type: string;
  url: string;
  password?: string;
  label?: string;
}

interface GameCardProps {
  game: {
    id: string;
    title: string;
    description?: string;
    cover_image?: string;
    category: string;
    tags?: string[];
    author?: string;
    published_at?: string;
    download_link?: string;
    download_links?: DownloadLink[];
  };
}

export const GameCard = ({ game }: GameCardProps) => {
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("zh-CN");
  };

  const handleCardClick = () => {
    navigate(`/game/${game.id}`);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 获取下载链接
    const downloadLinks = getDownloadLinks();
    
    if (downloadLinks.length === 0) {
      return; // 没有下载链接
    }
    
    if (downloadLinks.length === 1) {
      // 只有一个链接，直接打开
      window.open(downloadLinks[0].url, '_blank');
    } else {
      // 多个链接，显示QR码模态框
      setShowQRModal(true);
    }
  };

  const getDownloadLinks = (): DownloadLink[] => {
    const links: DownloadLink[] = [];
    
    // 优先使用新的 download_links 数组
    if (game.download_links && game.download_links.length > 0) {
      return game.download_links;
    }
    
    // 兼容旧的 download_link 字段
    if (game.download_link && game.download_link !== '#') {
      links.push({
        type: '下载链接',
        url: game.download_link,
        label: '默认下载'
      });
    }
    
    return links;
  };

  const downloadLinks = getDownloadLinks();
  const hasDownload = downloadLinks.length > 0;

  return (
    <Card className="block-card group cursor-pointer overflow-hidden" onClick={handleCardClick}>
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-xl h-48">
          <GameImage
            src={game.cover_image}
            title={game.title}
            category={game.category}
            className="w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Category Badge */}
          <Badge 
            className="absolute top-3 left-3 coin-shine z-10"
            style={{ backgroundColor: `hsl(var(--accent))`, color: `hsl(var(--accent-foreground))` }}
          >
            <Tag className="w-3 h-3 mr-1" />
            {game.category}
          </Badge>

          {/* Action Buttons Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3 z-10">
            <Button 
              size="sm" 
              variant="secondary" 
              className="mario-button transform scale-90"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/game/${game.id}`);
              }}
            >
              <Eye className="w-4 h-4 mr-1" />
              预览
            </Button>
            <Button 
              size="sm" 
              className="mario-button transform scale-90"
              onClick={handleDownloadClick}
              disabled={!hasDownload}
            >
              <Download className="w-4 h-4 mr-1" />
              {downloadLinks.length > 1 ? `下载 (${downloadLinks.length})` : '下载'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors duration-300">
          {game.title}
        </CardTitle>
        
        {game.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {game.description}
          </p>
        )}

        {/* Tags */}
        {game.tags && game.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {game.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs coin-shine"
              >
                {tag}
              </Badge>
            ))}
            {game.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{game.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-3">
            {game.author && (
              <span className="flex items-center">
                👤 {game.author}
              </span>
            )}
            {game.published_at && (
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(game.published_at)}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="flex items-center">
              <Star className="w-3 h-3 mr-1 text-accent" />
              4.8
            </span>
            <span className="flex items-center">
              <Download className="w-3 h-3 mr-1" />
              {Math.floor(Math.random() * 1000) + 100}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full mario-button group-hover:animate-power-up"
          onClick={handleDownloadClick}
          disabled={!hasDownload}
        >
          <Download className="w-4 h-4 mr-2" />
          {hasDownload ? (downloadLinks.length > 1 ? `立即下载 (${downloadLinks.length} 个链接)` : '立即下载') : '暂无下载'}
        </Button>
      </CardFooter>

      {/* QR Code Modal */}
      <QRCodeModal 
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        downloadLinks={downloadLinks}
        gameTitle={game.title}
      />
    </Card>
  );
};