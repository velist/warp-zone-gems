import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase配置
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncGamesToDatabase() {
  console.log('🚀 开始同步JSON数据到数据库...');
  
  try {
    // 读取JSON文件
    const gamesJsonPath = path.join(process.cwd(), 'public', 'data', 'games.json');
    const gamesData = JSON.parse(fs.readFileSync(gamesJsonPath, 'utf8'));
    
    console.log(`📊 发现 ${gamesData.length} 个游戏需要同步`);
    
    // 首先清空现有数据（可选）
    console.log('🗑️ 清空现有数据...');
    const { error: deleteError } = await supabase
      .from('games')
      .delete()
      .neq('id', ''); // 删除所有记录
    
    if (deleteError && deleteError.code !== 'PGRST116') { // PGRST116 = no rows affected
      console.error('❌ 清空数据失败:', deleteError);
    }
    
    // 批量插入游戏数据
    console.log('📥 批量插入游戏数据...');
    const { data, error } = await supabase
      .from('games')
      .insert(gamesData.map(game => ({
        id: game.id,
        title: game.title,
        description: game.description,
        content: game.content || game.description,
        category: game.category,
        tags: game.tags || [],
        cover_image: game.cover_image,
        download_link: game.download_link,
        published_at: game.published_at,
        view_count: game.view_count || 0,
        download_count: game.download_count || 0,
        status: game.status || 'published',
        author: 'Admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })));
    
    if (error) {
      console.error('❌ 插入数据失败:', error);
      return;
    }
    
    console.log('✅ 数据同步完成！');
    
    // 验证数据
    const { data: verifyData, error: verifyError } = await supabase
      .from('games')
      .select('id, title, status')
      .order('created_at', { ascending: false });
    
    if (verifyError) {
      console.error('❌ 验证数据失败:', verifyError);
      return;
    }
    
    console.log(`🔍 验证结果: 数据库中现有 ${verifyData?.length || 0} 个游戏`);
    
    if (verifyData && verifyData.length > 0) {
      const statusCounts = verifyData.reduce((acc, game) => {
        const status = game.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📈 状态分布:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 同步过程失败:', error);
  }
}

syncGamesToDatabase();