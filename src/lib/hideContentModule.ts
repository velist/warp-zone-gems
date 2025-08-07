import Quill from 'quill';

// 隐藏内容的自定义格式
const Block = Quill.import('blots/block');

class HideBlock extends Block {
  static blotName = 'hide-block';
  static tagName = 'div';
  static className = 'hide-content';

  static create() {
    const node = super.create();
    node.classList.add('hide-content-block');
    node.setAttribute('data-hide', 'true');
    
    // 添加隐藏标签
    const label = document.createElement('span');
    label.classList.add('hide-label');
    label.textContent = '🔒 回复可见内容';
    node.appendChild(label);
    
    // 添加内容区域
    const content = document.createElement('div');
    content.classList.add('hide-content-inner');
    content.setAttribute('contenteditable', 'true');
    node.appendChild(content);
    
    return node;
  }

  static formats(node: any) {
    return node.getAttribute('data-hide') === 'true';
  }

  format(name: string, value: any) {
    if (name === 'hide-block' && value) {
      this.domNode.setAttribute('data-hide', 'true');
    } else {
      super.format(name, value);
    }
  }

  insertAt(index: number, text: string, def?: any) {
    const contentDiv = this.domNode.querySelector('.hide-content-inner');
    if (contentDiv && index === 0) {
      contentDiv.appendChild(document.createTextNode(text));
    } else {
      super.insertAt(index, text, def);
    }
  }
}

// 注册自定义格式
Quill.register('formats/hide-block', HideBlock);

// 隐藏内容工具栏功能
export const HideContentModule = {
  toolbar: {
    handlers: {
      'hide-content': function(this: any) {
        const range = this.quill.getSelection();
        if (range) {
          const text = this.quill.getText(range.index, range.length);
          
          // 如果有选中文本，将其包装为隐藏内容
          if (text.trim()) {
            this.quill.deleteText(range.index, range.length);
            this.quill.insertText(range.index, '[hide]' + text + '[/hide]');
            this.quill.setSelection(range.index + 6 + text.length + 7, 0);
          } else {
            // 如果没有选中文本，插入隐藏代码模板
            this.quill.insertText(range.index, '[hide][/hide]');
            this.quill.setSelection(range.index + 6, 0);
          }
        }
      }
    }
  }
};

// 自定义样式
export const hideContentCSS = `
.hide-content-block {
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
  background-color: #f9fafb;
  position: relative;
}

.hide-label {
  display: inline-block;
  background: #6366f1;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
}

.hide-content-inner {
  min-height: 40px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.hide-content-preview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  margin: 8px 0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.hide-content-preview:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.hide-content-preview .hide-icon {
  font-size: 24px;
  margin-bottom: 8px;
  display: block;
}

.hide-content-preview .hide-text {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.hide-content-revealed {
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
}

.hide-content-revealed .hide-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #0369a1;
  font-weight: 500;
}

.hide-content-revealed .hide-header .unlock-icon {
  margin-right: 8px;
  color: #22c55e;
}
`;

// 解析和转换隐藏内容的工具函数
export const parseHideContent = (content: string): string => {
  // 将 [hide]...[/hide] 转换为特殊的HTML结构
  return content.replace(
    /\[hide\](.*?)\[\/hide\]/gs,
    '<div class="hide-content-block" data-hide="true"><span class="hide-label">🔒 回复可见内容</span><div class="hide-content-inner">$1</div></div>'
  );
};

// 将HTML转换回隐藏代码格式
export const convertToHideCode = (html: string): string => {
  // 将隐藏内容HTML转换回 [hide]...[/hide] 格式
  return html.replace(
    /<div class="hide-content-block"[^>]*>.*?<div class="hide-content-inner">(.*?)<\/div><\/div>/gs,
    '[hide]$1[/hide]'
  );
};

// 前台显示隐藏内容的组件数据
export interface HideContentData {
  id: string;
  content: string;
  revealed: boolean;
}

// 提取隐藏内容的函数
export const extractHideContent = (content: string): { content: string; hideBlocks: HideContentData[] } => {
  const hideBlocks: HideContentData[] = [];
  let index = 0;
  
  const processedContent = content.replace(
    /\[hide\](.*?)\[\/hide\]/gs,
    (match, hiddenContent) => {
      const blockId = `hide-${Date.now()}-${index++}`;
      hideBlocks.push({
        id: blockId,
        content: hiddenContent.trim(),
        revealed: false
      });
      
      return `<div class="hide-content-preview" data-hide-id="${blockId}">
        <span class="hide-icon">🔒</span>
        <div><strong>隐藏内容</strong></div>
        <div class="hide-text">回复后可见</div>
      </div>`;
    }
  );
  
  return { content: processedContent, hideBlocks };
};

export default HideBlock;