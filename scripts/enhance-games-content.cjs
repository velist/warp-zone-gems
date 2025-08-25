#!/usr/bin/env node

// 游戏内容增强脚本 - 为24个游戏生成更丰富的内容
// 使用方式: node scripts/enhance-games-content.cjs

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  GAMES_FILE: path.join(__dirname, '..', 'src', 'data', 'games.json'),
  PUBLIC_GAMES_FILE: path.join(__dirname, '..', 'public', 'data', 'games.json'),
  BACKUP_DIR: path.join(__dirname, '..', 'backups')
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

// 创建备份
function createBackup() {
  try {
    if (!fs.existsSync(CONFIG.BACKUP_DIR)) {
      fs.mkdirSync(CONFIG.BACKUP_DIR, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(CONFIG.BACKUP_DIR, `games-backup-${timestamp}.json`);
    
    if (fs.existsSync(CONFIG.GAMES_FILE)) {
      fs.copyFileSync(CONFIG.GAMES_FILE, backupFile);
      log(`✅ 备份文件已创建: ${backupFile}`, 'green');
    }
    
    return true;
  } catch (error) {
    log(`❌ 创建备份失败: ${error.message}`, 'red');
    return false;
  }
}

// 生成增强的游戏内容
function enhanceGameContent(game) {
  const enhancedContent = generateDetailedContent(game);
  const enhancedDescription = generateEnhancedDescription(game);
  
  return {
    ...game,
    description: enhancedDescription,
    content: enhancedContent,
    // 确保所有游戏都有完整的下载链接结构
    download_links: game.download_links || [
      {
        type: "百度网盘",
        url: "https://pan.baidu.com/s/example",
        password: "game123",
        label: "高速下载"
      },
      {
        type: "天翼云盘", 
        url: "https://cloud.189.cn/example",
        password: "play456",
        label: "稳定下载"
      }
    ],
    // 确保有基本的元数据
    view_count: game.view_count || Math.floor(Math.random() * 20000) + 5000,
    download_count: game.download_count || Math.floor(Math.random() * 15000) + 3000,
    published_at: game.published_at || "2024-01-01",
    status: "published",
    created_at: game.created_at || "2024-01-01T00:00:00.000Z",
    updated_at: new Date().toISOString()
  };
}

// 生成详细的游戏内容
function generateDetailedContent(game) {
  const templates = {
    "3A游戏": {
      intro: "作为3A级别的大制作游戏，",
      features: [
        "顶级画面表现和视觉效果",
        "深度的游戏机制和丰富的内容",
        "完整的故事情节和角色发展", 
        "高品质的音效和配乐",
        "优化的用户体验"
      ]
    },
    "赛车游戏": {
      intro: "这款赛车游戏为玩家带来了",
      features: [
        "逼真的驾驶物理引擎",
        "多样化的赛道和环境",
        "丰富的车辆选择和调校系统",
        "紧张刺激的竞速体验",
        "支持多人在线竞技"
      ]
    },
    "动作游戏": {
      intro: "作为一款动作游戏，",
      features: [
        "流畅的战斗系统和连击机制",
        "多样化的技能和武器选择",
        "挑战性的敌人和Boss战",
        "精彩的动作场面设计",
        "爽快的战斗体验"
      ]
    },
    "冒险游戏": {
      intro: "这款冒险游戏将带领玩家",
      features: [
        "广阔的开放世界探索",
        "丰富的解谜元素",
        "引人入胜的故事情节",
        "多样化的环境和场景",
        "深度的角色成长系统"
      ]
    },
    "解谜游戏": {
      intro: "作为一款解谜游戏，",
      features: [
        "创新的解谜机制",
        "逐步增加的难度挑战",
        "精巧的关卡设计",
        "独特的艺术风格",
        "启发思维的游戏体验"
      ]
    }
  };
  
  const template = templates[game.category] || templates["3A游戏"];
  
  const content = `${template.intro}${game.title}${getGameSpecificContent(game)}

## 游戏特色

${template.features.map(feature => `• ${feature}`).join('\n')}

## 游戏体验

${getGameplayDescription(game)}

## 技术表现

${getTechnicalDescription(game)}

## 适合人群

${getTargetAudience(game)}

${game.content || ''}`;

  return content.trim();
}

// 获取游戏特定内容
function getGameSpecificContent(game) {
  const specificContent = {
    "赛博朋克2077": "将玩家带入了一个充满霓虹灯光和高科技的未来都市。在这个反乌托邦的世界中，科技与人性交织，每一个选择都将影响故事的走向。",
    "巫师3：狂猎": "为玩家呈现了一个充满魔法与怪物的奇幻世界。作为白狼杰洛特，玩家将踏上寻找失踪养女希里的史诗之旅。",
    "荒野大镖客：救赎2": "重现了美国西部拓荒时代的壮丽景象。玩家将跟随亚瑟·摩根体验法外之徒的传奇人生。",
    "侠盗猎车手V": "在洛圣都这座罪恶之城中展开三个主角的犯罪传奇故事。开放世界的设计让玩家可以自由探索这个充满活力的都市。",
    "艾尔登法环": "结合了《黑暗之魂》的核心玩法与开放世界的探索乐趣。在这个由乔治·R·R·马丁参与构建的幻想世界中，每一步都充满挑战。"
  };
  
  return specificContent[game.title] || `为玩家带来了独特的${game.category}体验。凭借其出色的制作水准和创新的游戏机制，成为了同类游戏中的佼佼者。`;
}

// 获取游戏玩法描述
function getGameplayDescription(game) {
  const categories = {
    "3A游戏": "游戏采用了先进的游戏引擎技术，为玩家提供了无缝的游戏体验。丰富的支线任务和探索内容确保了游戏的可重玩性。",
    "赛车游戏": "游戏提供了多种驾驶模式，从街头竞速到专业赛道，满足不同类型玩家的需求。精确的物理模拟让每一次驾驶都真实可信。",
    "动作游戏": "战斗系统设计精良，玩家可以通过不同的技能组合创造出华丽的连击效果。每个敌人都有独特的攻击模式，需要玩家仔细观察和应对。",
    "冒险游戏": "游戏世界充满了待发现的秘密和宝藏。玩家需要运用智慧解决各种谜题，同时在探索中逐步揭开故事的真相。",
    "解谜游戏": "每个谜题都经过精心设计，既有逻辑性又富有创意。游戏循序渐进地引导玩家掌握解谜技巧，带来成就感十足的游戏体验。"
  };
  
  return categories[game.category] || "游戏机制设计巧妙，为玩家提供了深度而有趣的游戏体验。";
}

// 获取技术表现描述
function getTechnicalDescription(game) {
  return `${game.title}在技术方面表现出色，无论是画面渲染、音效设计还是优化程度都达到了行业领先水平。游戏支持多种平台，确保了广泛的兼容性和稳定性。`;
}

// 获取目标受众描述
function getTargetAudience(game) {
  const audiences = {
    "3A游戏": "适合喜欢高品质游戏体验的玩家，特别是对故事情节和画面表现有较高要求的用户。",
    "赛车游戏": "适合热爱速度与激情的玩家，无论是休闲驾驶爱好者还是专业竞速玩家都能找到乐趣。",
    "动作游戏": "适合喜欢快节奏战斗和挑战的玩家，特别是享受技巧操作和战斗策略的用户。",
    "冒险游戏": "适合喜欢探索和解谜的玩家，特别是对故事情节和世界观感兴趣的用户。",
    "解谜游戏": "适合喜欢思考和挑战智力的玩家，特别是享受解决问题成就感的用户。"
  };
  
  return audiences[game.category] || "适合广大游戏爱好者，特别是对创新游戏机制感兴趣的玩家。";
}

// 生成增强的描述
function generateEnhancedDescription(game) {
  const current = game.description || '';
  
  // 如果现有描述已经比较详细，就稍作增强
  if (current.length > 50) {
    return `${current} 这款${game.category}以其出色的制作水准和创新的游戏机制，为玩家带来了难忘的游戏体验。`;
  }
  
  // 否则生成全新的描述
  const categoryDescriptions = {
    "3A游戏": "顶级制作水准的大作，融合了精彩的故事情节、出色的视觉效果和深度的游戏机制",
    "赛车游戏": "提供真实驾驶体验的竞速游戏，拥有丰富的车辆选择和多样化的赛道环境",
    "动作游戏": "节奏紧凑的动作体验，结合流畅的战斗系统和精彩的动作场面设计",
    "冒险游戏": "引人入胜的冒险之旅，在广阔的世界中探索未知，体验精彩的故事情节",
    "解谜游戏": "考验智慧的解谜挑战，通过精巧的关卡设计和创新机制带来思维的乐趣"
  };
  
  const baseDesc = categoryDescriptions[game.category] || "独特的游戏体验";
  return `${baseDesc}，为玩家呈现了一个充满魅力的${game.category}世界。`;
}

// 主函数
async function main() {
  log('\n🎮 Warp Zone Gems - 游戏内容增强工具', 'cyan');
  log('==========================================', 'cyan');
  
  // 创建备份
  log('\n💾 创建数据备份...', 'blue');
  if (!createBackup()) {
    log('❌ 备份失败，程序终止', 'red');
    process.exit(1);
  }
  
  // 读取游戏数据
  log('\n📖 读取游戏数据...', 'blue');
  let games;
  try {
    const gamesData = fs.readFileSync(CONFIG.GAMES_FILE, 'utf8');
    games = JSON.parse(gamesData);
    log(`当前游戏数量: ${games.length}`, 'yellow');
  } catch (error) {
    log(`❌ 读取游戏数据失败: ${error.message}`, 'red');
    process.exit(1);
  }
  
  // 增强游戏内容
  log('\n⚡ 开始增强游戏内容...', 'blue');
  const enhancedGames = games.map((game, index) => {
    log(`处理游戏 ${index + 1}/${games.length}: ${game.title}`, 'yellow');
    return enhanceGameContent(game);
  });
  
  // 保存增强后的数据
  log('\n💾 保存增强后的数据...', 'blue');
  try {
    // 保存到 src/data/games.json
    fs.writeFileSync(CONFIG.GAMES_FILE, JSON.stringify(enhancedGames, null, 2), 'utf8');
    log(`✅ 已保存到: ${CONFIG.GAMES_FILE}`, 'green');
    
    // 同时保存到 public/data/games.json
    fs.writeFileSync(CONFIG.PUBLIC_GAMES_FILE, JSON.stringify(enhancedGames, null, 2), 'utf8');
    log(`✅ 已保存到: ${CONFIG.PUBLIC_GAMES_FILE}`, 'green');
    
    log(`\n🎉 成功增强 ${enhancedGames.length} 个游戏的内容!`, 'green');
    
    // 显示统计信息
    log('\n📊 内容统计:', 'cyan');
    enhancedGames.forEach((game, index) => {
      log(`${index + 1}. ${game.title}`, 'white');
      log(`   描述长度: ${game.description.length} 字符`, 'yellow');
      log(`   内容长度: ${game.content.length} 字符`, 'yellow');
      log(`   下载链接: ${game.download_links ? game.download_links.length : 0} 个`, 'yellow');
    });
    
  } catch (error) {
    log(`❌ 保存数据失败: ${error.message}`, 'red');
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