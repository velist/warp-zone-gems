/**
 * Supabase数据库保活脚本
 * 定期访问数据库保持连接活跃，防止自动休眠
 */

const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const http = require('http');

// 配置信息
const config = {
  supabaseUrl: process.env.VITE_SUPABASE_URL || "https://oiatqeymovnyubrnlmlu.supabase.co",
  supabaseKey: process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYXRxZXltb3ZueXVicm5sbWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjM0MzYsImV4cCI6MjA2OTg5OTQzNn0.U-3p0SEVNOQUV4lYFWRiOfVmxgNSbMRWx0mE0DXZYuM",
  websiteUrl: process.env.WEBSITE_URL || 'https://velist.github.io/warp-zone-gems/',
  maxRetries: 3,
  retryDelay: 5000, // 5秒
};

// 日志函数
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// HTTP请求函数
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          data: data,
          headers: response.headers
        });
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(30000); // 30秒超时
  });
}

// 访问网站首页
async function pingWebsite() {
  log('开始访问网站首页...');
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await makeRequest(config.websiteUrl);
      
      if (response.statusCode >= 200 && response.statusCode < 400) {
        log(`✅ 网站访问成功 (状态码: ${response.statusCode})`);
        return true;
      } else {
        log(`⚠️  网站返回状态码: ${response.statusCode}`);
      }
    } catch (error) {
      log(`❌ 网站访问失败 (尝试 ${attempt}/${config.maxRetries}): ${error.message}`);
      
      if (attempt < config.maxRetries) {
        log(`等待 ${config.retryDelay/1000} 秒后重试...`);
        await delay(config.retryDelay);
      }
    }
  }
  
  return false;
}

// 查询数据库
async function queryDatabase() {
  log('开始数据库查询...');
  
  if (!config.supabaseUrl || !config.supabaseKey) {
    log('❌ Supabase配置信息缺失');
    return false;
  }
  
  const supabase = createClient(config.supabaseUrl, config.supabaseKey);
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      // 查询games表
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('id, title')
        .limit(5);
      
      if (gamesError) {
        throw new Error(`Games查询错误: ${gamesError.message}`);
      }
      
      log(`✅ 成功查询到 ${gamesData?.length || 0} 个游戏记录`);
      
      // 查询categories表
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .limit(3);
      
      if (categoriesError) {
        log(`⚠️  Categories查询警告: ${categoriesError.message}`);
      } else {
        log(`✅ 成功查询到 ${categoriesData?.length || 0} 个分类记录`);
      }
      
      // 执行一个简单的函数调用（如果有的话）
      try {
        const { data: healthData } = await supabase.rpc('get_health_status').limit(1);
        if (healthData) {
          log('✅ 健康检查函数调用成功');
        }
      } catch (funcError) {
        log('ℹ️  健康检查函数不存在或调用失败（这是正常的）');
      }
      
      return true;
      
    } catch (error) {
      log(`❌ 数据库查询失败 (尝试 ${attempt}/${config.maxRetries}): ${error.message}`);
      
      if (attempt < config.maxRetries) {
        log(`等待 ${config.retryDelay/1000} 秒后重试...`);
        await delay(config.retryDelay);
      }
    }
  }
  
  return false;
}

// 发送状态报告（可选）
async function sendStatusReport(websiteStatus, databaseStatus) {
  const report = {
    timestamp: new Date().toISOString(),
    website: websiteStatus ? '正常' : '异常',
    database: databaseStatus ? '正常' : '异常',
    status: (websiteStatus && databaseStatus) ? '成功' : '部分失败'
  };
  
  log('='.repeat(50));
  log('📊 保活任务报告:');
  log(`   时间: ${report.timestamp}`);
  log(`   网站状态: ${report.website}`);
  log(`   数据库状态: ${report.database}`);
  log(`   总体状态: ${report.status}`);
  log('='.repeat(50));
  
  return report;
}

// 主函数
async function main() {
  log('🚀 开始执行Supabase数据库保活任务');
  log(`配置信息: ${config.websiteUrl}`);
  
  const startTime = Date.now();
  
  // 并行执行网站访问和数据库查询
  const [websiteStatus, databaseStatus] = await Promise.all([
    pingWebsite(),
    queryDatabase()
  ]);
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  log(`⏱️  任务执行时间: ${duration} 秒`);
  
  // 发送状态报告
  const report = await sendStatusReport(websiteStatus, databaseStatus);
  
  // 根据结果设置退出码 - 只要数据库正常就算成功
  if (databaseStatus) {
    log('✅ 保活任务完成，数据库保持活跃状态');
    if (!websiteStatus) {
      log('ℹ️  网站访问失败但不影响数据库保活');
    }
    process.exit(0);
  } else {
    log('❌ 数据库保活失败，请检查配置和网络连接');
    process.exit(1);
  }
}

// 错误处理
process.on('uncaughtException', (error) => {
  log(`❌ 未捕获的异常: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`❌ 未处理的Promise拒绝: ${reason}`);
  process.exit(1);
});

// 优雅退出
process.on('SIGINT', () => {
  log('🛑 收到中断信号，正在退出...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('🛑 收到终止信号，正在退出...');
  process.exit(0);
});

// 运行主函数
if (require.main === module) {
  main().catch((error) => {
    log(`❌ 主函数执行失败: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main, pingWebsite, queryDatabase };