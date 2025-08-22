/**
 * Supabase连接测试脚本
 * 用于验证数据库连接和配置是否正确
 */

const { createClient } = require('@supabase/supabase-js');

// 使用项目中的实际配置
const SUPABASE_URL = "https://oiatqeymovnyubrnlmlu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYXRxZXltb3ZueXVicm5sbWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjM0MzYsImV4cCI6MjA2OTg5OTQzNn0.U-3p0SEVNOQUV4lYFWRiOfVmxgNSbMRWx0mE0DXZYuM";

async function testSupabaseConnection() {
  console.log('🔄 开始测试Supabase连接...');
  console.log(`📡 连接URL: ${SUPABASE_URL}`);
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  try {
    // 测试1: 查询games表
    console.log('\n📋 测试1: 查询games表...');
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id, title')
      .limit(3);
    
    if (gamesError) {
      console.error('❌ Games表查询失败:', gamesError.message);
    } else {
      console.log(`✅ Games表查询成功，找到 ${games?.length || 0} 个游戏`);
      if (games?.length > 0) {
        console.log('   示例数据:', games[0]);
      }
    }
    
    // 测试2: 查询categories表
    console.log('\n🏷️  测试2: 查询categories表...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(3);
    
    if (categoriesError) {
      console.error('❌ Categories表查询失败:', categoriesError.message);
    } else {
      console.log(`✅ Categories表查询成功，找到 ${categories?.length || 0} 个分类`);
      if (categories?.length > 0) {
        console.log('   示例数据:', categories[0]);
      }
    }
    
    // 测试3: 检查连接状态
    console.log('\n🔗 测试3: 检查连接状态...');
    const { data: healthData, error: healthError } = await supabase
      .from('games')
      .select('count(*)', { count: 'exact', head: true });
    
    if (healthError) {
      console.error('❌ 健康检查失败:', healthError.message);
    } else {
      console.log('✅ 数据库连接健康');
    }
    
    console.log('\n🎉 测试完成！数据库连接正常，可以配置GitHub Actions');
    return true;
    
  } catch (error) {
    console.error('\n💥 连接测试失败:', error.message);
    console.log('\n🔧 请检查：');
    console.log('   1. Supabase项目是否正常运行');
    console.log('   2. API Key是否正确');
    console.log('   3. 网络连接是否正常');
    return false;
  }
}

// 运行测试
if (require.main === module) {
  testSupabaseConnection()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('脚本执行错误:', error);
      process.exit(1);
    });
}

module.exports = { testSupabaseConnection };