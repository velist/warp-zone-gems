// AI内容处理器 - CommonJS版本
const https = require('https');
const http = require('http');

// 游戏信息接口
class GameInfo {
    constructor() {
        this.title = '';
        this.description = '';
        this.category = '';
        this.tags = [];
        this.platform = '';
        this.releaseYear = '';
        this.developer = '';
        this.publisher = '';
        this.genre = '';
        this.rating = '';
        this.downloadLink = '';
        this.coverImage = '';
    }
}

// AI内容处理器类
class AIContentProcessor {
    constructor(apiKey, model = 'Qwen/Qwen2.5-7B-Instruct', batchSize = 3, delayBetweenRequests = 1500) {
        this.apiKey = apiKey;
        this.model = model;
        this.batchSize = batchSize;
        this.delayBetweenRequests = delayBetweenRequests;
    }

    // 发送HTTP请求
    async makeRequest(url, options, data) {
        return new Promise((resolve, reject) => {
            const isHttps = url.startsWith('https:');
            const httpModule = isHttps ? https : http;
            
            const req = httpModule.request(url, options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    try {
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(JSON.parse(responseData));
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
                        }
                    } catch (error) {
                        reject(new Error(`JSON解析失败: ${error.message}`));
                    }
                });
            });
            
            req.on('error', reject);
            
            if (data) {
                req.write(JSON.stringify(data));
            }
            req.end();
        });
    }

    // Silicon Flow API调用
    async generateContent(prompt) {
        const url = 'https://api.siliconflow.cn/v1/chat/completions';
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        };
        
        const data = {
            model: this.model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 2000,
            temperature: 0.7
        };
        
        try {
            const response = await this.makeRequest(url, options, data);
            const content = response.choices?.[0]?.message?.content;
            
            if (!content) {
                throw new Error('AI返回内容为空');
            }
            
            return content;
        } catch (error) {
            throw new Error(`API请求失败: ${error.message}`);
        }
    }

    // 解析单个游戏信息
    async parseGameInfo(input) {
        const prompt = this.buildParsingPrompt(input);
        
        try {
            const response = await this.generateContent(prompt);
            return this.parseAIResponse(response);
        } catch (error) {
            throw new Error(`解析游戏信息失败: ${error.message}`);
        }
    }

    // 构建解析提示词
    buildParsingPrompt(input) {
        return `
你是一个专业的游戏信息提取专家。请从以下文本中提取游戏信息，并以JSON格式返回。

输入内容：
${input}

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
    }

    // 解析AI响应
    parseAIResponse(response) {
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
            throw new Error(`解析AI响应失败: ${error.message}`);
        }
    }

    // 验证游戏分类
    validateCategory(category) {
        const validCategories = [
            '平台跳跃', '赛车竞速', '角色扮演', 
            '派对游戏', '体感运动', '解谜益智'
        ];

        if (!category) return '平台跳跃'; // 默认分类

        const normalized = category.trim();
        return validCategories.includes(normalized) ? normalized : '平台跳跃';
    }

    // 从文本中提取游戏列表
    async extractGameList(text) {
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
            const response = await this.generateContent(prompt);
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

    // 批量处理游戏信息
    async batchProcessGames(inputs, onProgress) {
        const result = {
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
                if (onProgress) {
                    onProgress(result.processed, result.total);
                }
            });

            await Promise.all(batchPromises);

            // 批次间延迟，避免API限流
            if (i + this.batchSize < inputs.length) {
                await this.delay(this.delayBetweenRequests);
            }
        }

        return result;
    }

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 设置批处理参数
    setBatchSize(size) {
        this.batchSize = Math.max(1, Math.min(size, 10)); // 限制在1-10之间
    }

    setDelay(ms) {
        this.delayBetweenRequests = Math.max(500, ms); // 最小500ms延迟
    }
}

// 导出
module.exports = {
    AIContentProcessor,
    GameInfo
};