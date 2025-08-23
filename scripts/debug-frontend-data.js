#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 读取前端游戏数据
const gamesDataPath = path.join(__dirname, '../public/data/games.json');

function debugFrontendData() {
  console.log('🔍 正在分析前端游戏数据结构...\n');
  
  try {
    // 1. 检查文件是否存在
    if (!fs.existsSync(gamesDataPath)) {
      console.error('❌ 游戏数据文件不存在：', gamesDataPath);
      return;
    }
    console.log('✅ 游戏数据文件存在：', gamesDataPath);
    
    // 2. 读取并解析JSON数据
    const rawData = fs.readFileSync(gamesDataPath, 'utf8');
    const gamesData = JSON.parse(rawData);
    
    console.log(`📊 总游戏数量：${gamesData.length}`);
    
    if (gamesData.length === 0) {
      console.log('⚠️ 游戏数据为空');
      return;
    }
    
    // 3. 分析第一个游戏的字段结构
    const firstGame = gamesData[0];
    console.log('\n📋 第一个游戏的字段结构：');
    console.log('字段名称 | 类型 | 示例值');
    console.log('-------|------|------');
    
    Object.entries(firstGame).forEach(([key, value]) => {
      const type = Array.isArray(value) ? 'array' : typeof value;
      const example = Array.isArray(value) ? 
        `[${value.slice(0, 3).join(', ')}${value.length > 3 ? '...' : ''}]` :
        String(value).length > 30 ? String(value).substring(0, 30) + '...' : String(value);
      console.log(`${key.padEnd(15)} | ${type.padEnd(6)} | ${example}`);
    });
    
    // 4. 检查关键字段是否存在
    console.log('\n🔎 关键字段检查：');
    const requiredFields = [
      'id', 'title', 'description', 'category', 'tags', 
      'cover_image', 'download_link', 'published_at', 
      'view_count', 'download_count', 'content', 'status'
    ];
    
    const availableFields = Object.keys(firstGame);
    requiredFields.forEach(field => {
      const exists = availableFields.includes(field);
      const status = exists ? '✅' : '❌';
      console.log(`${status} ${field}`);
    });
    
    // 5. 统计数据类型分布
    console.log('\n📈 数据统计：');
    const stats = {
      hasStatus: 0,
      hasViewCount: 0,
      hasDownloadCount: 0,
      hasContent: 0,
      statusValues: {},
      totalViewCount: 0,
      totalDownloadCount: 0
    };
    
    gamesData.forEach(game => {
      if (game.status) {
        stats.hasStatus++;
        stats.statusValues[game.status] = (stats.statusValues[game.status] || 0) + 1;
      }
      if (game.view_count !== undefined) {
        stats.hasViewCount++;
        stats.totalViewCount += game.view_count || 0;
      }
      if (game.download_count !== undefined) {
        stats.hasDownloadCount++;
        stats.totalDownloadCount += game.download_count || 0;
      }
      if (game.content) stats.hasContent++;
    });
    
    console.log(`- 有状态字段的游戏：${stats.hasStatus}/${gamesData.length}`);
    console.log(`- 有浏览量的游戏：${stats.hasViewCount}/${gamesData.length}`);
    console.log(`- 有下载量的游戏：${stats.hasDownloadCount}/${gamesData.length}`);
    console.log(`- 有内容字段的游戏：${stats.hasContent}/${gamesData.length}`);
    console.log(`- 总浏览量：${stats.totalViewCount.toLocaleString()}`);
    console.log(`- 总下载量：${stats.totalDownloadCount.toLocaleString()}`);
    
    if (Object.keys(stats.statusValues).length > 0) {
      console.log('- 状态分布：');
      Object.entries(stats.statusValues).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count}`);
      });
    }
    
    // 6. 生成数据库同步预期结果
    console.log('\n🎯 数据库同步预期结果：');
    const syncData = gamesData.map(game => ({
      id: game.id,
      title: game.title,
      description: game.description || '',
      content: game.content || game.description || '',
      cover_image: game.cover_image || '',
      category: game.category,
      tags: game.tags || [],
      author: game.author || 'System',
      download_link: game.download_link || '#',
      published_at: game.published_at || game.created_at || new Date().toISOString(),
      status: game.status || 'published',
      view_count: game.view_count || 0,
      download_count: game.download_count || 0
    }));
    
    console.log(`- 将同步 ${syncData.length} 个游戏到数据库`);
    console.log(`- 第一个游戏预览：`);
    console.log(JSON.stringify(syncData[0], null, 2));
    
    console.log('\n🎉 前端数据分析完成！');
    
  } catch (error) {
    console.error('❌ 分析过程中发生错误：', error.message);
  }
}

// 运行分析
debugFrontendData();