#!/usr/bin/env node

/**
 * 改进的数据同步脚本：将 public/data/games.json 中的24个游戏数据同步到Supabase数据库
 * 
 * 解决的问题：
 * 1. 前端显示24个游戏，后台管理只显示5个的数据不一致问题
 * 2. 字段映射问题（UUID vs 字符串ID）
 * 3. 缺失字段处理
 * 4. 数据重复和冲突处理
 */

const fs = require('fs');
const path = require('path');

// Supabase 配置 - 使用实际的配置
const SUPABASE_CONFIG = {
  url: 'https://oiatqeymovnyubrnlmlu.supabase.co',
  // 注意：使用 service_role key 而不是 anon key 来绕过 RLS
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYXRxZXltb3ZueXVicm5sbWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMyMzQzNiwiZXhwIjoyMDY5ODk5NDM2fQ.On6-6jHsnyeQikwpunIZybx_KLzMsSXsSQimcadMn58'
};

async function improvedSyncGamesToDatabase() {
  console.log('🎮 开始改进版游戏数据同步...\n');
  
  try {
    // 1. 验证依赖
    let supabase;
    try {
      const { createClient } = require('@supabase/supabase-js');
      supabase = createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.serviceKey,
        {
          auth: { persistSession: false }
        }
      );
    } catch (error) {
      console.error('❌ 缺少依赖: @supabase/supabase-js');
      console.error('💡 请运行: npm install @supabase/supabase-js');
      process.exit(1);
    }
    
    // 2. 读取 JSON 文件中的游戏数据
    const gamesFilePath = path.join(__dirname, 'public/data/games.json');
    
    if (!fs.existsSync(gamesFilePath)) {
      throw new Error(`游戏数据文件不存在: ${gamesFilePath}`);
    }
    
    const gamesData = JSON.parse(fs.readFileSync(gamesFilePath, 'utf8'));
    console.log(`📊 从 JSON 文件读取到 ${gamesData.length} 个游戏`);
    
    // 3. 检查数据库连接和现有数据
    console.log('🔍 检查数据库连接和现有数据...');
    const { data: existingGames, error: fetchError } = await supabase
      .from('games')
      .select('id, title, slug')
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      throw new Error(`获取现有数据失败: ${fetchError.message}`);
    }
    
    console.log(`🗄️ 数据库现有游戏: ${existingGames?.length || 0} 个`);
    
    // 4. 清理现有数据（可选 - 设置为false保留现有数据）
    const CLEAR_EXISTING_DATA = true;
    
    if (CLEAR_EXISTING_DATA && existingGames && existingGames.length > 0) {
      console.log('🗑️ 清理现有数据...');
      const { error: deleteError } = await supabase
        .from('games')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // 删除所有记录
      
      if (deleteError) {
        console.warn('⚠️ 清理数据时出现错误:', deleteError.message);
      } else {
        console.log('✅ 现有数据已清理');
      }
    }
    
    // 5. 准备同步数据 - 正确处理所有字段
    const gamesToSync = gamesData.map(game => {
      // 确保所有必需字段都有值
      return {
        slug: game.id, // 使用原始 JSON 中的 id 作为 slug
        title: game.title || 'Untitled Game',
        description: game.description || '',
        content: game.content || game.description || '暂无详细介绍',
        cover_image: game.cover_image || '',
        category: game.category || '其他',
        tags: Array.isArray(game.tags) ? game.tags : [],
        download_link: game.download_link || '#',
        published_at: game.published_at || game.created_at || new Date().toISOString(),
        view_count: parseInt(game.view_count) || 0,
        download_count: parseInt(game.download_count) || 0,
        status: game.status || 'published',
        author: game.author || 'Admin',
        created_at: game.created_at || new Date().toISOString(),
        updated_at: game.updated_at || new Date().toISOString()
      };
    });
    
    // 6. 批量插入数据
    console.log(`\\n🔄 开始同步 ${gamesToSync.length} 个游戏...`);
    
    const { data: insertedGames, error: insertError } = await supabase
      .from('games')
      .insert(gamesToSync)
      .select();
    
    if (insertError) {
      console.error('❌ 数据插入失败:', insertError);
      
      // 尝试逐个插入以找出有问题的记录
      console.log('🔧 尝试逐个插入数据以识别问题...');
      let successCount = 0;
      let failCount = 0;
      
      for (const [index, game] of gamesToSync.entries()) {
        try {
          const { error: singleError } = await supabase
            .from('games')
            .insert([game])
            .select();
          
          if (singleError) {
            console.error(`   ❌ 插入失败 [${index + 1}]: ${game.title} - ${singleError.message}`);
            failCount++;
          } else {
            console.log(`   ✅ 成功插入 [${index + 1}]: ${game.title}`);
            successCount++;
          }
        } catch (err) {
          console.error(`   ❌ 插入错误 [${index + 1}]: ${game.title} - ${err.message}`);
          failCount++;
        }
      }
      
      console.log(`\\n📊 逐个插入结果: 成功 ${successCount} 个, 失败 ${failCount} 个`);
    } else {
      console.log(`✅ 批量插入成功: ${insertedGames?.length || 0} 个游戏`);
    }
    
    // 7. 验证最终结果
    console.log('\\n🔍 验证同步结果...');
    const { data: finalGames, error: verifyError } = await supabase
      .from('games')
      .select('id, title, category, status, slug, view_count, download_count')
      .order('created_at', { ascending: false });
    
    if (verifyError) {
      console.warn('获取验证数据失败:', verifyError.message);
    } else {
      console.log(`\\n📈 最终统计:`);
      console.log(`   总游戏数: ${finalGames?.length || 0}`);
      
      if (finalGames && finalGames.length > 0) {
        // 按分类统计
        const categoryStats = finalGames.reduce((acc, game) => {
          const category = game.category || 'Unknown';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});
        
        console.log(`\\n📊 分类分布:`);
        Object.entries(categoryStats).forEach(([category, count]) => {
          console.log(`   ${category}: ${count} 个`);
        });
        
        // 按状态统计
        const statusStats = finalGames.reduce((acc, game) => {
          const status = game.status || 'unknown';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        
        console.log(`\\n📋 状态分布:`);
        Object.entries(statusStats).forEach(([status, count]) => {
          console.log(`   ${status}: ${count} 个`);
        });
        
        // 显示总的查看和下载统计
        const totalViews = finalGames.reduce((sum, game) => sum + (game.view_count || 0), 0);
        const totalDownloads = finalGames.reduce((sum, game) => sum + (game.download_count || 0), 0);
        
        console.log(`\\n📊 统计数据:`);
        console.log(`   总查看次数: ${totalViews.toLocaleString()}`);
        console.log(`   总下载次数: ${totalDownloads.toLocaleString()}`);
      }
    }
    
    console.log('\\n✅ 数据同步完成!');
    console.log('🎯 现在前后端数据应该完全一致！');
    console.log('💡 建议: 刷新后台管理页面查看结果');
    
  } catch (error) {
    console.error('\\n❌ 同步失败:', error.message);
    console.error('\\n🔧 解决方案建议:');
    console.error('   1. 确认 Supabase URL 和 Service Key 配置正确');
    console.error('   2. 确认网络连接正常');
    console.error('   3. 检查数据库表结构是否正确创建');
    console.error('   4. 确认数据库权限设置正确');
    console.error('   5. 检查 JSON 数据格式是否正确');
    process.exit(1);
  }
}

// 配置验证函数
function validateConfiguration() {
  const issues = [];
  
  if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url.includes('YOUR_')) {
    issues.push('❌ Supabase URL 未正确配置');
  }
  
  if (!SUPABASE_CONFIG.serviceKey || SUPABASE_CONFIG.serviceKey.includes('YOUR_')) {
    issues.push('❌ Supabase Service Key 未正确配置');
  }
  
  if (issues.length > 0) {
    console.error('配置错误:');
    issues.forEach(issue => console.error(`   ${issue}`));
    console.error('\\n💡 请检查脚本中的 SUPABASE_CONFIG 配置');
    return false;
  }
  
  return true;
}

// 主函数
async function main() {
  console.log('🚀 Warp Zone Gems - 改进版游戏数据同步工具\\n');
  
  // 验证配置
  if (!validateConfiguration()) {
    process.exit(1);
  }
  
  // 执行同步
  await improvedSyncGamesToDatabase();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 同步工具执行失败:', error.message);
    process.exit(1);
  });
}

module.exports = { improvedSyncGamesToDatabase };