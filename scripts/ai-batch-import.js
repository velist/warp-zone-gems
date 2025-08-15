#!/usr/bin/env node

// AI批量导入工具 - 静态网站版本
// 使用方式: node scripts/ai-batch-import.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createAIContentProcessor } from '../src/lib/aiContentProcessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const CONFIG = {
  GAMES_FILE: path.join(__dirname, '..', 'src', 'data', 'games.json'),
  CATEGORIES_FILE: path.join(__dirname, '..', 'src', 'data', 'categories.json'),
  API_KEY: process.env.SILICON_FLOW_API_KEY,
  MODEL: process.env.AI_MODEL || 'Qwen/Qwen2.5-7B-Instruct'
};

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查API Key
function checkApiKey() {
  if (!CONFIG.API_KEY) {
    log('\n❌ 错误: 未找到 SILICON_FLOW_API_KEY 环境变量', 'red');
    log('\n请按以下方式设置API Key:', 'yellow');
    log('Windows: set SILICON_FLOW_API_KEY=your_api_key_here');
    log('Linux/Mac: export SILICON_FLOW_API_KEY=your_api_key_here');
    log('\n或创建 .env 文件并添加:', 'yellow');
    log('SILICON_FLOW_API_KEY=your_api_key_here');
    process.exit(1);
  }
}

// 读取现有数据
function loadExistingData() {
  try {
    const gamesData = fs.existsSync(CONFIG.GAMES_FILE) 
      ? JSON.parse(fs.readFileSync(CONFIG.GAMES_FILE, 'utf8'))
      : [];
    
    const categoriesData = fs.existsSync(CONFIG.CATEGORIES_FILE)
      ? JSON.parse(fs.readFileSync(CONFIG.CATEGORIES_FILE, 'utf8'))
      : [];
    
    return { games: gamesData, categories: categoriesData };
  } catch (error) {
    log(`❌ 读取现有数据失败: ${error.message}`, 'red');
    return { games: [], categories: [] };
  }
}

// 保存数据到JSON文件
function saveData(games, categories) {
  try {
    // 确保目录存在
    const dataDir = path.dirname(CONFIG.GAMES_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // 保存游戏数据
    fs.writeFileSync(CONFIG.GAMES_FILE, JSON.stringify(games, null, 2), 'utf8');
    log(`✅ 游戏数据已保存到: ${CONFIG.GAMES_FILE}`, 'green');
    
    // 更新分类统计
    const categoryStats = {};
    games.forEach(game => {
      categoryStats[game.category] = (categoryStats[game.category] || 0) + 1;
    });
    
    const updatedCategories = categories.map(cat => ({
      ...cat,
      games_count: categoryStats[cat.name] || 0
    }));
    
    fs.writeFileSync(CONFIG.CATEGORIES_FILE, JSON.stringify(updatedCategories, null, 2), 'utf8');
    log(`✅ 分类数据已保存到: ${CONFIG.CATEGORIES_FILE}`, 'green');
    
    return true;
  } catch (error) {
    log(`❌ 保存数据失败: ${error.message}`, 'red');
    return false;
  }
}

// 生成唯一ID
function generateId(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

// 交互式输入
async function promptInput(question) {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// 主函数
async function main() {
  log('\n🎮 Warp Zone Gems - AI批量导入工具', 'cyan');
  log('==========================================', 'cyan');
  
  // 检查API Key
  checkApiKey();
  
  // 读取现有数据
  log('\n📖 读取现有数据...', 'blue');
  const { games: existingGames, categories } = loadExistingData();
  log(`当前游戏数量: ${existingGames.length}`, 'yellow');
  
  // 输入方式选择
  log('\n请选择输入方式:', 'yellow');
  log('1. 手动输入游戏信息');
  log('2. 从文件读取');
  log('3. 交互式批量输入');
  
  const inputMode = await promptInput('\n请输入选项 (1-3): ');
  
  let inputText = '';
  
  switch (inputMode) {
    case '1':
      inputText = await promptInput('\n请输入游戏信息 (支持多行，按回车结束):\n');
      break;
      
    case '2':
      const filePath = await promptInput('请输入文件路径: ');
      if (fs.existsSync(filePath)) {
        inputText = fs.readFileSync(filePath, 'utf8');
        log(`✅ 从文件读取 ${inputText.length} 个字符`, 'green');
      } else {
        log('❌ 文件不存在', 'red');
        process.exit(1);
      }
      break;
      
    case '3':
      log('\n进入交互模式 (输入空行结束):');
      const lines = [];
      while (true) {
        const line = await promptInput('> ');
        if (!line) break;
        lines.push(line);
      }
      inputText = lines.join('\n');
      break;
      
    default:
      log('❌ 无效选项', 'red');
      process.exit(1);
  }
  
  if (!inputText.trim()) {
    log('❌ 输入内容为空', 'red');
    process.exit(1);
  }
  
  // 初始化AI处理器
  log('\n🤖 初始化AI处理器...', 'blue');
  const processor = createAIContentProcessor(CONFIG.API_KEY, CONFIG.MODEL, 3, 1500);
  
  try {
    // 提取游戏列表
    log('🔍 提取游戏信息...', 'blue');
    const gameList = await processor.extractGameList(inputText);
    log(`发现 ${gameList.length} 个游戏`, 'yellow');
    
    if (gameList.length === 0) {
      log('❌ 未能从输入内容中提取到游戏信息', 'red');
      process.exit(1);
    }
    
    // 确认处理
    const confirm = await promptInput(`\n确认处理 ${gameList.length} 个游戏? (y/n): `);
    if (confirm.toLowerCase() !== 'y') {
      log('❌ 用户取消操作', 'yellow');
      process.exit(0);
    }
    
    // 批量处理
    log('\n⚡ 开始AI批量处理...', 'blue');
    const result = await processor.batchProcessGames(
      gameList,
      (processed, total) => {
        const progress = Math.round((processed / total) * 100);
        process.stdout.write(`\r进度: ${progress}% (${processed}/${total})`);
      }
    );
    
    console.log(); // 换行
    
    log(`\n✅ 处理完成! 成功: ${result.success.length}, 失败: ${result.failed.length}`, 'green');
    
    // 显示失败项目
    if (result.failed.length > 0) {
      log('\n❌ 失败项目:', 'red');
      result.failed.forEach((failure, index) => {
        log(`${index + 1}. ${failure.input.substring(0, 50)}...`, 'red');
        log(`   错误: ${failure.error}`, 'red');
      });
    }
    
    if (result.success.length === 0) {
      log('❌ 没有成功处理的游戏', 'red');
      process.exit(1);
    }
    
    // 转换为游戏数据格式
    const newGames = result.success.map(game => {
      const id = generateId(game.title);
      
      // 检查ID冲突
      let finalId = id;
      let counter = 1;
      while (existingGames.some(g => g.id === finalId)) {
        finalId = `${id}-${counter}`;
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
        view_count: Math.floor(Math.random() * 1000) + 100, // 随机视图数
        download_count: Math.floor(Math.random() * 500) + 50, // 随机下载数
        content: game.description || ''
      };
    });
    
    // 合并数据
    const allGames = [...existingGames, ...newGames];
    
    // 保存数据
    log('\n💾 保存数据...', 'blue');
    if (saveData(allGames, categories)) {
      log(`\n🎉 成功导入 ${newGames.length} 个游戏!`, 'green');
      log(`总游戏数量: ${allGames.length}`, 'yellow');
      
      // Git提交建议
      log('\n📝 建议执行以下Git命令提交更改:', 'cyan');
      log('git add src/data/');
      log('git commit -m "AI批量导入: 新增游戏数据"');
      log('git push origin main');
    }
    
  } catch (error) {
    log(`\n❌ 处理失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 错误处理
process.on('unhandledRejection', (error) => {
  log(`\n❌ 未处理的错误: ${error.message}`, 'red');
  process.exit(1);
});

// 运行主函数
main().catch(console.error);