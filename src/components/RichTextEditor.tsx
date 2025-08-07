import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Sparkles, Wand2, Eye, EyeOff } from 'lucide-react';
import { hideContentCSS } from '@/lib/hideContentModule';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onAIGenerate?: () => void;
  aiGenerating?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '输入详细内容...',
  onAIGenerate,
  aiGenerating = false
}) => {
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'font': [] }],
          [{ 'size': [] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'script': 'sub' }, { 'script': 'super' }],
          [{ 'indent': '-1' }, { 'indent': '+1' }],
          [{ 'direction': 'rtl' }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'align': [] }],
          ['link', 'image', 'video'],
          ['code-block'],
          ['hide-content'], // 添加隐藏内容按钮
          ['clean']
        ],
        handlers: {
          'hide-content': function(this: any) {
            const range = this.quill.getSelection();
            if (range) {
              const text = this.quill.getText(range.index, range.length);
              
              // 如果有选中文本，将其包装为隐藏内容
              if (text.trim()) {
                this.quill.deleteText(range.index, range.length);
                this.quill.insertText(range.index, `[hide]${text}[/hide]`, 'user');
                this.quill.setSelection(range.index + 6 + text.length + 7, 0);
              } else {
                // 如果没有选中文本，插入隐藏代码模板
                this.quill.insertText(range.index, '[hide][/hide]', 'user');
                this.quill.setSelection(range.index + 6, 0);
              }
            }
          }
        }
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'script', 'indent',
    'direction', 'color', 'background', 'align',
    'link', 'image', 'video', 'code-block'
  ];

  // 在编辑器中实时预览隐藏内容
  const preprocessContent = (content: string) => {
    return content.replace(
      /\[hide\](.*?)\[\/hide\]/gs,
      '<div class="hide-content-preview-editor" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px; border-radius: 6px; margin: 8px 0; text-align: center;"><span style="display: block; margin-bottom: 4px;">🔒</span><strong>隐藏内容预览</strong><div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">$1</div></div>'
    );
  };

  const handleChange = (content: string) => {
    // 将预览格式转换回隐藏代码
    const convertedContent = content.replace(
      /<div class="hide-content-preview-editor"[^>]*>.*?<div[^>]*>(.*?)<\/div><\/div>/gs,
      '[hide]$1[/hide]'
    );
    onChange(convertedContent);
  };

  return (
    <div className="space-y-4">
      {/* AI 生成按钮 */}
      {onAIGenerate && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            💡 提示：选中文本后点击工具栏的 🔒 按钮可设置为隐藏内容，或直接输入 [hide]内容[/hide]
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAIGenerate}
            disabled={aiGenerating}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
          >
            {aiGenerating ? (
              <Wand2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {aiGenerating ? 'AI生成中...' : 'AI智能生成内容'}
          </Button>
        </div>
      )}

      {/* 富文本编辑器 */}
      <div className="rich-text-editor">
        <ReactQuill
          theme="snow"
          value={preprocessContent(value)}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{
            height: '400px',
            marginBottom: '50px'
          }}
        />
      </div>

      {/* 自定义样式 */}
      <style jsx global>{`
        .rich-text-editor .ql-toolbar {
          border-top: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          background: #f8fafc;
          border-radius: 8px 8px 0 0;
        }

        .rich-text-editor .ql-container {
          border-bottom: 1px solid #e2e8f0;
          border-left: 1px solid #e2e8f0;
          border-right: 1px solid #e2e8f0;
          border-radius: 0 0 8px 8px;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .rich-text-editor .ql-editor {
          min-height: 300px;
          font-size: 14px;
          line-height: 1.6;
        }

        .rich-text-editor .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: normal;
        }

        .rich-text-editor .ql-snow .ql-tooltip {
          background: white;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }

        .rich-text-editor .ql-snow .ql-tooltip input[type=text] {
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 6px 12px;
        }

        .rich-text-editor .ql-snow .ql-picker.ql-expanded .ql-picker-options {
          background: white;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }

        /* 隐藏内容按钮样式 */
        .ql-toolbar .ql-hide-content {
          width: auto;
        }

        .ql-toolbar .ql-hide-content::after {
          content: "🔒";
          font-size: 16px;
        }

        .ql-toolbar .ql-hide-content:hover::after {
          background: #f3f4f6;
        }

        /* 隐藏内容预览样式 */
        ${hideContentCSS}
      `}</style>
    </div>
  );
};

export default RichTextEditor;