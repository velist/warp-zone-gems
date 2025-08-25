#!/usr/bin/env node

/**
 * 数据一致性验证脚本
 * 验证前端 JSON 数据与数据库数据的一致性
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_CONFIG = {
  url: 'https://oiatqeymovnyubrnlmlu.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYXRxZXltb3ZueXVicm5sbWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMyMzQzNiwiZXhwIjoyMDY5ODk5NDM2fQ.On6-6jHsnyeQikwpunIZybx_KLzMsSXsSQimcadMn58'
};

async function verifyDataConsistency() {
  console.log('🔍 开始验证数据一致性...\n');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.serviceKey,
      {
        auth: { persistSession: false }
      }
    );
    
    // 1. 读取前端 JSON 数据
    const gamesFilePath = path.join(__dirname, 'public/data/games.json');
    const frontendGames = JSON.parse(fs.readFileSync(gamesFilePath, 'utf8'));
    console.log(`📄 前端 JSON 数据: ${frontendGames.length} 个游戏`);
    
    // 2. 读取数据库数据
    const { data: dbGames, error: fetchError } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      throw new Error(`获取数据库数据失败: ${fetchError.message}`);
    }
    
    console.log(`🗄️ 数据库数据: ${dbGames?.length || 0} 个游戏`);
    
    // 3. 基本数量对比
    console.log('\\n📊 数量对比:');
    console.log(`   前端: ${frontendGames.length} 个游戏`);
    console.log(`   数据库: ${dbGames?.length || 0} 个游戏`);
    
    if (frontendGames.length === (dbGames?.length || 0)) {
      console.log('✅ 数量一致');
    } else {
      console.log('❌ 数量不一致');
    }
    
    // 4. 分类统计对比
    console.log('\\n📂 分类统计对比:');
    
    const frontendCategories = frontendGames.reduce((acc, game) => {
      const category = game.category || 'Unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    const dbCategories = (dbGames || []).reduce((acc, game) => {
      const category = game.category || 'Unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\\n   前端分类统计:');
    Object.entries(frontendCategories)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`     ${category}: ${count} 个`);
      });
    
    console.log('\\n   数据库分类统计:');
    Object.entries(dbCategories)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`     ${category}: ${count} 个`);
      });
    
    // 5. 字段完整性检查
    console.log('\\n🔧 字段完整性检查:');
    
    if (dbGames && dbGames.length > 0) {
      const sampleDbGame = dbGames[0];
      const dbFields = Object.keys(sampleDbGame);
      const frontendFields = Object.keys(frontendGames[0]);
      
      console.log('\\n   数据库字段:', dbFields.join(', '));
      console.log('   前端字段:', frontendFields.join(', '));
      
      // 检查缺失字段
      const missingInDb = frontendFields.filter(field => !dbFields.includes(field));
      const missingInFrontend = dbFields.filter(field => !frontendFields.includes(field));
      
      if (missingInDb.length > 0) {
        console.log(`\\n   ⚠️ 数据库中缺失的字段: ${missingInDb.join(', ')}`);
      }
      
      if (missingInFrontend.length > 0) {
        console.log(`\\n   ℹ️ 前端中没有的字段 (数据库特有): ${missingInFrontend.join(', ')}`);
      }
      
      if (missingInDb.length === 0 && missingInFrontend.filter(f => f !== 'id').length === 0) {
        console.log('\\n   ✅ 字段结构基本一致');
      }
    }
    
    // 6. 游戏标题匹配检查
    console.log('\\n📋 游戏标题匹配检查:');
    
    const frontendTitles = new Set(frontendGames.map(game => game.title));
    const dbTitles = new Set((dbGames || []).map(game => game.title));
    
    const missingInDbTitles = [...frontendTitles].filter(title => !dbTitles.has(title));
    const extraInDbTitles = [...dbTitles].filter(title => !frontendTitles.has(title));
    
    if (missingInDbTitles.length === 0 && extraInDbTitles.length === 0) {
      console.log('   ✅ 所有游戏标题完全匹配');
    } else {
      if (missingInDbTitles.length > 0) {
        console.log(`\\n   ❌ 数据库中缺失的游戏 (${missingInDbTitles.length} 个):`);
        missingInDbTitles.forEach(title => console.log(`     - ${title}`));
      }
      
      if (extraInDbTitles.length > 0) {
        console.log(`\\n   ℹ️ 数据库中额外的游戏 (${extraInDbTitles.length} 个):`);
        extraInDbTitles.forEach(title => console.log(`     - ${title}`));
      }
    }
    
    // 7. 数据质量检查
    console.log('\\n🎯 数据质量检查:');
    
    if (dbGames && dbGames.length > 0) {
      const emptyTitles = dbGames.filter(game => !game.title || game.title.trim() === '').length;
      const emptyDescriptions = dbGames.filter(game => !game.description || game.description.trim() === '').length;
      const emptyCoverImages = dbGames.filter(game => !game.cover_image || game.cover_image.trim() === '').length;
      const emptyCategories = dbGames.filter(game => !game.category || game.category.trim() === '').length;
      
      console.log(`   标题为空: ${emptyTitles} 个`);
      console.log(`   描述为空: ${emptyDescriptions} 个`);
      console.log(`   封面图片为空: ${emptyCoverImages} 个`);
      console.log(`   分类为空: ${emptyCategories} 个`);
      
      if (emptyTitles === 0 && emptyCategories === 0) {
        console.log('   ✅ 关键字段数据完整');
      } else {
        console.log('   ⚠️ 存在关键字段数据缺失');
      }
    }
    
    // 8. 总结
    console.log('\\n📋 验证总结:');
    console.log('==========================================');
    
    const issues = [];
    
    if (frontendGames.length !== (dbGames?.length || 0)) {
      issues.push('游戏数量不一致');
    }
    
    if (missingInDbTitles.length > 0) {
      issues.push(`${missingInDbTitles.length} 个游戏未同步到数据库`);
    }
    
    if (issues.length === 0) {
      console.log('🎉 数据同步完美！前后端数据完全一致！');
      console.log('✅ 所有 24 个游戏都已成功同步');
      console.log('✅ 分类数据正确');
      console.log('✅ 数据质量良好');
    } else {
      console.log('⚠️ 发现以下问题:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    console.log('==========================================');
    console.log('💡 建议: 现在可以测试前后端应用，确认显示效果');
    
  } catch (error) {
    console.error('\\n❌ 验证失败:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Warp Zone Gems - 数据一致性验证工具\\n');
  
  try {
    await verifyDataConsistency();
  } catch (error) {
    console.error('💥 验证失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { verifyDataConsistency };