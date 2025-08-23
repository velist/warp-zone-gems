#!/usr/bin/env node

/**
 * 修复用户反馈同步功能失败的问题
 * 解决 "Could not find the download_count column of 'games' in the schema cache" 错误
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 读取环境变量
require('dotenv').config({ path: path.join(__dirname, '../supabase.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 请设置正确的 Supabase 环境变量');
  console.log('检查 supabase.env 文件中是否包含：');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_ANON_KEY');
  console.log('- SUPABASE_SERVICE_ROLE_KEY (可选，用于管理操作)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

async function fixSyncIssue() {
  console.log('🔧 开始修复用户反馈同步功能...\n');
  
  try {
    // 1. 检查当前数据库表结构
    console.log('1. 检查当前数据库表结构...');
    const { data: currentStructure, error: structureError } = await supabase
      .from('games')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ 无法查询数据库表结构：', structureError.message);
      return false;
    }
    
    if (currentStructure && currentStructure.length > 0) {
      const fields = Object.keys(currentStructure[0]);
      console.log('✅ 当前数据库字段：', fields.join(', '));
      
      // 检查缺失的字段
      const requiredFields = ['view_count', 'download_count', 'status'];
      const missingFields = requiredFields.filter(field => !fields.includes(field));
      
      if (missingFields.length > 0) {
        console.log('❌ 缺失字段：', missingFields.join(', '));
        console.log('💡 需要运行数据库迁移添加这些字段');
      } else {
        console.log('✅ 所有必需字段都存在');
      }
    }
    
    // 2. 尝试添加缺失的字段（如果有权限）
    if (supabaseServiceKey) {
      console.log('\n2. 尝试添加缺失的字段...');
      
      // 注意：这个操作需要管理员权限，可能不会成功
      // 正确的方法是使用 Supabase CLI 运行 migration 文件
      console.log('⚠️ 字段添加需要使用 Supabase CLI 运行 migration 文件：');
      console.log('   supabase db push');
      console.log('   或手动在 Supabase 控制台中添加字段');
    }
    
    // 3. 读取前端数据进行验证
    console.log('\n3. 验证前端数据结构...');
    const gamesDataPath = path.join(__dirname, '../public/data/games.json');
    
    if (!fs.existsSync(gamesDataPath)) {
      console.error('❌ 前端游戏数据文件不存在：', gamesDataPath);
      return false;
    }
    
    const rawData = fs.readFileSync(gamesDataPath, 'utf8');
    const frontendGames = JSON.parse(rawData);
    
    console.log(`✅ 前端数据包含 ${frontendGames.length} 个游戏`);
    
    if (frontendGames.length > 0) {
      const firstGame = frontendGames[0];
      const frontendFields = Object.keys(firstGame);
      console.log('📋 前端数据字段：', frontendFields.join(', '));
      
      // 检查前端数据是否包含问题字段
      const problematicFields = ['view_count', 'download_count', 'status'];
      const hasProblematicFields = problematicFields.filter(field => frontendFields.includes(field));
      console.log('🎯 前端数据包含的关键字段：', hasProblematicFields.join(', '));
    }
    
    // 4. 模拟同步操作测试
    console.log('\n4. 模拟同步操作测试...');
    
    const testGame = {
      id: 'test-sync-' + Date.now(),
      title: '同步测试游戏',
      description: '测试同步功能',
      content: '测试内容',
      category: '测试',
      tags: ['测试'],
      author: '系统',
      download_link: '#test',
      published_at: new Date().toISOString(),
      // 尝试包含问题字段
      status: 'published',
      view_count: 0,
      download_count: 0
    };
    
    console.log('📤 尝试插入测试数据...');
    const { data: testInsert, error: testError } = await supabase
      .from('games')
      .insert(testGame)
      .select();
    
    if (testError) {
      console.error('❌ 测试同步失败：', testError.message);
      
      // 分析错误原因
      if (testError.message.includes('download_count') || 
          testError.message.includes('view_count') || 
          testError.message.includes('status')) {
        console.log('🔍 错误分析：数据库表缺少相应字段');
        console.log('🛠️  解决方案：');
        console.log('   1. 运行 migration 文件添加缺失字段');
        console.log('   2. 或者在 PostManagement.tsx 中过滤掉这些字段');
      }
      
      return false;
    } else {
      console.log('✅ 测试同步成功');
      
      // 清理测试数据
      await supabase.from('games').delete().eq('id', testGame.id);
      console.log('🧹 测试数据已清理');
    }
    
    // 5. 提供修复建议
    console.log('\n🎯 修复建议：');
    console.log('方案一（推荐）：添加数据库字段');
    console.log('  1. 使用 Supabase CLI: supabase db push');
    console.log('  2. 或手动在 Supabase 控制台添加字段：');
    console.log('     - view_count (integer, default 0)');
    console.log('     - download_count (integer, default 0)');
    console.log('     - status (text, default "published")');
    
    console.log('\n方案二：修改前端代码过滤字段');
    console.log('  在 PostManagement.tsx 的 handleSyncFromFrontend 中');
    console.log('  只包含数据库实际存在的字段');
    
    console.log('\n🎉 问题诊断完成！');
    return true;
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误：', error);
    return false;
  }
}

// 运行修复
fixSyncIssue().then(success => {
  process.exit(success ? 0 : 1);
});