import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Download, Eye, Clock, Tag } from "lucide-react";

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
  };
}

export const GameCard = ({ game }: GameCardProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("zh-CN");
  };

  return (
    <Card className="block-card group cursor-pointer overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-xl h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
          {game.cover_image ? (
            <img
              src={game.cover_image}
              alt={game.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center floating-animation">
                <span className="text-2xl">🎮</span>
              </div>
            </div>
          )}
          
          {/* Category Badge */}
          <Badge 
            className="absolute top-3 left-3 coin-shine"
            style={{ backgroundColor: `hsl(var(--accent))`, color: `hsl(var(--accent-foreground))` }}
          >
            <Tag className="w-3 h-3 mr-1" />
            {game.category}
          </Badge>

          {/* Action Buttons Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
            <Button size="sm" variant="secondary" className="mario-button transform scale-90">
              <Eye className="w-4 h-4 mr-1" />
              预览
            </Button>
            <Button size="sm" className="mario-button transform scale-90">
              <Download className="w-4 h-4 mr-1" />
              下载
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
        <Button className="w-full mario-button group-hover:animate-power-up">
          <Download className="w-4 h-4 mr-2" />
          立即下载
        </Button>
      </CardFooter>
    </Card>
  );
};