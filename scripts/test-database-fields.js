#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// 从环境变量或配置文件读取 Supabase 配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_') || supabaseAnonKey.includes('YOUR_')) {
  console.error('❌ 请设置正确的 Supabase 环境变量');
  console.log('需要设置：');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseFields() {
  console.log('🔍 正在测试数据库字段...\n');
  
  try {
    // 1. 测试基本查询
    console.log('1. 测试基本 games 表查询...');
    const { data: basicTest, error: basicError } = await supabase
      .from('games')
      .select('id, title')
      .limit(1);
    
    if (basicError) {
      console.error('❌ 基本查询失败：', basicError.message);
      return;
    }
    console.log('✅ 基本查询成功');
    
    // 2. 测试新字段查询
    console.log('\n2. 测试新添加的字段查询...');
    const { data: newFieldsTest, error: newFieldsError } = await supabase
      .from('games')
      .select('id, title, view_count, download_count, status')
      .limit(1);
    
    if (newFieldsError) {
      console.error('❌ 新字段查询失败：', newFieldsError.message);
      console.log('💡 提示：请先运行 migration 文件添加缺失的字段');
      return;
    }
    console.log('✅ 新字段查询成功');
    console.log('📊 示例数据：', newFieldsTest[0]);
    
    // 3. 测试完整字段查询（模拟同步操作）
    console.log('\n3. 测试完整字段查询（模拟同步操作）...');
    const { data: fullTest, error: fullError } = await supabase
      .from('games')
      .select(`
        id, title, description, content, cover_image, category, 
        tags, author, download_link, published_at, created_at, 
        updated_at, status, view_count, download_count
      `)
      .limit(1);
    
    if (fullError) {
      console.error('❌ 完整字段查询失败：', fullError.message);
      return;
    }
    console.log('✅ 完整字段查询成功');
    
    // 4. 测试插入操作（带有新字段）
    console.log('\n4. 测试插入操作（带有新字段）...');
    const testGameData = {
      id: 'test-' + Date.now(),
      title: '测试游戏 - ' + new Date().toLocaleString(),
      description: '这是一个测试游戏',
      content: '测试游戏的详细内容',
      category: '测试',
      tags: ['测试', '临时'],
      author: '系统测试',
      download_link: '#test',
      status: 'draft',
      view_count: 0,
      download_count: 0
    };
    
    const { data: insertTest, error: insertError } = await supabase
      .from('games')
      .insert(testGameData)
      .select();
    
    if (insertError) {
      console.error('❌ 插入测试失败：', insertError.message);
      return;
    }
    console.log('✅ 插入测试成功');
    
    // 5. 清理测试数据
    const { error: deleteError } = await supabase
      .from('games')
      .delete()
      .eq('id', testGameData.id);
    
    if (deleteError) {
      console.warn('⚠️ 清理测试数据失败：', deleteError.message);
    } else {
      console.log('✅ 测试数据已清理');
    }
    
    console.log('\n🎉 所有测试通过！数据库字段配置正确。');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误：', error);
  }
}

// 运行测试
testDatabaseFields();