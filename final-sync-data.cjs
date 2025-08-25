#!/usr/bin/env node

/**
 * 最终数据同步脚本：将 public/data/games.json 中的24个游戏数据同步到Supabase数据库
 * 
 * 兼容现有数据库架构，处理所有字段映射问题
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_CONFIG = {
  url: 'https://oiatqeymovnyubrnlmlu.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYXRxZXltb3ZueXVicm5sbWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMyMzQzNiwiZXhwIjoyMDY5ODk5NDM2fQ.On6-6jHsnyeQikwpunIZybx_KLzMsSXsSQimcadMn58'
};

async function finalSyncGamesToDatabase() {
  console.log('🎮 开始最终游戏数据同步...\n');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.serviceKey,
      {
        auth: { persistSession: false }
      }
    );
    
    // 读取 JSON 文件
    const gamesFilePath = path.join(__dirname, 'public/data/games.json');
    if (!fs.existsSync(gamesFilePath)) {
      throw new Error(`游戏数据文件不存在: ${gamesFilePath}`);
    }
    
    const gamesData = JSON.parse(fs.readFileSync(gamesFilePath, 'utf8'));
    console.log(`📊 从 JSON 文件读取到 ${gamesData.length} 个游戏`);
    
    // 检查数据库当前状态
    const { data: existingGames, error: fetchError } = await supabase
      .from('games')
      .select('id, title')
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      throw new Error(`获取现有数据失败: ${fetchError.message}`);
    }
    
    console.log(`🗄️ 数据库现有游戏: ${existingGames?.length || 0} 个`);
    
    // 准备同步数据 - 使用现有架构字段
    console.log('\\n🔄 准备游戏数据...');
    
    const gamesToSync = gamesData.map((game, index) => {
      return {
        title: game.title || `游戏 ${index + 1}`,
        description: game.description || '',
        content: game.content || game.description || '暂无详细介绍',
        cover_image: game.cover_image || '',
        category: game.category || '其他',
        tags: Array.isArray(game.tags) ? game.tags : [],
        author: game.author || 'Admin',
        published_at: game.published_at || game.created_at || new Date().toISOString(),
        created_at: game.created_at || new Date().toISOString(),
        updated_at: game.updated_at || new Date().toISOString()
      };
    });
    
    console.log(`✅ 准备了 ${gamesToSync.length} 个游戏数据`);
    
    // 批量插入数据
    console.log('\\n📥 开始批量插入游戏数据...');
    
    let successCount = 0;
    let errorCount = 0;
    const batchSize = 10; // 小批量插入以避免超时
    
    for (let i = 0; i < gamesToSync.length; i += batchSize) {
      const batch = gamesToSync.slice(i, i + batchSize);
      console.log(`\\n⚡ 正在插入批次 ${Math.floor(i/batchSize) + 1}/${Math.ceil(gamesToSync.length/batchSize)} (${batch.length} 个游戏)...`);
      
      const { data: insertedBatch, error: batchError } = await supabase
        .from('games')
        .insert(batch)
        .select();
      
      if (batchError) {
        console.error(`❌ 批次 ${Math.floor(i/batchSize) + 1} 插入失败:`, batchError.message);
        errorCount += batch.length;
        
        // 尝试逐个插入此批次
        console.log('🔧 尝试逐个插入...');
        for (const game of batch) {
          try {
            const { error: singleError } = await supabase
              .from('games')
              .insert([game]);
            
            if (singleError) {
              console.error(`   ❌ ${game.title}: ${singleError.message}`);
              errorCount++;
            } else {
              console.log(`   ✅ ${game.title}: 插入成功`);
              successCount++;
            }
          } catch (err) {
            console.error(`   ❌ ${game.title}: ${err.message}`);
            errorCount++;
          }
        }
      } else {
        successCount += batch.length;
        console.log(`✅ 批次 ${Math.floor(i/batchSize) + 1} 成功插入 ${insertedBatch?.length || batch.length} 个游戏`);
        
        // 显示插入的游戏标题
        batch.forEach(game => {
          console.log(`   📝 ${game.title}`);
        });
      }
      
      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\\n📊 插入结果统计:');
    console.log(`   ✅ 成功: ${successCount} 个`);
    console.log(`   ❌ 失败: ${errorCount} 个`);
    console.log(`   📈 总计: ${successCount + errorCount} 个`);
    
    // 最终验证
    console.log('\\n🔍 验证最终结果...');
    const { data: finalGames, error: verifyError } = await supabase
      .from('games')
      .select('id, title, category, created_at')
      .order('created_at', { ascending: false });
    
    if (verifyError) {
      console.warn('⚠️ 验证查询失败:', verifyError.message);
    } else {
      console.log(`\\n📈 最终数据库统计:`);
      console.log(`   游戏总数: ${finalGames?.length || 0}`);
      
      if (finalGames && finalGames.length > 0) {
        // 按分类统计
        const categoryStats = finalGames.reduce((acc, game) => {
          const category = game.category || 'Unknown';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});
        
        console.log('\\n📊 分类统计:');
        Object.entries(categoryStats)
          .sort(([,a], [,b]) => b - a)
          .forEach(([category, count]) => {
            console.log(`   ${category}: ${count} 个`);
          });
        
        // 显示最新的5个游戏
        console.log('\\n📋 最新游戏 (前5个):');
        finalGames.slice(0, 5).forEach((game, index) => {
          console.log(`   ${index + 1}. ${game.title} (${game.category})`);
        });
      }
    }
    
    console.log('\\n✅ 数据同步完成!');
    
    if (successCount === gamesData.length) {
      console.log('🎉 所有24个游戏都已成功同步到数据库！');
      console.log('🎯 现在前后端数据完全一致！');
    } else if (successCount > 0) {
      console.log(`🎯 ${successCount}/${gamesData.length} 个游戏同步成功`);
      if (errorCount > 0) {
        console.log(`⚠️ ${errorCount} 个游戏同步失败，可能需要手动检查`);
      }
    }
    
    console.log('💡 建议: 刷新后台管理页面查看结果');
    
  } catch (error) {
    console.error('\\n❌ 同步失败:', error.message);
    console.error('\\n🔧 解决方案:');
    console.error('   1. 检查 Supabase 配置和网络连接');
    console.error('   2. 确认数据库表结构正确');
    console.error('   3. 检查 JSON 数据格式');
    console.error('   4. 确认服务密钥权限');
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Warp Zone Gems - 最终数据同步工具\\n');
  await finalSyncGamesToDatabase();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('💥 同步失败:', error.message);
    process.exit(1);
  });
}

module.exports = { finalSyncGamesToDatabase };