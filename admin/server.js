#!/usr/bin/env node

// 本地Web管理界面服务器
const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const { AIContentProcessor } = require('./ai-processor');

const execAsync = promisify(exec);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// 中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

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
    GAMES: path.join(__dirname, '..', 'src', 'data', 'games.json'),
    CATEGORIES: path.join(__dirname, '..', 'src', 'data', 'categories.json'),
    PROJECT_ROOT: path.join(__dirname, '..')
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

// API路由

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
    
    if (!apiKey) {
        return res.status(400).json({
            success: false,
            error: 'API Key不能为空'
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
            apiKey, 
            model || 'Qwen/Qwen2.5-7B-Instruct', 
            3, 
            1500
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
                download_link: game.downloadLink || '#',
                published_at: new Date().toISOString().split('T')[0],
                view_count: Math.floor(Math.random() * 1000) + 100,
                download_count: Math.floor(Math.random() * 500) + 50,
                content: game.description || ''
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

// 测试API Key
app.post('/api/ai/test', async (req, res) => {
    const { apiKey, model } = req.body;
    
    if (!apiKey) {
        return res.status(400).json({
            success: false,
            error: 'API Key不能为空'
        });
    }
    
    try {
        const processor = new AIContentProcessor(apiKey, model);
        
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

// 启动服务器
app.listen(PORT, () => {
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
    if (process.platform === 'win32') {
        exec(`start http://localhost:${PORT}`);
    }
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 服务器正在关闭...');
    process.exit(0);
});

export default app;