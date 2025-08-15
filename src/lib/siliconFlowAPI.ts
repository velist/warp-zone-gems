// 硅基流动 AI 接口服务
// 文档: https://docs.siliconflow.cn/

interface SiliconFlowConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

interface GameGenerationRequest {
  gameName?: string;
  gameType?: string;
  keywords?: string[];
}

interface GameGenerationResponse {
  success: boolean;
  data?: {
    title: string;
    description: string;
    content: string;
    tags: string[];
    category: string;
  };
  error?: string;
}

class SiliconFlowAPI {
  private config: SiliconFlowConfig;

  constructor(config: SiliconFlowConfig) {
    this.config = {
      baseURL: config.baseURL || 'https://api.siliconflow.cn/v1',
      apiKey: config.apiKey,
      model: config.model || 'Qwen/Qwen2.5-7B-Instruct'
    };
  }

  async generateGameInfo(request: GameGenerationRequest): Promise<GameGenerationResponse> {
    try {
      const prompt = this.buildPrompt(request);
      
      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的游戏内容创作助手。请根据用户提供的信息，生成详细的游戏介绍内容。返回格式必须是有效的JSON格式。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;

      if (!content) {
        throw new Error('AI返回内容为空');
      }

      const parsedContent = JSON.parse(content);
      
      return {
        success: true,
        data: {
          title: parsedContent.title || request.gameName || '未知游戏',
          description: parsedContent.description || '',
          content: parsedContent.content || '',
          tags: parsedContent.tags || [],
          category: parsedContent.category || '其他'
        }
      };

    } catch (error) {
      console.error('AI生成失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '生成失败，请稍后重试'
      };
    }
  }

  private buildPrompt(request: GameGenerationRequest): string {
    const { gameName, gameType, keywords } = request;
    
    return `请为以下游戏生成详细的介绍信息：

游戏名称: ${gameName || '请根据描述生成合适的游戏名称'}
游戏类型: ${gameType || '请根据内容推测'}
关键词: ${keywords?.join(', ') || '无'}

请生成以下内容，并以JSON格式返回：

{
  "title": "游戏完整标题（如果未提供，请生成一个吸引人的游戏名称）",
  "description": "150字以内的游戏简介，突出游戏特色和亮点",
  "content": "500-1000字的详细游戏介绍，包括：
    - 游戏背景故事
    - 核心玩法机制
    - 游戏特色和创新点
    - 画面和音效描述
    - 适合的玩家群体
    - 游戏体验感受",
  "tags": ["标签1", "标签2", "标签3", "标签4", "标签5"]（5-8个相关标签）,
  "category": "游戏分类（从以下选择：动作冒险、角色扮演、策略游戏、休闲益智、竞速游戏、体感游戏）"
}

要求：
1. 内容要丰富详细，具有吸引力
2. 描述要生动有趣，符合游戏特色
3. 标签要准确反映游戏特点
4. 分类要准确
5. 所有内容使用中文
6. 返回标准JSON格式`;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: '请回复"连接成功"'
            }
          ],
          max_tokens: 10
        }),
      });

      if (!response.ok) {
        throw new Error(`连接失败: ${response.status} ${response.statusText}`);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '连接测试失败'
      };
    }
  }
}

// 默认配置
export const DEFAULT_SILICONFLOW_CONFIG: SiliconFlowConfig = {
  apiKey: '',
  baseURL: 'https://api.siliconflow.cn/v1',
  model: 'Qwen/Qwen2.5-7B-Instruct'
};

// 可用模型列表
export const AVAILABLE_MODELS = [
  {
    id: 'Qwen/Qwen2.5-7B-Instruct',
    name: 'Qwen2.5-7B-Instruct',
    description: '通用对话模型，平衡性能与速度'
  },
  {
    id: 'Qwen/Qwen2.5-14B-Instruct',
    name: 'Qwen2.5-14B-Instruct', 
    description: '更强大的推理能力，适合复杂任务'
  },
  {
    id: 'THUDM/glm-4-9b-chat',
    name: 'GLM-4-9B-Chat',
    description: '清华智谱AI模型，中文理解能力强'
  },
  {
    id: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    name: 'Llama-3.1-8B-Instruct',
    description: 'Meta开源模型，英文能力突出'
  }
];

// 通用内容生成函数
export async function generateContent(
  prompt: string,
  apiKey: string,
  model: string = 'Qwen/Qwen2.5-7B-Instruct'
): Promise<string> {
  const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content;

  if (!content) {
    throw new Error('AI返回内容为空');
  }

  return content;
}

// 导出API对象
export const siliconFlowAPI = {
  generateContent,
};

export { SiliconFlowAPI };
export type { SiliconFlowConfig, GameGenerationRequest, GameGenerationResponse };