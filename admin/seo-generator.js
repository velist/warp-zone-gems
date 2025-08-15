#!/usr/bin/env node

// SEO内容自动生成器
const path = require('path');
const fs = require('fs');
const { AIContentProcessor } = require('./ai-processor.cjs');

// 配置
const config = {
    siliconFlow: {
        apiKey: process.env.SILICON_FLOW_API_KEY,
        defaultModel: 'Qwen/Qwen2.5-7B-Instruct',
        batchSize: 5,
        delayBetweenRequests: 2000
    }
};

// 数据路径
const DATA_PATHS = {
    GAMES: path.join(__dirname, '..', 'src', 'data', 'games.json'),
    SEO_ARTICLES: path.join(__dirname, '..', 'src', 'data', 'seo-articles.json'),
    CATEGORIES: path.join(__dirname, '..', 'src', 'data', 'categories.json')
};

// 工具函数
function readJSONFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        return [];
    } catch (error) {
        console.error(`读取文件失败 ${filePath}:`, error);
        return [];
    }
}

function writeJSONFile(filePath, data) {
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`写入文件失败 ${filePath}:`, error);
        return false;
    }
}

function generateId(title) {
    return title
        .toLowerCase()
        .replace(/[^\\w\\u4e00-\\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
}

// 国内外热门游戏列表
const POPULAR_GAMES = [
    // 国外经典游戏
    "The Legend of Zelda: Breath of the Wild",
    "Grand Theft Auto V",
    "Minecraft",
    "The Witcher 3: Wild Hunt",
    "Red Dead Redemption 2",
    "Cyberpunk 2077",
    "God of War",
    "Horizon Zero Dawn",
    "Assassin's Creed Valhalla",
    "Call of Duty: Modern Warfare",
    "FIFA 2024",
    "Elden Ring",
    "Sekiro: Shadows Die Twice",
    "Death Stranding",
    "Spider-Man Remastered",
    "Hogwarts Legacy",
    "Baldur's Gate 3",
    "Starfield",
    "Diablo IV",
    "Street Fighter 6",
    
    // 国内热门游戏
    "原神",
    "王者荣耀",
    "和平精英",
    "明日方舟",
    "崩坏：星穹铁道",
    "第五人格",
    "梦幻西游",
    "阴阳师",
    "完美世界",
    "剑网3",
    "天涯明月刀",
    "逆水寒",
    "三国杀",
    "炉石传说",
    "英雄联盟",
    "守望先锋2",
    "DOTA2",
    "CS2",
    "绝地求生",
    "最终幻想14",
    
    // 经典单机游戏
    "魔兽世界",
    "暗黑破坏神2",
    "星际争霸2",
    "文明6",
    "全面战争：战锤3",
    "刺客信条：奥德赛",
    "孤岛危机3",
    "生化危机4",
    "寂静岭2",
    "塞尔达传说：王国之泪"
];

// SEO文章模板
const ARTICLE_TEMPLATES = [
    {
        type: 'game_review',
        title: '{game} 完整评测：游戏特色、玩法攻略与下载指南',
        description: '深度评测 {game}，包含游戏特色分析、详细玩法攻略、系统需求说明以及完整下载指南。',
        keywords: '{game}, {game}下载, {game}攻略, {game}评测, 单机游戏'
    },
    {
        type: 'download_guide',
        title: '{game} 免费下载安装教程 - 完整版游戏资源',
        description: '{game} 最新版本免费下载，详细安装步骤，包含游戏补丁、汉化包和修复工具。',
        keywords: '{game}下载, {game}安装, {game}免费, {game}完整版, 游戏下载'
    },
    {
        type: 'gameplay_tips',
        title: '{game} 新手攻略：从入门到精通的完整指南',
        description: '{game} 全面攻略指南，包含新手教程、进阶技巧、隐藏要素发现和通关心得分享。',
        keywords: '{game}攻略, {game}技巧, {game}新手, {game}教程, 游戏攻略'
    },
    {
        type: 'comparison',
        title: '{game} vs 同类游戏对比：哪款更值得玩？',
        description: '详细对比 {game} 与同类型游戏的优缺点，帮助玩家选择最适合的游戏体验。',
        keywords: '{game}对比, {game}评价, 游戏推荐, {game}优缺点, 游戏选择'
    },
    {
        type: 'system_requirements',
        title: '{game} 系统配置要求详解 - 能否流畅运行？',
        description: '{game} 最低和推荐系统配置需求分析，包含性能优化建议和硬件升级方案。',
        keywords: '{game}配置, {game}系统要求, {game}优化, 游戏配置, 硬件需求'
    }
];

// 主要执行函数
async function generateSEOContent() {
    console.log('🚀 开始生成SEO内容...');
    
    if (!config.siliconFlow.apiKey) {
        console.error('❌ Silicon Flow API Key未配置');
        return;
    }
    
    try {
        // 初始化AI处理器
        const processor = new AIContentProcessor(
            config.siliconFlow.apiKey,
            config.siliconFlow.defaultModel,
            config.siliconFlow.batchSize,
            config.siliconFlow.delayBetweenRequests
        );
        
        // 读取现有数据
        const existingGames = readJSONFile(DATA_PATHS.GAMES);
        const existingSEOArticles = readJSONFile(DATA_PATHS.SEO_ARTICLES);
        const categories = readJSONFile(DATA_PATHS.CATEGORIES);
        
        console.log(`📊 当前游戏数量: ${existingGames.length}`);
        console.log(`📊 现有SEO文章: ${existingSEOArticles.length}`);
        
        // 随机选择游戏进行内容生成
        const gamesToProcess = selectRandomGames(POPULAR_GAMES, 3);
        console.log(`🎮 选中游戏: ${gamesToProcess.join(', ')}`);
        
        const newGames = [];
        const newArticles = [];
        
        // 处理每个游戏
        for (const gameName of gamesToProcess) {
            console.log(`\\n🎯 处理游戏: ${gameName}`);
            
            try {
                // 生成游戏信息
                const gameInfo = await processor.parseGameInfo(gameName);
                
                if (gameInfo && gameInfo.title) {
                    // 检查是否已存在
                    const gameId = generateId(gameInfo.title);
                    const existingGame = existingGames.find(g => g.id === gameId);
                    
                    if (!existingGame) {
                        // 创建新游戏条目
                        const newGame = {
                            id: gameId,
                            title: gameInfo.title,
                            description: gameInfo.description || '',
                            category: gameInfo.category || '动作冒险',
                            tags: gameInfo.tags || [],
                            cover_image: '/placeholder.svg',
                            download_link: '#',
                            published_at: new Date().toISOString().split('T')[0],
                            view_count: Math.floor(Math.random() * 5000) + 1000,
                            download_count: Math.floor(Math.random() * 2000) + 500,
                            content: gameInfo.description || '',
                            status: 'published',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            seo_generated: true
                        };
                        
                        newGames.push(newGame);
                        console.log(`✅ 新增游戏: ${gameInfo.title}`);
                    }
                    
                    // 生成SEO文章
                    const template = ARTICLE_TEMPLATES[Math.floor(Math.random() * ARTICLE_TEMPLATES.length)];
                    const articleTitle = template.title.replace(/\\{game\\}/g, gameInfo.title);
                    const articleId = generateId(articleTitle);
                    
                    // 检查文章是否已存在
                    const existingArticle = existingSEOArticles.find(a => a.id === articleId);
                    
                    if (!existingArticle) {
                        // 生成文章内容
                        const articlePrompt = `请为游戏"${gameInfo.title}"写一篇${getTypeDescription(template.type)}。要求：
1. 内容丰富，至少500字
2. 包含游戏特色介绍
3. 提供实用的游戏信息
4. 语言生动有趣，适合中文读者
5. 结构清晰，分段合理`;

                        const articleContent = await generateArticleContent(processor, articlePrompt);
                        
                        if (articleContent) {
                            const newArticle = {
                                id: articleId,
                                title: articleTitle,
                                description: template.description.replace(/\\{game\\}/g, gameInfo.title),
                                content: articleContent,
                                keywords: template.keywords.replace(/\\{game\\}/g, gameInfo.title),
                                game_id: gameId,
                                type: template.type,
                                published_at: new Date().toISOString().split('T')[0],
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                                view_count: Math.floor(Math.random() * 1000) + 100,
                                seo_score: Math.floor(Math.random() * 20) + 80
                            };
                            
                            newArticles.push(newArticle);
                            console.log(`📝 新增SEO文章: ${articleTitle}`);
                        }
                    }
                    
                    // 请求间隔
                    await new Promise(resolve => setTimeout(resolve, config.siliconFlow.delayBetweenRequests));
                    
                } else {
                    console.log(`❌ 无法获取游戏信息: ${gameName}`);
                }
                
            } catch (error) {
                console.error(`❌ 处理游戏失败 ${gameName}:`, error.message);
                continue;
            }
        }
        
        // 保存新数据
        if (newGames.length > 0) {
            const allGames = [...existingGames, ...newGames];
            writeJSONFile(DATA_PATHS.GAMES, allGames);
            console.log(`\\n✅ 新增 ${newGames.length} 个游戏条目`);
        }
        
        if (newArticles.length > 0) {
            const allArticles = [...existingSEOArticles, ...newArticles];
            writeJSONFile(DATA_PATHS.SEO_ARTICLES, allArticles);
            console.log(`✅ 新增 ${newArticles.length} 篇SEO文章`);
        }
        
        console.log('\\n🎉 SEO内容生成完成！');
        
        // 输出统计信息
        console.log(`📊 统计信息:`);
        console.log(`   - 新增游戏: ${newGames.length}`);
        console.log(`   - 新增文章: ${newArticles.length}`);
        console.log(`   - 总游戏数: ${existingGames.length + newGames.length}`);
        console.log(`   - 总文章数: ${existingSEOArticles.length + newArticles.length}`);
        
    } catch (error) {
        console.error('❌ SEO内容生成失败:', error);
        process.exit(1);
    }
}

// 辅助函数
function selectRandomGames(gameList, count) {
    const shuffled = [...gameList].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getTypeDescription(type) {
    const descriptions = {
        'game_review': '游戏评测文章',
        'download_guide': '下载安装指南',
        'gameplay_tips': '游戏攻略教程',
        'comparison': '游戏对比分析',
        'system_requirements': '系统配置需求说明'
    };
    return descriptions[type] || '游戏相关文章';
}

async function generateArticleContent(processor, prompt) {
    try {
        // 使用AI生成文章内容
        const result = await processor.parseGameInfo(prompt);
        return result.description || '';
    } catch (error) {
        console.error('生成文章内容失败:', error);
        return '';
    }
}

// 执行主函数
if (require.main === module) {
    generateSEOContent().catch(error => {
        console.error('程序执行失败:', error);
        process.exit(1);
    });
}

module.exports = {
    generateSEOContent
};