#!/usr/bin/env node

/**
 * 数据同步脚本：将 public/data/games.json 中的24个游戏数据同步到Supabase数据库
 * 解决前端显示24个游戏，后台管理只显示5个的数据不一致问题
 */

const fs = require('fs');
const path = require('path');

// Supabase 配置 (需要手动配置)
const SUPABASE_CONFIG = {
  url: 'https://oiatqeymovnyubrnlmlu.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYXRxZXltb3ZueXVicm5sbWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMyMzQzNiwiZXhwIjoyMDY5ODk5NDM2fQ.On6-6jHsnyeQikwpunIZybx_KLzMsSXsSQimcadMn58' // 需要service_role key，不是anon key
};

async function syncGamesToDatabase() {
  console.log('🎮 开始同步游戏数据到数据库...\n');
  
  try {
    // 1. 读取 JSON 文件中的游戏数据
    const gamesFilePath = path.join(__dirname, 'public/data/games.json');
    const gamesData = JSON.parse(fs.readFileSync(gamesFilePath, 'utf8'));
    
    console.log(`📊 从 JSON 文件读取到 ${gamesData.length} 个游戏`);
    
    // 2. 导入 Supabase 客户端 (需要安装 @supabase/supabase-js)
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.serviceKey,
      {
        auth: { persistSession: false }
      }
    );
    
    // 3. 检查数据库现有数据
    const { data: existingGames, error: fetchError } = await supabase
      .from('games')
      .select('id, title')
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      throw new Error(`获取现有数据失败: ${fetchError.message}`);
    }
    
    console.log(`🗄️ 数据库现有游戏: ${existingGames?.length || 0} 个`);
    
    // 4. 准备同步数据 - 转换格式（不包含id让数据库自动生成UUID）
    const gamesToSync = gamesData.map(game => ({
      title: game.title,
      description: game.description || '',
      content: game.content || game.description || '',
      cover_image: game.cover_image || '',
      category: game.category,
      tags: game.tags || [],
      author: game.author || 'Unknown',
      published_at: game.published_at || game.created_at || new Date().toISOString()
      // 注意：数据库表中没有 download_link, status, view_count, download_count 字段
    }));
    
    // 5. 执行 UPSERT 操作 (插入或更新)
    console.log('\\n🔄 开始同步数据...');
    
    const { data: upsertedGames, error: upsertError } = await supabase
      .from('games')
      .upsert(gamesToSync, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();
    
    if (upsertError) {
      throw new Error(`数据同步失败: ${upsertError.message}`);
    }
    
    // 6. 验证同步结果
    const { data: finalCount, error: countError } = await supabase
      .from('games')
      .select('id', { count: 'exact', head: true });
    
    if (countError) {
      console.warn('获取最终数据统计失败:', countError.message);
    }
    
    console.log('\\n✅ 数据同步完成!');
    console.log(`📈 同步操作影响: ${upsertedGames?.length || 0} 条记录`);
    console.log(`🗄️ 数据库最终游戏总数: ${finalCount?.count || '未知'} 个`);
    
    // 7. 显示详细统计
    console.log('\\n📋 同步详情:');
    gamesToSync.forEach((game, index) => {
      console.log(`   ${index + 1}. ${game.title} (${game.category})`);
    });
    
    console.log('\\n🎯 现在前后端数据应该完全一致！');
    console.log('💡 建议: 刷新后台管理页面查看结果');
    
  } catch (error) {
    console.error('\\n❌ 同步失败:', error.message);
    console.error('\\n🔧 解决方案:');
    console.error('   1. 确认 Supabase URL 和 Service Key 配置正确');
    console.error('   2. 确认安装了 @supabase/supabase-js 依赖');
    console.error('   3. 确认数据库表结构正确');
    console.error('   4. 检查网络连接和权限设置');
    process.exit(1);
  }
}

// 配置验证
function validateConfig() {
  if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') {
    console.error('❌ 请在脚本中配置正确的 Supabase URL');
    console.error('💡 从项目的 .env.local 或 Supabase 控制台获取');
    return false;
  }
  
  if (SUPABASE_CONFIG.serviceKey === 'YOUR_SUPABASE_SERVICE_KEY') {
    console.error('❌ 请在脚本中配置正确的 Supabase Service Key');
    console.error('💡 注意: 需要 service_role key，不是 anon key');
    console.error('💡 从 Supabase 控制台 > Project Settings > API 获取');
    return false;
  }
  
  return true;
}

// 主函数
async function main() {
  console.log('🚀 Warp Zone Gems - 游戏数据同步工具\\n');
  
  // 检查配置
  if (!validateConfig()) {
    process.exit(1);
  }
  
  // 检查依赖
  try {
    require('@supabase/supabase-js');
  } catch (error) {
    console.error('❌ 缺少依赖: @supabase/supabase-js');
    console.error('💡 请运行: npm install @supabase/supabase-js');
    process.exit(1);
  }
  
  // 执行同步
  await syncGamesToDatabase();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { syncGamesToDatabase };