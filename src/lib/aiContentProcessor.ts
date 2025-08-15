// AI 批量内容处理系统
import { siliconFlowAPI } from './siliconFlowAPI';

// 游戏信息接口
export interface GameInfo {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  platform?: string;
  releaseYear?: string;
  developer?: string;
  publisher?: string;
  genre?: string;
  rating?: string;
  downloadLink?: string;
  coverImage?: string;
}

// 批量处理结果接口
export interface BatchProcessResult {
  success: GameInfo[];
  failed: { input: string; error: string }[];
  total: number;
  processed: number;
}

// 内容识别模式
export enum ContentRecognitionMode {
  TITLE_ONLY = 'title_only',           // 仅标题
  TITLE_WITH_DESCRIPTION = 'title_desc', // 标题+描述
  FULL_GAME_INFO = 'full_info',        // 完整游戏信息
  MIXED_CONTENT = 'mixed_content'       // 混合内容
}

// AI 内容处理器类
export class AIContentProcessor {
  private apiKey: string;
  private model: string;
  private batchSize: number;
  private delayBetweenRequests: number;

  constructor(
    apiKey: string, 
    model: string = 'Qwen/Qwen2.5-7B-Instruct',
    batchSize: number = 5,
    delayBetweenRequests: number = 1000
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.batchSize = batchSize;
    this.delayBetweenRequests = delayBetweenRequests;
  }

  // 智能识别内容类型
  async recognizeContentType(input: string): Promise<ContentRecognitionMode> {
    const prompt = `
分析以下文本内容，判断它是什么类型的游戏信息：

文本内容：
${input}

请返回以下类型之一：
- title_only: 仅包含游戏标题
- title_desc: 包含标题和简单描述
- full_info: 包含完整的游戏信息（标题、描述、分类、标签等）
- mixed_content: 混合内容或格式不规范

只返回类型标识符，不要其他内容。
`;

    try {
      const response = await siliconFlowAPI.generateContent(
        prompt,
        this.apiKey,
        this.model
      );

      const result = response.trim().toLowerCase();
      
      if (result.includes('title_only')) return ContentRecognitionMode.TITLE_ONLY;
      if (result.includes('title_desc')) return ContentRecognitionMode.TITLE_WITH_DESCRIPTION;
      if (result.includes('full_info')) return ContentRecognitionMode.FULL_GAME_INFO;
      
      return ContentRecognitionMode.MIXED_CONTENT;
    } catch (error) {
      console.warn('Content recognition failed, using mixed_content mode:', error);
      return ContentRecognitionMode.MIXED_CONTENT;
    }
  }

  // 解析单个游戏信息
  async parseGameInfo(input: string, mode?: ContentRecognitionMode): Promise<GameInfo> {
    // 如果没有指定模式，自动识别
    if (!mode) {
      mode = await this.recognizeContentType(input);
    }

    const prompt = this.buildParsingPrompt(input, mode);
    
    try {
      const response = await siliconFlowAPI.generateContent(
        prompt,
        this.apiKey,
        this.model
      );

      return this.parseAIResponse(response);
    } catch (error) {
      throw new Error(`Failed to parse game info: ${error}`);
    }
  }

  // 构建解析提示词
  private buildParsingPrompt(input: string, mode: ContentRecognitionMode): string {
    const basePrompt = `
你是一个专业的游戏信息提取专家。请从以下文本中提取游戏信息，并以JSON格式返回。

输入内容：
${input}

`;

    const formatInstructions = `
请返回标准的JSON格式，包含以下字段（如果信息不存在则设为null）：
{
  "title": "游戏标题",
  "description": "游戏描述",
  "category": "游戏分类（平台跳跃/赛车竞速/角色扮演/派对游戏/体感运动/解谜益智）",
  "tags": ["标签1", "标签2"],
  "platform": "游戏平台",
  "releaseYear": "发布年份",
  "developer": "开发商",
  "publisher": "发行商",
  "genre": "游戏类型",
  "rating": "游戏评分",
  "downloadLink": null,
  "coverImage": null
}

注意事项：
1. 标题必须准确提取，不要添加额外内容
2. 分类必须从给定的6个分类中选择最合适的一个
3. 标签应该是简洁的关键词，最多5个
4. 如果是马里奥相关游戏，请在标签中包含"马里奥"
5. 只返回JSON，不要其他解释文字
`;

    switch (mode) {
      case ContentRecognitionMode.TITLE_ONLY:
        return basePrompt + `
这是一个游戏标题，请基于标题推测游戏信息。如果是知名游戏，请填入你了解的信息。
` + formatInstructions;

      case ContentRecognitionMode.TITLE_WITH_DESCRIPTION:
        return basePrompt + `
这包含游戏标题和描述信息，请提取并补充相关信息。
` + formatInstructions;

      case ContentRecognitionMode.FULL_GAME_INFO:
        return basePrompt + `
这是完整的游戏信息，请提取所有可用的字段。
` + formatInstructions;

      case ContentRecognitionMode.MIXED_CONTENT:
      default:
        return basePrompt + `
这是混合格式的内容，请尽力提取游戏相关信息。可能包含多个游戏或格式不规范的内容。
` + formatInstructions;
    }
  }

  // 解析AI响应
  private parseAIResponse(response: string): GameInfo {
    try {
      // 清理响应，提取JSON部分
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      // 验证和清理数据
      return {
        title: parsed.title || 'Unknown Game',
        description: parsed.description || null,
        category: this.validateCategory(parsed.category),
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
        platform: parsed.platform || null,
        releaseYear: parsed.releaseYear || null,
        developer: parsed.developer || null,
        publisher: parsed.publisher || null,
        genre: parsed.genre || null,
        rating: parsed.rating || null,
        downloadLink: parsed.downloadLink || null,
        coverImage: parsed.coverImage || null,
      };
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error}`);
    }
  }

  // 验证游戏分类
  private validateCategory(category: string | null): string {
    const validCategories = [
      '平台跳跃', '赛车竞速', '角色扮演', 
      '派对游戏', '体感运动', '解谜益智'
    ];

    if (!category) return '平台跳跃'; // 默认分类

    const normalized = category.trim();
    return validCategories.includes(normalized) ? normalized : '平台跳跃';
  }

  // 批量处理游戏信息
  async batchProcessGames(
    inputs: string[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<BatchProcessResult> {
    const result: BatchProcessResult = {
      success: [],
      failed: [],
      total: inputs.length,
      processed: 0
    };

    // 分批处理
    for (let i = 0; i < inputs.length; i += this.batchSize) {
      const batch = inputs.slice(i, i + this.batchSize);
      
      // 并行处理当前批次
      const batchPromises = batch.map(async (input, index) => {
        try {
          const gameInfo = await this.parseGameInfo(input);
          result.success.push(gameInfo);
        } catch (error) {
          result.failed.push({
            input,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
        
        result.processed++;
        onProgress?.(result.processed, result.total);
      });

      await Promise.all(batchPromises);

      // 批次间延迟，避免API限流
      if (i + this.batchSize < inputs.length) {
        await this.delay(this.delayBetweenRequests);
      }
    }

    return result;
  }

  // 从文本中提取游戏列表
  async extractGameList(text: string): Promise<string[]> {
    const prompt = `
请从以下文本中提取所有游戏相关的信息，每个游戏占一行。

文本内容：
${text}

要求：
1. 每行一个游戏信息
2. 保持原始格式和内容
3. 忽略非游戏相关的内容
4. 如果有重复的游戏，只保留一个
5. 按出现顺序排列

直接返回游戏列表，每行一个，不要其他解释。
`;

    try {
      const response = await siliconFlowAPI.generateContent(
        prompt,
        this.apiKey,
        this.model
      );

      return response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    } catch (error) {
      // 如果AI提取失败，使用简单的文本分割
      return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }
  }

  // 生成游戏详细内容
  async generateGameContent(gameInfo: GameInfo): Promise<string> {
    const prompt = `
基于以下游戏信息，生成一篇详细的游戏介绍文章：

游戏信息：
- 标题：${gameInfo.title}
- 描述：${gameInfo.description || '无'}
- 分类：${gameInfo.category}
- 标签：${gameInfo.tags?.join(', ') || '无'}
- 平台：${gameInfo.platform || '无'}
- 发布年份：${gameInfo.releaseYear || '无'}
- 开发商：${gameInfo.developer || '无'}

请生成一篇800-1200字的游戏介绍文章，包含：
1. 游戏概述
2. 游戏特色
3. 玩法介绍
4. 游戏亮点
5. 推荐理由

文章要求：
- 语言生动有趣
- 突出游戏特色
- 适合马里奥游戏爱好者阅读
- 使用HTML格式，包含适当的标题和段落标签
`;

    try {
      return await siliconFlowAPI.generateContent(
        prompt,
        this.apiKey,
        this.model
      );
    } catch (error) {
      throw new Error(`Failed to generate game content: ${error}`);
    }
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 设置批处理参数
  setBatchSize(size: number) {
    this.batchSize = Math.max(1, Math.min(size, 10)); // 限制在1-10之间
  }

  setDelay(ms: number) {
    this.delayBetweenRequests = Math.max(500, ms); // 最小500ms延迟
  }
}

// 导出默认实例创建函数
export function createAIContentProcessor(
  apiKey: string,
  model?: string,
  batchSize?: number,
  delay?: number
): AIContentProcessor {
  return new AIContentProcessor(apiKey, model, batchSize, delay);
}

// 导出工具函数
export const aiContentUtils = {
  // 验证游戏信息完整性
  validateGameInfo(gameInfo: GameInfo): { isValid: boolean; missingFields: string[] } {
    const requiredFields = ['title'];
    const recommendedFields = ['description', 'category', 'tags'];
    
    const missingRequired = requiredFields.filter(field => !gameInfo[field as keyof GameInfo]);
    const missingRecommended = recommendedFields.filter(field => !gameInfo[field as keyof GameInfo]);
    
    return {
      isValid: missingRequired.length === 0,
      missingFields: [...missingRequired, ...missingRecommended]
    };
  },

  // 合并游戏信息
  mergeGameInfo(base: GameInfo, update: Partial<GameInfo>): GameInfo {
    return {
      ...base,
      ...Object.fromEntries(
        Object.entries(update).filter(([_, value]) => value != null)
      )
    };
  },

  // 格式化游戏标签
  formatTags(tags: string[]): string[] {
    return tags
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 5); // 最多5个标签
  }
};