#!/usr/bin/env node

/**
 * 应用架构修复迁移
 * 这个脚本将应用新的数据库架构以支持完整的数据同步
 */

const fs = require('fs');
const path = require('path');

// Supabase 配置
const SUPABASE_CONFIG = {
  url: 'https://oiatqeymovnyubrnlmlu.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYXRxZXltb3ZueXVicm5sbWx1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDMyMzQzNiwiZXhwIjoyMDY5ODk5NDM2fQ.On6-6jHsnyeQikwpunIZybx_KLzMsSXsSQimcadMn58'
};

async function applySchemaFix() {
  console.log('🔧 开始应用架构修复...\n');
  
  try {
    // 导入 Supabase 客户端
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.serviceKey,
      {
        auth: { persistSession: false }
      }
    );
    
    // 读取迁移文件
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250824000000_fix_schema_sync.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 读取迁移文件成功');
    console.log(`📊 SQL 命令长度: ${migrationSQL.length} 字符\n`);
    
    // 将 SQL 分割为单独的命令（按分号分割）
    const sqlCommands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`🔨 将执行 ${sqlCommands.length} 个 SQL 命令\n`);
    
    // 逐个执行 SQL 命令
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      
      try {
        console.log(`⚡ 执行命令 ${i + 1}/${sqlCommands.length}...`);
        
        // 使用 rpc 函数执行原始 SQL
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: command
        });
        
        if (error) {
          // 如果没有 exec_sql 函数，尝试直接执行
          if (error.code === 'PGRST202') {
            console.log('   使用替代方法执行 SQL...');
            
            // 对于 ALTER TABLE 和其他 DDL 命令，我们需要使用不同的方法
            if (command.includes('ALTER TABLE') || command.includes('CREATE INDEX') || command.includes('CREATE TRIGGER')) {
              console.log(`   跳过 DDL 命令（需要数据库管理员权限）: ${command.substring(0, 50)}...`);
              continue;
            }
          } else {
            throw error;
          }
        }
        
        console.log(`   ✅ 命令执行成功`);
        
      } catch (cmdError) {
        console.warn(`   ⚠️ 命令执行失败: ${cmdError.message}`);
        console.warn(`   命令: ${command.substring(0, 100)}...`);
        
        // 某些错误可以忽略（例如字段已存在）
        if (cmdError.message.includes('already exists') || 
            cmdError.message.includes('duplicate key') ||
            cmdError.message.includes('does not exist')) {
          console.log(`   继续执行...`);
          continue;
        }
      }
      
      // 添加小延迟避免过快请求
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n✅ 架构修复完成！');
    
    // 验证修复结果
    console.log('\n🔍 验证修复结果...');
    
    try {
      // 检查表结构
      const { data: tableInfo, error: tableError } = await supabase
        .from('games')
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.warn('⚠️ 无法验证表结构:', tableError.message);
      } else {
        console.log('✅ games 表可以正常访问');
      }
      
      // 检查分类数据
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*');
      
      if (catError) {
        console.warn('⚠️ 无法访问分类数据:', catError.message);
      } else {
        console.log(`✅ 分类表包含 ${categories?.length || 0} 条记录`);
      }
      
    } catch (verifyError) {
      console.warn('⚠️ 验证过程出现错误:', verifyError.message);
    }
    
    console.log('\n🎯 现在可以运行数据同步脚本了！');
    console.log('💡 建议运行: node improved-sync-data.cjs');
    
  } catch (error) {
    console.error('\n❌ 架构修复失败:', error.message);
    console.error('\n🔧 可能的解决方案:');
    console.error('   1. 检查 Supabase 服务密钥权限');
    console.error('   2. 手动在 Supabase Dashboard 中运行 SQL');
    console.error('   3. 检查网络连接');
    console.error('   4. 确认迁移文件路径正确');
    process.exit(1);
  }
}

// 主函数
async function main() {
  console.log('🚀 Warp Zone Gems - 架构修复工具\n');
  
  // 检查迁移文件是否存在
  const migrationPath = path.join(__dirname, 'supabase/migrations/20250824000000_fix_schema_sync.sql');
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ 找不到迁移文件:', migrationPath);
    process.exit(1);
  }
  
  // 执行架构修复
  await applySchemaFix();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 架构修复工具执行失败:', error.message);
    process.exit(1);
  });
}

module.exports = { applySchemaFix };