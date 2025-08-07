import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Save, ArrowLeft, Sparkles, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface FloatingActionPanelProps {
  onSave: (isDraft: boolean) => void;
  onBack: () => void;
  onAIGenerate: () => void;
  saving: boolean;
  aiGenerating?: boolean;
  position?: 'left' | 'right';
}

const FloatingActionPanel: React.FC<FloatingActionPanelProps> = ({
  onSave,
  onBack,
  onAIGenerate,
  saving,
  aiGenerating = false,
  position = 'right'
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const baseClasses = "fixed top-1/2 transform -translate-y-1/2 z-50 transition-all duration-300";
  const positionClasses = position === 'left' 
    ? `left-4 ${collapsed ? '-translate-x-16' : 'translate-x-0'}` 
    : `right-4 ${collapsed ? 'translate-x-16' : 'translate-x-0'}`;

  return (
    <Card className={`${baseClasses} ${positionClasses} p-2 shadow-lg bg-white/90 backdrop-blur-sm border-2`}>
      <div className="flex flex-col space-y-2">
        {/* 折叠按钮 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 h-8 w-8 self-center"
        >
          {collapsed ? (
            position === 'left' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
          ) : (
            position === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </Button>

        {!collapsed && (
          <>
            {/* AI生成 */}
            <Button
              onClick={onAIGenerate}
              disabled={aiGenerating || saving}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 h-10 w-24"
            >
              <div className="flex flex-col items-center">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs mt-1">{aiGenerating ? 'AI中...' : 'AI生成'}</span>
              </div>
            </Button>

            {/* 保存草稿 */}
            <Button
              variant="outline"
              onClick={() => onSave(true)}
              disabled={saving}
              size="sm"
              className="h-10 w-24"
            >
              <div className="flex flex-col items-center">
                <FileText className="h-4 w-4" />
                <span className="text-xs mt-1">{saving ? '保存中' : '草稿'}</span>
              </div>
            </Button>

            {/* 发布 */}
            <Button
              onClick={() => onSave(false)}
              disabled={saving}
              size="sm"
              className="bg-green-600 hover:bg-green-700 h-10 w-24"
            >
              <div className="flex flex-col items-center">
                <Save className="h-4 w-4" />
                <span className="text-xs mt-1">{saving ? '发布中' : '发布'}</span>
              </div>
            </Button>

            {/* 返回 */}
            <Button
              variant="secondary"
              onClick={onBack}
              size="sm"
              className="h-10 w-24"
            >
              <div className="flex flex-col items-center">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-xs mt-1">返回</span>
              </div>
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default FloatingActionPanel;