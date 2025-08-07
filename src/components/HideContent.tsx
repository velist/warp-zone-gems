import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HideContentProps {
  content: string;
  postId: string;
  userId?: string;
  requireLogin?: boolean;
  requireReply?: boolean;
  onReveal?: (postId: string, blockId: string) => void;
}

interface HideBlock {
  id: string;
  content: string;
  revealed: boolean;
}

const HideContent: React.FC<HideContentProps> = ({
  content,
  postId,
  userId,
  requireLogin = false,
  requireReply = false,
  onReveal
}) => {
  const [revealedBlocks, setRevealedBlocks] = useState<Set<string>>(new Set());

  // 解析内容中的隐藏块
  const parseHideContent = (htmlContent: string) => {
    const blocks: HideBlock[] = [];
    let blockIndex = 0;

    const processedContent = htmlContent.replace(
      /\[hide\](.*?)\[\/hide\]/gs,
      (match, hiddenContent) => {
        const blockId = `hide-${postId}-${blockIndex++}`;
        blocks.push({
          id: blockId,
          content: hiddenContent.trim(),
          revealed: revealedBlocks.has(blockId)
        });

        return `__HIDE_BLOCK_${blockId}__`;
      }
    );

    return { processedContent, blocks };
  };

  const { processedContent, blocks } = parseHideContent(content);

  const handleRevealClick = async (blockId: string) => {
    if (requireLogin && !userId) {
      alert('请先登录后查看隐藏内容');
      return;
    }

    if (requireReply) {
      alert('请先回复后查看隐藏内容');
      return;
    }

    // 触发回调（如果需要记录用户行为）
    if (onReveal) {
      onReveal(postId, blockId);
    }

    // 本地状态更新
    setRevealedBlocks(prev => new Set([...prev, blockId]));
  };

  const renderHideBlock = (block: HideBlock) => {
    const isRevealed = revealedBlocks.has(block.id);

    if (isRevealed) {
      return (
        <div
          key={block.id}
          className="hide-content-revealed bg-blue-50 border-2 border-blue-200 rounded-lg p-4 my-4"
        >
          <div className="flex items-center mb-3 text-blue-700 font-medium text-sm">
            <Unlock className="h-4 w-4 mr-2 text-green-500" />
            隐藏内容已解锁
          </div>
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        </div>
      );
    }

    return (
      <div
        key={block.id}
        className="hide-content-preview bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg p-6 my-4 text-center cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
        onClick={() => handleRevealClick(block.id)}
      >
        <Lock className="h-8 w-8 mx-auto mb-3 opacity-90" />
        <div className="font-semibold text-lg mb-2">隐藏内容</div>
        <div className="text-sm opacity-80 mb-4">
          {requireLogin && !userId && '请先登录后查看'}
          {requireReply && '回复后可见'}
          {!requireLogin && !requireReply && '点击查看'}
        </div>
        {!requireLogin && !requireReply && (
          <Button 
            size="sm" 
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            点击解锁
          </Button>
        )}
      </div>
    );
  };

  // 渲染最终内容
  const renderContent = () => {
    let finalContent = processedContent;
    
    blocks.forEach(block => {
      const placeholder = `__HIDE_BLOCK_${block.id}__`;
      const blockHtml = renderHideBlock(block);
      
      // 将占位符替换为实际的React组件渲染结果
      finalContent = finalContent.replace(placeholder, `<div id="${block.id}"></div>`);
    });

    return (
      <div className="hide-content-container">
        {/* 渲染普通内容 */}
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: finalContent }}
        />
        
        {/* 在占位符位置渲染隐藏块 */}
        {blocks.map(block => {
          // 使用 React Portal 或直接渲染
          return renderHideBlock(block);
        })}
      </div>
    );
  };

  return (
    <div className="hide-content-wrapper">
      {renderContent()}
      
      <style jsx global>{`
        .hide-content-revealed {
          animation: revealAnimation 0.5s ease-out;
        }

        @keyframes revealAnimation {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hide-content-preview {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hide-content-preview:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </div>
  );
};

export default HideContent;