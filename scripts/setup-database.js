import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库连接配置
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  // 注意：这里不指定数据库名，因为我们需要先创建数据库
};

const DATABASE_NAME = process.env.DB_NAME || 'warp_zone_gems';

async function setupDatabase() {
  console.log('🚀 开始设置 PostgreSQL 数据库...');
  
  // 连接到 PostgreSQL 服务器（不指定数据库）
  const adminPool = new Pool(DB_CONFIG);
  
  try {
    // 1. 检查数据库是否存在，不存在则创建
    console.log(`📋 检查数据库 ${DATABASE_NAME} 是否存在...`);
    
    const dbCheckResult = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [DATABASE_NAME]
    );
    
    if (dbCheckResult.rows.length === 0) {
      console.log(`🔨 创建数据库 ${DATABASE_NAME}...`);
      await adminPool.query(`CREATE DATABASE "${DATABASE_NAME}"`);
      console.log(`✅ 数据库 ${DATABASE_NAME} 创建成功`);
    } else {
      console.log(`✅ 数据库 ${DATABASE_NAME} 已存在`);
    }
    
    await adminPool.end();
    
    // 2. 连接到新创建的数据库并执行 schema
    console.log('📊 连接到目标数据库并执行 schema...');
    
    const dbPool = new Pool({
      ...DB_CONFIG,
      database: DATABASE_NAME,
    });
    
    // 读取 schema 文件
    const schemaPath = path.join(__dirname, '..', 'migration', 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema 文件不存在: ${schemaPath}`);
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // 执行 schema
    console.log('🔧 执行数据库 schema...');
    await dbPool.query(schemaSQL);
    console.log('✅ Schema 执行成功');
    
    // 3. 插入初始数据
    console.log('📝 插入初始数据...');
    
    // 插入默认分类
    const categories = [
      { name: '平台跳跃', slug: 'platformer', description: '经典的马里奥平台跳跃游戏', color: '#ef4444', icon: '🏃' },
      { name: '赛车竞速', slug: 'racing', description: '马里奥卡丁车系列游戏', color: '#3b82f6', icon: '🏎️' },
      { name: '角色扮演', slug: 'rpg', description: '马里奥RPG冒险游戏', color: '#8b5cf6', icon: '⚔️' },
      { name: '派对游戏', slug: 'party', description: '马里奥派对聚会游戏', color: '#f59e0b', icon: '🎉' },
      { name: '体感运动', slug: 'sports', description: '马里奥体感运动游戏', color: '#10b981', icon: '⚽' },
      { name: '解谜益智', slug: 'puzzle', description: '马里奥解谜益智游戏', color: '#06b6d4', icon: '🧩' },
    ];
    
    for (const category of categories) {
      await dbPool.query(`
        INSERT INTO categories (name, slug, description, color, icon, is_active, sort_order)
        VALUES ($1, $2, $3, $4, $5, true, 0)
        ON CONFLICT (slug) DO NOTHING
      `, [category.name, category.slug, category.description, category.color, category.icon]);
    }
    
    console.log('✅ 初始分类数据插入成功');
    
    // 4. 创建默认管理员用户（如果不存在）
    const bcrypt = await import('bcryptjs');
    const defaultPassword = 'admin123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    
    await dbPool.query(`
      INSERT INTO users (email, username, password_hash, role, is_active, email_verified)
      VALUES ($1, $2, $3, $4, true, true)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@warpzonegems.com', 'admin', hashedPassword, 'admin']);
    
    console.log('✅ 默认管理员用户创建成功');
    console.log('📧 管理员邮箱: admin@warpzonegems.com');
    console.log('🔑 默认密码: admin123456');
    
    // 5. 创建示例游戏数据
    const sampleGames = [
      {
        title: 'Super Mario Bros.',
        slug: 'super-mario-bros',
        description: '经典的超级马里奥兄弟游戏',
        content: '这是最经典的马里奥游戏，开启了平台跳跃游戏的黄金时代。',
        category_slug: 'platformer',
        tags: ['经典', '平台', '任天堂'],
      },
      {
        title: 'Mario Kart 8 Deluxe',
        slug: 'mario-kart-8-deluxe',
        description: '最受欢迎的马里奥卡丁车游戏',
        content: '包含所有DLC内容的完整版马里奥卡丁车游戏。',
        category_slug: 'racing',
        tags: ['赛车', '多人', 'Switch'],
      },
    ];
    
    // 获取分类ID
    const categoryMap = new Map();
    const categoryResult = await dbPool.query('SELECT id, slug FROM categories');
    categoryResult.rows.forEach(row => {
      categoryMap.set(row.slug, row.id);
    });
    
    // 获取管理员用户ID
    const adminResult = await dbPool.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['admin']);
    const adminId = adminResult.rows[0]?.id;
    
    if (adminId) {
      for (const game of sampleGames) {
        const categoryId = categoryMap.get(game.category_slug);
        if (categoryId) {
          await dbPool.query(`
            INSERT INTO games (title, slug, description, content, category_id, tags, created_by, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'published')
            ON CONFLICT (slug) DO NOTHING
          `, [game.title, game.slug, game.description, game.content, categoryId, game.tags, adminId]);
        }
      }
      console.log('✅ 示例游戏数据插入成功');
    }
    
    await dbPool.end();
    
    console.log('🎉 数据库设置完成！');
    console.log('');
    console.log('📋 数据库信息:');
    console.log(`   主机: ${DB_CONFIG.host}:${DB_CONFIG.port}`);
    console.log(`   数据库: ${DATABASE_NAME}`);
    console.log(`   用户: ${DB_CONFIG.user}`);
    console.log('');
    console.log('🔐 管理员登录信息:');
    console.log('   邮箱: admin@warpzonegems.com');
    console.log('   密码: admin123456');
    console.log('');
    console.log('⚠️  请在生产环境中修改默认密码！');
    
  } catch (error) {
    console.error('❌ 数据库设置失败:', error);
    process.exit(1);
  }
}

// 运行设置脚本
setupDatabase().catch(console.error);