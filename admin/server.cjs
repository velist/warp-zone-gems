#!/usr/bin/env node

// 本地Web管理界面服务器
const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const { AIContentProcessor } = require('./ai-processor.cjs');
const multer = require('multer');
const FormData = require('form-data');
const https = require('https');

const execAsync = promisify(exec);
const currentDir = path.dirname(__filename);

// 加载配置文件
let config = {};
try {
    const configPath = path.join(currentDir, 'config.json');
    if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
} catch (error) {
    console.warn('加载配置文件失败，使用默认配置:', error.message);
    config = {
        siliconFlow: {
            apiKey: '',
            defaultModel: 'Qwen/Qwen2.5-7B-Instruct'
        },
        server: {
            port: 3001
        }
    };
}

const app = express();
const PORT = process.env.PORT || 3011;

// 配置multer用于文件上传
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('只支持图片文件'));
        }
    }
});

// 中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.static(currentDir));

// CORS支持
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// 路径配置
const DATA_PATHS = {
    GAMES: path.join(currentDir, '..', 'src', 'data', 'games.json'),
    CATEGORIES: path.join(currentDir, '..', 'src', 'data', 'categories.json'),
    BANNERS: path.join(currentDir, '..', 'src', 'data', 'banners.json'),
    POPUPS: path.join(currentDir, '..', 'src', 'data', 'popups.json'),
    FLOATING_WINDOWS: path.join(currentDir, '..', 'src', 'data', 'floating-windows.json'),
    SITE_SETTINGS: path.join(currentDir, '..', 'src', 'data', 'site-settings.json'),
    WEBSITE_CONTENT: path.join(currentDir, '..', 'src', 'data', 'website-content.json'),
    PROJECT_ROOT: path.join(currentDir, '..')
};

// 工具函数
function readJSONFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            // 如果是games.json，执行数据迁移
            if (filePath.includes('games.json') && Array.isArray(data)) {
                return migrateGamesData(data);
            }
            
            return data;
        }
        return [];
    } catch (error) {
        console.error(`读取文件失败 ${filePath}:`, error);
        return [];
    }
}

// 数据迁移函数：将旧的download_link转换为download_links数组
function migrateGamesData(games) {
    let hasChanges = false;
    
    const migratedGames = games.map(game => {
        // 如果已经有download_links但没有数据，且有download_link，则进行迁移
        if ((!game.download_links || game.download_links.length === 0) && 
            game.download_link && game.download_link !== '#') {
            hasChanges = true;
            
            return {
                ...game,
                download_links: [{
                    id: 'migrated_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    service: 'other',
                    url: game.download_link,
                    password: '',
                    label: '下载链接'
                }]
            };
        }
        
        // 确保download_links字段存在
        if (!game.download_links) {
            hasChanges = true;
            return {
                ...game,
                download_links: []
            };
        }
        
        return game;
    });
    
    // 如果有更改，保存回文件
    if (hasChanges) {
        console.log('🔄 执行游戏数据迁移...');
        writeJSONFile(DATA_PATHS.GAMES, migratedGames);
        console.log('✅ 游戏数据迁移完成');
    }
    
    return migratedGames;
}

function writeJSONFile(filePath, data) {
    try {
        // 确保目录存在
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
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
}

// 验证下载链接数据
function validateDownloadLinks(downloadLinks) {
    if (!Array.isArray(downloadLinks)) {
        return { valid: false, error: 'download_links 必须是数组' };
    }
    
    const supportedServices = ['百度网盘', '天翼云盘', '阿里云盘', '微云', '115网盘', '蓝奏云', 'other'];
    
    for (let i = 0; i < downloadLinks.length; i++) {
        const link = downloadLinks[i];
        
        if (!link.id || !link.service || !link.url) {
            return { valid: false, error: `下载链接 ${i + 1} 缺少必要字段 (id, service, url)` };
        }
        
        if (!supportedServices.includes(link.service)) {
            return { valid: false, error: `下载链接 ${i + 1} 使用了不支持的服务类型: ${link.service}` };
        }
        
        // 简单的URL验证
        try {
            new URL(link.url);
        } catch (error) {
            return { valid: false, error: `下载链接 ${i + 1} 的URL格式不正确: ${link.url}` };
        }
    }
    
    return { valid: true };
}

// API路由

// 获取配置信息
app.get('/api/config', (req, res) => {
    try {
        // 返回配置信息，但隐藏敏感的API Key
        const safeConfig = {
            siliconFlow: {
                hasApiKey: !!config.siliconFlow?.apiKey,
                defaultModel: config.siliconFlow?.defaultModel || 'Qwen/Qwen2.5-7B-Instruct',
                batchSize: config.siliconFlow?.batchSize || 3,
                delayBetweenRequests: config.siliconFlow?.delayBetweenRequests || 1500
            },
            server: {
                port: config.server?.port || 3001
            },
            app: config.app || {}
        };
        
        res.json({
            success: true,
            data: safeConfig
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取系统状态
app.get('/api/status', async (req, res) => {
    try {
        const games = readJSONFile(DATA_PATHS.GAMES);
        const categories = readJSONFile(DATA_PATHS.CATEGORIES);
        
        // 获取Node.js版本
        let nodeVersion = 'Unknown';
        try {
            const { stdout } = await execAsync('node --version');
            nodeVersion = stdout.trim();
        } catch (error) {
            console.warn('无法获取Node.js版本:', error.message);
        }
        
        // 获取Git状态
        let gitStatus = 'Unknown';
        try {
            const { stdout } = await execAsync('git status --porcelain', { cwd: DATA_PATHS.PROJECT_ROOT });
            gitStatus = stdout.trim() ? '有未提交更改' : '已同步';
        } catch (error) {
            gitStatus = '未初始化';
        }
        
        // 计算统计数据
        const totalDownloads = games.reduce((sum, game) => sum + (game.download_count || 0), 0);
        const totalViews = games.reduce((sum, game) => sum + (game.view_count || 0), 0);
        
        res.json({
            success: true,
            data: {
                gamesCount: games.length,
                categoriesCount: categories.length,
                totalDownloads,
                totalViews,
                nodeVersion,
                gitStatus,
                dataFilesExist: {
                    games: fs.existsSync(DATA_PATHS.GAMES),
                    categories: fs.existsSync(DATA_PATHS.CATEGORIES)
                }
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取数据
app.get('/api/data/:type', (req, res) => {
    const { type } = req.params;
    
    try {
        let data;
        switch (type) {
            case 'games':
                data = readJSONFile(DATA_PATHS.GAMES);
                break;
            case 'categories':
                data = readJSONFile(DATA_PATHS.CATEGORIES);
                break;
            case 'banners':
                data = readJSONFile(DATA_PATHS.BANNERS);
                break;
            case 'popups':
                data = readJSONFile(DATA_PATHS.POPUPS);
                break;
            case 'floating-windows':
                data = readJSONFile(DATA_PATHS.FLOATING_WINDOWS);
                break;
            case 'site-settings':
                data = readJSONFile(DATA_PATHS.SITE_SETTINGS);
                break;
            case 'website-content':
                data = readJSONFile(DATA_PATHS.WEBSITE_CONTENT);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: '无效的数据类型'
                });
        }
        
        res.json({
            success: true,
            data
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// AI批量处理
app.post('/api/ai/process', async (req, res) => {
    const { apiKey, model, inputText } = req.body;
    
    // 优先使用传入的API Key，其次使用配置文件中的API Key
    const finalApiKey = apiKey || config.siliconFlow?.apiKey;
    
    if (!finalApiKey) {
        return res.status(400).json({
            success: false,
            error: 'API Key不能为空，请在配置文件中设置或手动输入'
        });
    }
    
    if (!inputText) {
        return res.status(400).json({
            success: false,
            error: '输入内容不能为空'
        });
    }
    
    try {
        // 初始化AI处理器
        const processor = new AIContentProcessor(
            finalApiKey, 
            model || config.siliconFlow?.defaultModel || 'Qwen/Qwen2.5-7B-Instruct', 
            config.siliconFlow?.batchSize || 3, 
            config.siliconFlow?.delayBetweenRequests || 1500
        );
        
        // 提取游戏列表
        const gameList = await processor.extractGameList(inputText);
        
        if (gameList.length === 0) {
            return res.status(400).json({
                success: false,
                error: '未能从输入内容中提取到游戏信息'
            });
        }
        
        // 批量处理
        const result = await processor.batchProcessGames(gameList);
        
        // 读取现有数据
        const existingGames = readJSONFile(DATA_PATHS.GAMES);
        const categories = readJSONFile(DATA_PATHS.CATEGORIES);
        
        // 转换为游戏数据格式
        const newGames = result.success.map(game => {
            const baseId = generateId(game.title);
            
            // 检查ID冲突
            let finalId = baseId;
            let counter = 1;
            while (existingGames.some(g => g.id === finalId)) {
                finalId = `${baseId}-${counter}`;
                counter++;
            }
            
            return {
                id: finalId,
                title: game.title,
                description: game.description || '',
                category: game.category || '平台跳跃',
                tags: game.tags || [],
                cover_image: game.coverImage || '/placeholder.svg',
                download_link: game.downloadLink || '#', // 保持向后兼容
                download_links: game.downloadLink ? [{
                    id: 'link_' + Date.now(),
                    service: 'other',
                    url: game.downloadLink,
                    password: '',
                    label: '下载地址'
                }] : [],
                published_at: new Date().toISOString().split('T')[0],
                view_count: Math.floor(Math.random() * 1000) + 100,
                download_count: Math.floor(Math.random() * 500) + 50,
                content: game.description || '',
                status: 'draft', // AI导入的内容默认为草稿状态
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
        });
        
        // 合并数据
        const allGames = [...existingGames, ...newGames];
        
        // 更新分类统计
        const categoryStats = {};
        allGames.forEach(game => {
            categoryStats[game.category] = (categoryStats[game.category] || 0) + 1;
        });
        
        const updatedCategories = categories.map(cat => ({
            ...cat,
            games_count: categoryStats[cat.name] || 0
        }));
        
        // 保存数据
        const gamesSaved = writeJSONFile(DATA_PATHS.GAMES, allGames);
        const categoriesSaved = writeJSONFile(DATA_PATHS.CATEGORIES, updatedCategories);
        
        if (!gamesSaved || !categoriesSaved) {
            throw new Error('保存数据文件失败');
        }
        
        res.json({
            success: true,
            data: {
                processed: result.total,
                successful: result.success.length,
                failed: result.failed.length,
                newGames: newGames.length,
                totalGames: allGames.length,
                failures: result.failed
            }
        });
        
    } catch (error) {
        console.error('AI处理失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// AI优化游戏内容
app.post('/api/ai/enhance-game', async (req, res) => {
    const { gameId, title, category, currentDescription } = req.body;
    
    // 使用配置文件中的API Key
    const finalApiKey = config.siliconFlow?.apiKey;
    
    if (!finalApiKey) {
        return res.status(400).json({
            success: false,
            error: 'API Key未配置，请在配置文件中设置'
        });
    }
    
    if (!gameId || !title) {
        return res.status(400).json({
            success: false,
            error: '游戏ID和标题不能为空'
        });
    }
    
    try {
        // 初始化AI处理器
        const processor = new AIContentProcessor(
            finalApiKey, 
            config.siliconFlow?.defaultModel || 'Qwen/Qwen2.5-7B-Instruct'
        );
        
        // 使用AI优化游戏内容
        const enhancedGameInfo = await processor.parseGameInfo(`${title} - ${category}`);
        
        // 读取现有游戏数据
        const games = readJSONFile(DATA_PATHS.GAMES);
        const gameIndex = games.findIndex(game => game.id === gameId);
        
        if (gameIndex === -1) {
            return res.status(404).json({
                success: false,
                error: '游戏不存在'
            });
        }
        
        // 更新游戏信息，保留原有数据，优化描述和标签
        games[gameIndex] = {
            ...games[gameIndex],
            description: enhancedGameInfo.description || currentDescription || games[gameIndex].description,
            content: enhancedGameInfo.description || currentDescription || games[gameIndex].content,
            tags: enhancedGameInfo.tags && enhancedGameInfo.tags.length > 0 ? enhancedGameInfo.tags : games[gameIndex].tags,
            updated_at: new Date().toISOString()
        };
        
        // 保存数据
        const success = writeJSONFile(DATA_PATHS.GAMES, games);
        
        if (!success) {
            throw new Error('保存游戏数据失败');
        }
        
        res.json({
            success: true,
            data: {
                message: 'AI优化完成',
                enhancedGame: games[gameIndex],
                improvements: {
                    description: enhancedGameInfo.description ? '已优化' : '保持原样',
                    tags: enhancedGameInfo.tags && enhancedGameInfo.tags.length > 0 ? '已优化' : '保持原样'
                }
            }
        });
        
    } catch (error) {
        console.error('AI优化失败:', error);
        res.status(500).json({
            success: false,
            error: `AI优化失败: ${error.message}`
        });
    }
});

// 图片上传API
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: '没有接收到图片文件'
            });
        }

        // 使用免费的ImgBB API上传图片
        const imgbbApiKey = config.imgbb?.apiKey || 'your-imgbb-api-key-here';
        
        if (imgbbApiKey === 'your-imgbb-api-key-here') {
            // 如果没有配置ImgBB，使用本地存储
            return handleLocalImageUpload(req, res);
        }

        const formData = new FormData();
        formData.append('image', req.file.buffer.toString('base64'));

        const postData = formData.getBuffer();
        const options = {
            hostname: 'api.imgbb.com',
            port: 443,
            path: `/1/upload?key=${imgbbApiKey}`,
            method: 'POST',
            headers: {
                ...formData.getHeaders(),
                'Content-Length': postData.length
            }
        };

        const request = https.request(options, (response) => {
            let data = '';
            
            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    
                    if (result.success) {
                        res.json({
                            success: true,
                            data: {
                                url: result.data.url,
                                display_url: result.data.display_url,
                                size: result.data.size,
                                title: result.data.title
                            }
                        });
                    } else {
                        throw new Error(result.error?.message || 'ImgBB上传失败');
                    }
                } catch (error) {
                    res.status(500).json({
                        success: false,
                        error: '解析上传结果失败: ' + error.message
                    });
                }
            });
        });

        request.on('error', (error) => {
            console.error('ImgBB上传错误:', error);
            // 失败时回退到本地存储
            handleLocalImageUpload(req, res);
        });

        request.write(postData);
        request.end();

    } catch (error) {
        console.error('图片上传失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 本地图片存储处理
function handleLocalImageUpload(req, res) {
    try {
        const uploadsDir = path.join(currentDir, 'uploads');
        
        // 确保上传目录存在
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // 生成唯一文件名
        const timestamp = Date.now();
        const fileExtension = path.extname(req.file.originalname);
        const fileName = `${timestamp}${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);

        // 保存文件
        fs.writeFileSync(filePath, req.file.buffer);

        // 返回本地URL
        const imageUrl = `/uploads/${fileName}`;
        
        res.json({
            success: true,
            data: {
                url: imageUrl,
                display_url: imageUrl,
                size: req.file.size,
                title: req.file.originalname,
                local: true
            }
        });

    } catch (error) {
        console.error('本地图片保存失败:', error);
        res.status(500).json({
            success: false,
            error: '本地图片保存失败: ' + error.message
        });
    }
}

// 提供uploads目录的静态访问
app.use('/uploads', express.static(path.join(currentDir, 'uploads')));

// 测试API Key
app.post('/api/ai/test', async (req, res) => {
    const { apiKey, model } = req.body;
    
    // 优先使用传入的API Key，其次使用配置文件中的API Key
    const finalApiKey = apiKey || config.siliconFlow?.apiKey;
    
    if (!finalApiKey) {
        return res.status(400).json({
            success: false,
            error: 'API Key不能为空，请在配置文件中设置或手动输入'
        });
    }
    
    try {
        const processor = new AIContentProcessor(finalApiKey, model || config.siliconFlow?.defaultModel);
        
        // 测试简单的内容生成
        const testResult = await processor.parseGameInfo('Super Mario Bros.');
        
        res.json({
            success: true,
            data: {
                message: 'API Key测试成功',
                model: model || 'Qwen/Qwen2.5-7B-Instruct',
                testResult: testResult.title
            }
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            error: `API Key测试失败: ${error.message}`
        });
    }
});

// 保存数据
app.post('/api/data/:type', (req, res) => {
    const { type } = req.params;
    const { data } = req.body;
    
    try {
        let filePath;
        switch (type) {
            case 'games':
                filePath = DATA_PATHS.GAMES;
                break;
            case 'categories':
                filePath = DATA_PATHS.CATEGORIES;
                break;
            case 'banners':
                filePath = DATA_PATHS.BANNERS;
                break;
            case 'popups':
                filePath = DATA_PATHS.POPUPS;
                break;
            case 'floating-windows':
                filePath = DATA_PATHS.FLOATING_WINDOWS;
                break;
            case 'site-settings':
                filePath = DATA_PATHS.SITE_SETTINGS;
                break;
            case 'website-content':
                filePath = DATA_PATHS.WEBSITE_CONTENT;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: '无效的数据类型'
                });
        }
        
        const success = writeJSONFile(filePath, data);
        
        if (!success) {
            throw new Error('保存数据失败');
        }
        
        res.json({
            success: true,
            message: '数据保存成功'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 更新单个游戏
app.put('/api/games/:id', (req, res) => {
    const { id } = req.params;
    const gameData = req.body;
    
    try {
        const games = readJSONFile(DATA_PATHS.GAMES);
        const gameIndex = games.findIndex(game => game.id === id);
        
        if (gameIndex === -1) {
            return res.status(404).json({
                success: false,
                error: '游戏不存在'
            });
        }
        
        // 处理下载链接数据
        const downloadLinks = gameData.download_links || games[gameIndex].download_links || [];
        
        // 验证下载链接数据
        if (downloadLinks.length > 0) {
            const validation = validateDownloadLinks(downloadLinks);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    error: validation.error
                });
            }
        }
        
        // 更新游戏数据
        games[gameIndex] = {
            ...games[gameIndex],
            ...gameData,
            download_links: downloadLinks,
            download_link: gameData.download_link || (downloadLinks[0]?.url || games[gameIndex].download_link || '#'), // 向后兼容
            updated_at: new Date().toISOString()
        };
        
        const success = writeJSONFile(DATA_PATHS.GAMES, games);
        
        if (!success) {
            throw new Error('保存游戏数据失败');
        }
        
        res.json({
            success: true,
            data: games[gameIndex]
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 创建新游戏
app.post('/api/games', (req, res) => {
    const gameData = req.body;
    
    try {
        const games = readJSONFile(DATA_PATHS.GAMES);
        
        // 处理下载链接数据
        const downloadLinks = gameData.download_links || [];
        
        // 验证下载链接数据
        if (downloadLinks.length > 0) {
            const validation = validateDownloadLinks(downloadLinks);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    error: validation.error
                });
            }
        }
        
        const newGame = {
            id: generateId(gameData.title),
            title: gameData.title,
            description: gameData.description || '',
            category: gameData.category || '平台跳跃',
            tags: gameData.tags || [],
            cover_image: gameData.cover_image || '/placeholder.svg',
            download_link: gameData.download_link || (downloadLinks[0]?.url || '#'), // 向后兼容
            download_links: downloadLinks,
            published_at: gameData.status === 'published' ? new Date().toISOString().split('T')[0] : null,
            view_count: gameData.view_count || 0,
            download_count: gameData.download_count || 0,
            content: gameData.content || '',
            status: gameData.status || 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        games.push(newGame);
        
        const success = writeJSONFile(DATA_PATHS.GAMES, games);
        
        if (!success) {
            throw new Error('保存游戏数据失败');
        }
        
        res.json({
            success: true,
            data: newGame
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ======================== Banner管理API ========================

// 创建新Banner
app.post('/api/banners', (req, res) => {
    const bannerData = req.body;
    
    try {
        const banners = readJSONFile(DATA_PATHS.BANNERS);
        
        const newBanner = {
            id: 'banner-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            title: bannerData.title,
            description: bannerData.description || '',
            imageUrl: bannerData.imageUrl,
            linkUrl: bannerData.linkUrl || '',
            linkText: bannerData.linkText || '',
            position: bannerData.position || 'hero',
            status: bannerData.status || 'active',
            order: bannerData.order || 1,
            startDate: bannerData.startDate || '',
            endDate: bannerData.endDate || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        banners.push(newBanner);
        
        const success = writeJSONFile(DATA_PATHS.BANNERS, banners);
        
        if (!success) {
            throw new Error('保存Banner数据失败');
        }
        
        res.json({
            success: true,
            data: newBanner
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 更新Banner
app.put('/api/banners/:id', (req, res) => {
    const { id } = req.params;
    const bannerData = req.body;
    
    try {
        const banners = readJSONFile(DATA_PATHS.BANNERS);
        const bannerIndex = banners.findIndex(banner => banner.id === id);
        
        if (bannerIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Banner不存在'
            });
        }
        
        // 更新Banner数据
        banners[bannerIndex] = {
            ...banners[bannerIndex],
            ...bannerData,
            updated_at: new Date().toISOString()
        };
        
        const success = writeJSONFile(DATA_PATHS.BANNERS, banners);
        
        if (!success) {
            throw new Error('保存Banner数据失败');
        }
        
        res.json({
            success: true,
            data: banners[bannerIndex]
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 删除Banner
app.delete('/api/banners/:id', (req, res) => {
    const { id } = req.params;
    
    try {
        const banners = readJSONFile(DATA_PATHS.BANNERS);
        const filteredBanners = banners.filter(banner => banner.id !== id);
        
        if (banners.length === filteredBanners.length) {
            return res.status(404).json({
                success: false,
                error: 'Banner不存在'
            });
        }
        
        const success = writeJSONFile(DATA_PATHS.BANNERS, filteredBanners);
        
        if (!success) {
            throw new Error('删除Banner数据失败');
        }
        
        res.json({
            success: true,
            message: 'Banner删除成功'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 切换Banner状态
app.patch('/api/banners/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({
            success: false,
            error: '无效的状态值'
        });
    }
    
    try {
        const banners = readJSONFile(DATA_PATHS.BANNERS);
        const bannerIndex = banners.findIndex(banner => banner.id === id);
        
        if (bannerIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Banner不存在'
            });
        }
        
        banners[bannerIndex].status = status;
        banners[bannerIndex].updated_at = new Date().toISOString();
        
        const success = writeJSONFile(DATA_PATHS.BANNERS, banners);
        
        if (!success) {
            throw new Error('更新Banner状态失败');
        }
        
        res.json({
            success: true,
            data: banners[bannerIndex]
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 批量更新Banner顺序
app.patch('/api/banners/reorder', (req, res) => {
    const { bannerIds } = req.body;
    
    if (!Array.isArray(bannerIds)) {
        return res.status(400).json({
            success: false,
            error: 'bannerIds必须是数组'
        });
    }
    
    try {
        const banners = readJSONFile(DATA_PATHS.BANNERS);
        
        // 更新Banner顺序
        bannerIds.forEach((id, index) => {
            const bannerIndex = banners.findIndex(banner => banner.id === id);
            if (bannerIndex !== -1) {
                banners[bannerIndex].order = index + 1;
                banners[bannerIndex].updated_at = new Date().toISOString();
            }
        });
        
        const success = writeJSONFile(DATA_PATHS.BANNERS, banners);
        
        if (!success) {
            throw new Error('更新Banner顺序失败');
        }
        
        res.json({
            success: true,
            message: 'Banner顺序更新成功'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 复制Banner
app.post('/api/banners/:id/duplicate', (req, res) => {
    const { id } = req.params;
    
    try {
        const banners = readJSONFile(DATA_PATHS.BANNERS);
        const sourceBanner = banners.find(banner => banner.id === id);
        
        if (!sourceBanner) {
            return res.status(404).json({
                success: false,
                error: 'Banner不存在'
            });
        }
        
        const newBanner = {
            ...sourceBanner,
            id: 'banner-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            title: sourceBanner.title + ' (副本)',
            status: 'inactive', // 副本默认禁用
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        banners.push(newBanner);
        
        const success = writeJSONFile(DATA_PATHS.BANNERS, banners);
        
        if (!success) {
            throw new Error('复制Banner失败');
        }
        
        res.json({
            success: true,
            data: newBanner
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取Banner统计信息
app.get('/api/banners/stats', (req, res) => {
    try {
        const banners = readJSONFile(DATA_PATHS.BANNERS);
        
        const stats = {
            total: banners.length,
            active: banners.filter(b => b.status === 'active').length,
            inactive: banners.filter(b => b.status === 'inactive').length,
            byPosition: {
                hero: banners.filter(b => b.position === 'hero').length,
                sidebar: banners.filter(b => b.position === 'sidebar').length,
                content: banners.filter(b => b.position === 'content').length
            },
            scheduled: banners.filter(b => b.startDate || b.endDate).length
        };
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 删除数据项
app.delete('/api/data/:type/:id', (req, res) => {
    const { type, id } = req.params;
    
    try {
        let filePath;
        switch (type) {
            case 'games':
                filePath = DATA_PATHS.GAMES;
                break;
            case 'banners':
                filePath = DATA_PATHS.BANNERS;
                break;
            case 'popups':
                filePath = DATA_PATHS.POPUPS;
                break;
            case 'floating-windows':
                filePath = DATA_PATHS.FLOATING_WINDOWS;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: '无效的数据类型'
                });
        }
        
        const data = readJSONFile(filePath);
        const filteredData = data.filter(item => item.id !== id);
        
        if (data.length === filteredData.length) {
            return res.status(404).json({
                success: false,
                error: '未找到指定项目'
            });
        }
        
        const success = writeJSONFile(filePath, filteredData);
        
        if (!success) {
            throw new Error('删除数据失败');
        }
        
        res.json({
            success: true,
            message: '删除成功'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Git操作
app.post('/api/git/:action', async (req, res) => {
    const { action } = req.params;
    const { message } = req.body;
    
    try {
        let result;
        
        switch (action) {
            case 'status':
                result = await execAsync('git status --porcelain', { cwd: DATA_PATHS.PROJECT_ROOT });
                break;
                
            case 'commit':
                const commitMessage = message || 'AI批量导入: 更新游戏数据';
                await execAsync('git add src/data/', { cwd: DATA_PATHS.PROJECT_ROOT });
                result = await execAsync(`git commit -m "${commitMessage}"`, { cwd: DATA_PATHS.PROJECT_ROOT });
                break;
                
            case 'push':
                result = await execAsync('git push origin main', { cwd: DATA_PATHS.PROJECT_ROOT });
                break;
                
            default:
                return res.status(400).json({
                    success: false,
                    error: '无效的Git操作'
                });
        }
        
        res.json({
            success: true,
            data: {
                output: result.stdout,
                error: result.stderr
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            output: error.stdout,
            stderr: error.stderr
        });
    }
});

// 统一发布网站API - Cloudflare部署 + GitHub自动备份
app.post('/api/publish-website', async (req, res) => {
    const { message } = req.body;
    const commitMessage = message || 'Auto-publish: Update content from admin panel';
    
    try {
        // 1. 同步数据文件到public目录
        console.log('🔄 同步数据文件到public目录...');
        
        // 确保public/data目录存在
        const publicDataDir = path.join(DATA_PATHS.PROJECT_ROOT, 'public', 'data');
        if (!fs.existsSync(publicDataDir)) {
            fs.mkdirSync(publicDataDir, { recursive: true });
        }
        
        // 复制数据文件 - 确保前后端数据一致性
        const sourceFiles = [
            { source: DATA_PATHS.GAMES, target: path.join(publicDataDir, 'games.json') },
            { source: DATA_PATHS.CATEGORIES, target: path.join(publicDataDir, 'categories.json') },
            { source: DATA_PATHS.BANNERS, target: path.join(publicDataDir, 'banners.json') },
            { source: DATA_PATHS.FLOATING_WINDOWS, target: path.join(publicDataDir, 'floating-windows.json') }
        ];
        
        for (const { source, target } of sourceFiles) {
            if (fs.existsSync(source)) {
                fs.copyFileSync(source, target);
                console.log(`✅ 同步文件: ${path.basename(source)} -> public/data/`);
            } else {
                console.warn(`⚠️ 源文件不存在: ${source}`);
            }
        }
        
        console.log('✅ 数据文件同步完成');
        
        // 2. 统一发布流程：Cloudflare部署 + GitHub自动备份
        await unifiedDeployment(res, commitMessage);
        
    } catch (error) {
        console.error('发布失败:', error);
        res.status(500).json({
            success: false,
            error: `发布失败: ${error.message}`,
            details: {
                stderr: error.stderr,
                stdout: error.stdout
            }
        });
    }
});

// 统一部署函数 - Cloudflare优先 + GitHub自动备份
async function unifiedDeployment(res, commitMessage) {
    try {
        console.log('🚀 开始统一部署流程...');
        
        // 步骤1: 构建项目
        console.log('🔨 构建生产版本...');
        await execAsync('npm run build', { cwd: DATA_PATHS.PROJECT_ROOT });
        console.log('✅ 构建完成');
        
        // 步骤2: 部署到Cloudflare Pages（主要部署）
        console.log('☁️ 部署到Cloudflare Pages...');
        
        // 检查Cloudflare API Token
        const hasCloudflareToken = process.env.CLOUDFLARE_API_TOKEN;
        if (!hasCloudflareToken) {
            console.warn('⚠️ Cloudflare API Token未配置，将跳过Cloudflare部署');
        }
        
        let deployUrl = 'https://aigame.lol';
        let cloudflareSuccess = false;
        
        if (hasCloudflareToken) {
            try {
                const deployCmd = 'wrangler pages deploy dist --project-name=aigame-lol';
                const { stdout: deployOutput } = await execAsync(deployCmd, { 
                    cwd: DATA_PATHS.PROJECT_ROOT,
                    env: { ...process.env, CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN }
                });
                
                // 提取部署URL
                const urlMatch = deployOutput.match(/https:\/\/[a-f0-9]+\.aigame-lol\.pages\.dev/);
                if (urlMatch) deployUrl = urlMatch[0];
                
                console.log('✅ Cloudflare部署成功');
                cloudflareSuccess = true;
            } catch (cfError) {
                console.warn('⚠️ Cloudflare部署失败，继续GitHub备份:', cfError.message);
            }
        }
        
        // 步骤3: GitHub自动备份（同步进行，不影响部署结果）
        console.log('📦 执行GitHub代码备份...');
        let gitBackupSuccess = false;
        
        try {
            // 添加所有更改
            await execAsync('git add .', { cwd: DATA_PATHS.PROJECT_ROOT });
            
            // 检查是否有更改需要提交
            const { stdout: statusOutput } = await execAsync('git status --porcelain', { cwd: DATA_PATHS.PROJECT_ROOT });
            
            if (statusOutput.trim() !== '') {
                // 提交更改
                const fullCommitMessage = `${commitMessage}

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;
                
                await execAsync(`git commit -m "${fullCommitMessage}"`, { cwd: DATA_PATHS.PROJECT_ROOT });
                console.log('✅ 更改已提交到Git');
                
                // 推送到远程仓库（可选，不影响主要部署）
                try {
                    await execAsync('git push origin main', { cwd: DATA_PATHS.PROJECT_ROOT });
                    console.log('✅ 已推送到GitHub（代码备份）');
                    gitBackupSuccess = true;
                } catch (pushError) {
                    console.warn('⚠️ GitHub推送失败（不影响主要部署）:', pushError.message);
                }
            } else {
                console.log('📝 没有新的更改需要备份');
                gitBackupSuccess = true;
            }
        } catch (gitError) {
            console.warn('⚠️ GitHub备份失败（不影响主要部署）:', gitError.message);
        }
        
        // 返回部署结果
        const deploymentMethod = cloudflareSuccess ? 'cloudflare' : 'github-fallback';
        const isSuccess = cloudflareSuccess || gitBackupSuccess;
        
        if (isSuccess) {
            res.json({
                success: true,
                message: cloudflareSuccess ? 
                    '内容发布成功！Cloudflare Pages已更新，GitHub代码已同步备份。' : 
                    '内容已通过GitHub发布，建议配置Cloudflare以获得更好的发布体验。',
                data: {
                    hasChanges: true,
                    timestamp: new Date().toISOString(),
                    commitMessage: commitMessage.split('\n')[0],
                    deployMethod: deploymentMethod,
                    deployUrl: deployUrl,
                    websiteUrl: 'https://aigame.lol',
                    cloudflareDeployed: cloudflareSuccess,
                    githubBackup: gitBackupSuccess
                }
            });
        } else {
            throw new Error('所有部署方法都失败了');
        }
        
    } catch (error) {
        console.error('统一部署失败:', error);
        throw new Error(`统一部署失败: ${error.message}`);
    }
}

// 获取发布状态
app.get('/api/publish-status', async (req, res) => {
    try {
        // 获取最后一次提交信息
        const { stdout: lastCommit } = await execAsync('git log -1 --format="%H|%ai|%s"', { cwd: DATA_PATHS.PROJECT_ROOT });
        const [hash, date, subject] = lastCommit.trim().split('|');
        
        // 检查是否有未提交的更改
        const { stdout: statusOutput } = await execAsync('git status --porcelain', { cwd: DATA_PATHS.PROJECT_ROOT });
        const hasUncommittedChanges = statusOutput.trim() !== '';
        
        res.json({
            success: true,
            data: {
                lastCommit: {
                    hash: hash.substring(0, 7),
                    date: new Date(date).toLocaleString('zh-CN'),
                    subject: subject
                },
                hasUncommittedChanges,
                websiteUrl: 'https://aigame.lol',
                status: hasUncommittedChanges ? 'pending' : 'published'
            }
        });
        
    } catch (error) {
        console.error('获取发布状态失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 启动服务器
const server = app.listen(PORT, () => {
    console.log(`
🎮 Warp Zone Gems 本地管理后台已启动
==========================================

📍 管理界面: http://localhost:${PORT}
📂 数据目录: ${path.relative(process.cwd(), path.dirname(DATA_PATHS.GAMES))}
🔧 项目根目录: ${DATA_PATHS.PROJECT_ROOT}

功能特性:
✅ AI批量导入游戏信息
✅ 实时数据统计
✅ 本地文件管理  
✅ Git版本控制
✅ 可视化操作界面

使用说明:
1. 在浏览器中打开管理界面
2. 配置Silicon Flow API Key
3. 输入游戏信息进行批量导入
4. 查看处理结果并提交到Git

按 Ctrl+C 停止服务器
    `);
    
    // 自动打开浏览器（可选）
    setTimeout(() => {
        if (process.platform === 'win32') {
            exec(`start http://localhost:${PORT}`, (error) => {
                if (error) {
                    console.log('请手动打开浏览器访问: http://localhost:' + PORT);
                }
            });
        }
    }, 1000);
});

// 保持服务器运行
server.on('error', (error) => {
    console.error('服务器错误:', error);
    if (error.code === 'EADDRINUSE') {
        console.log(`端口 ${PORT} 已被占用，请检查是否有其他进程在使用该端口`);
    }
});

server.on('close', () => {
    console.log('服务器已关闭');
});

// 确保服务器保持运行
setInterval(() => {
    // 每30秒输出一次心跳
    // console.log('服务器运行正常...');
}, 30000);

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 服务器正在关闭...');
    process.exit(0);
});

// 保持进程运行
process.on('exit', (code) => {
    console.log(`进程退出，退出码: ${code}`);
});

// 错误处理
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
});