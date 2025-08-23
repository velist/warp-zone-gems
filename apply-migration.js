#!/usr/bin/env node

/**
 * 应用数据库Migration脚本：添加缺失的字段
 * 修复同步问题："Could not find the download_count column of 'games' in the schema cache"
 */

const fs = require('fs');
const path = require('path');

// Supabase 配置 (需要从环境变量或配置文件获取)
const SUPABASE_CONFIG = {
  url: process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL',
  serviceKey: process.env.SUPABASE_SERVICE_KEY || 'YOUR_SUPABASE_SERVICE_KEY'
};

async function applyMigration() {
  console.log('🔧 开始应用数据库Migration...\n');
  
  try {
    // 检查依赖
    try {
      require('@supabase/supabase-js');
    } catch (error) {
      console.error('❌ 缺少依赖: @supabase/supabase-js');
      console.error('💡 请运行: npm install @supabase/supabase-js');
      process.exit(1);
    }

    // 检查配置
    if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_URL') {
      console.error('❌ 请配置正确的 Supabase URL');
      console.error('💡 设置环境变量 VITE_SUPABASE_URL');
      process.exit(1);
    }

    // 1. 读取Migration文件
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250823000000_add_missing_columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 读取Migration文件:', migrationPath);
    console.log('📝 Migration内容预览:');
    console.log('   - ADD COLUMN view_count INTEGER');
    console.log('   - ADD COLUMN download_count INTEGER'); 
    console.log('   - ADD COLUMN status TEXT');

    // 2. 导入 Supabase 客户端
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.serviceKey,
      {
        auth: { persistSession: false }
      }
    );

    console.log('\n🔗 连接到Supabase数据库...');

    // 3. 分步执行Migration语句
    const statements = migrationSQL
      .split(';')
      .filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'))
      .map(stmt => stmt.trim());

    console.log(`\n📋 准备执行 ${statements.length} 个SQL语句...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;

      console.log(`⏳ [${i + 1}/${statements.length}] 执行: ${statement.substring(0, 60)}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // 如果是"已存在"错误，这是正常的
          if (error.message.includes('already exists') || error.message.includes('IF NOT EXISTS')) {
            console.log(`   ✅ 跳过(已存在): ${statement.split(' ')[0]} ${statement.split(' ')[1]}`);
          } else {
            throw error;
          }
        } else {
          console.log(`   ✅ 成功`);
        }
      } catch (sqlError) {
        console.log(`   ❌ SQL执行失败:`, sqlError.message);
        // 继续执行其他语句
      }
    }

    // 4. 验证表结构
    console.log('\n🔍 验证表结构...');
    
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'games')
      .eq('table_schema', 'public');

    if (columnError) {
      console.warn('⚠️ 无法验证表结构:', columnError.message);
    } else {
      console.log('\n📊 当前games表字段结构:');
      columns.forEach(col => {
        const required = col.is_nullable === 'NO' ? '(必需)' : '(可选)';
        console.log(`   - ${col.column_name}: ${col.data_type} ${required}`);
      });

      // 检查关键字段
      const hasViewCount = columns.some(col => col.column_name === 'view_count');
      const hasDownloadCount = columns.some(col => col.column_name === 'download_count');
      const hasStatus = columns.some(col => col.column_name === 'status');

      console.log('\n🎯 关键字段检查:');
      console.log(`   view_count: ${hasViewCount ? '✅ 存在' : '❌ 缺失'}`);
      console.log(`   download_count: ${hasDownloadCount ? '✅ 存在' : '❌ 缺失'}`);
      console.log(`   status: ${hasStatus ? '✅ 存在' : '❌ 缺失'}`);

      if (hasViewCount && hasDownloadCount && hasStatus) {
        console.log('\n🎉 Migration应用成功！所有必需字段已添加。');
        console.log('💡 现在可以重试前端的数据同步功能。');
      } else {
        console.log('\n⚠️ Migration可能未完全成功，请检查数据库权限。');
      }
    }

    // 5. 测试数据插入
    console.log('\n🧪 测试数据插入...');
    const testData = {
      id: 'test-' + Date.now(),
      title: 'Migration测试游戏',
      description: '这是一个测试数据',
      category: '测试分类',
      tags: ['测试'],
      author: 'Migration脚本',
      status: 'published',
      view_count: 100,
      download_count: 50
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('games')
      .insert(testData)
      .select();

    if (insertError) {
      console.log('❌ 测试插入失败:', insertError.message);
    } else {
      console.log('✅ 测试插入成功');
      
      // 清理测试数据
      await supabase.from('games').delete().eq('id', testData.id);
      console.log('🧹 测试数据已清理');
    }

    console.log('\n🎯 Migration应用完成！');
    console.log('🔄 建议重新构建前端项目并重试同步功能。');

  } catch (error) {
    console.error('\n❌ Migration应用失败:', error.message);
    console.error('\n🔧 可能的解决方案:');
    console.error('   1. 检查Supabase URL和Service Key配置');
    console.error('   2. 确认数据库连接权限');
    console.error('   3. 手动在Supabase控制台执行SQL');
    console.error('   4. 检查网络连接');
    process.exit(1);
  }
}

// 主函数
async function main() {
  console.log('🚀 Warp Zone Gems - 数据库Migration工具\n');
  console.log('📋 目标: 修复同步功能字段缺失问题\n');
  
  await applyMigration();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { applyMigration };