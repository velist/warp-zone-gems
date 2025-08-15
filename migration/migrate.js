const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// 配置
const SUPABASE_CONFIG = {
  url: 'https://oiatqeymovnyubrnlmlu.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pYXRxZXltb3ZueXVicm5sbWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMjM0MzYsImV4cCI6MjA2OTg5OTQzNn0.U-3p0SEVNOQUV4lYFWRiOfVmxgNSbMRWx0mE0DXZYuM'
};

// 新数据库配置 (需要根据实际情况修改)
const NEW_DB_CONFIG = {
  host: process.env.NEW_DB_HOST || 'localhost',
  port: process.env.NEW_DB_PORT || 5432,
  database: process.env.NEW_DB_NAME || 'warp_zone_gems',
  user: process.env.NEW_DB_USER || 'postgres',
  password: process.env.NEW_DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

class DatabaseMigration {
  constructor() {
    this.supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
    this.newDb = new Pool(NEW_DB_CONFIG);
    this.migrationStats = {
      categories: { total: 0, migrated: 0, errors: 0 },
      games: { total: 0, migrated: 0, errors: 0 },
      total_time: 0
    };
  }

  async init() {
    console.log('🚀 开始数据库迁移...');
    console.log('📊 Supabase URL:', SUPABASE_CONFIG.url);
    console.log('📊 新数据库:', `${NEW_DB_CONFIG.host}:${NEW_DB_CONFIG.port}/${NEW_DB_CONFIG.database}`);
    
    // 测试连接
    await this.testConnections();
  }

  async testConnections() {
    console.log('🔍 测试数据库连接...');
    
    try {
      // 测试 Supabase 连接
      const { data, error } = await this.supabase
        .from('games')
        .select('count', { count: 'exact', head: true });
      
      if (error) throw error;
      console.log('✅ Supabase 连接成功');
      
      // 测试新数据库连接
      const client = await this.newDb.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('✅ 新数据库连接成功');
      
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      process.exit(1);
    }
  }

  async runMigration() {
    const startTime = Date.now();
    
    try {
      // 步骤1: 创建数据库结构
      await this.createSchema();
      
      // 步骤2: 迁移分类数据
      await this.migrateCategories();
      
      // 步骤3: 迁移游戏数据
      await this.migrateGames();
      
      // 步骤4: 数据验证
      await this.validateMigration();
      
      this.migrationStats.total_time = Date.now() - startTime;
      this.printStats();
      
      console.log('🎉 数据迁移完成!');
      
    } catch (error) {
      console.error('❌ 迁移失败:', error);
      throw error;
    }
  }

  async createSchema() {
    console.log('📋 创建数据库结构...');
    
    try {
      const schemaSQL = fs.readFileSync(
        path.join(__dirname, 'schema.sql'), 
        'utf8'
      );
      
      await this.newDb.query(schemaSQL);
      console.log('✅ 数据库结构创建成功');
      
    } catch (error) {
      console.error('❌ 创建数据库结构失败:', error.message);
      throw error;
    }
  }

  async migrateCategories() {
    console.log('📂 迁移分类数据...');
    
    try {
      // 从 Supabase 获取分类数据
      const { data: categories, error } = await this.supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      
      this.migrationStats.categories.total = categories?.length || 0;
      
      if (!categories || categories.length === 0) {
        console.log('⚠️  没有找到分类数据，使用默认分类');
        return;
      }
      
      // 插入到新数据库
      for (const category of categories) {
        try {
          await this.newDb.query(`
            INSERT INTO categories (id, name, slug, description, color, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (name) DO UPDATE SET
              description = EXCLUDED.description,
              color = EXCLUDED.color,
              updated_at = NOW()
          `, [
            category.id,
            category.name,
            category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
            category.description,
            category.color || '#FF6B6B',
            category.created_at
          ]);
          
          this.migrationStats.categories.migrated++;
          
        } catch (error) {
          console.error(`❌ 迁移分类失败: ${category.name}`, error.message);
          this.migrationStats.categories.errors++;
        }
      }
      
      console.log(`✅ 分类迁移完成: ${this.migrationStats.categories.migrated}/${this.migrationStats.categories.total}`);
      
    } catch (error) {
      console.error('❌ 分类迁移失败:', error.message);
      throw error;
    }
  }

  async migrateGames() {
    console.log('🎮 迁移游戏数据...');
    
    try {
      // 分批获取游戏数据
      let offset = 0;
      const batchSize = 50;
      let hasMore = true;
      
      while (hasMore) {
        const { data: games, error } = await this.supabase
          .from('games')
          .select('*')
          .range(offset, offset + batchSize - 1);
        
        if (error) throw error;
        
        if (!games || games.length === 0) {
          hasMore = false;
          break;
        }
        
        this.migrationStats.games.total += games.length;
        
        // 批量插入游戏数据
        for (const game of games) {
          try {
            // 生成 slug
            const slug = this.generateSlug(game.title);
            
            // 获取或创建分类ID
            const categoryId = await this.getCategoryId(game.category);
            
            await this.newDb.query(`
              INSERT INTO games (
                id, title, slug, description, content, cover_image,
                download_link, category_id, category, tags, author,
                published_at, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
              ON CONFLICT (slug) DO UPDATE SET
                title = EXCLUDED.title,
                description = EXCLUDED.description,
                content = EXCLUDED.content,
                cover_image = EXCLUDED.cover_image,
                download_link = EXCLUDED.download_link,
                category_id = EXCLUDED.category_id,
                category = EXCLUDED.category,
                tags = EXCLUDED.tags,
                author = EXCLUDED.author,
                updated_at = NOW()
            `, [
              game.id,
              game.title,
              slug,
              game.description,
              game.content,
              game.cover_image,
              game.download_link,
              categoryId,
              game.category,
              game.tags || [],
              game.author,
              game.published_at,
              game.created_at,
              game.updated_at
            ]);
            
            this.migrationStats.games.migrated++;
            
            // 进度显示
            if (this.migrationStats.games.migrated % 10 === 0) {
              console.log(`📈 已迁移游戏: ${this.migrationStats.games.migrated}`);
            }
            
          } catch (error) {
            console.error(`❌ 迁移游戏失败: ${game.title}`, error.message);
            this.migrationStats.games.errors++;
          }
        }
        
        offset += batchSize;
        
        // 避免过快请求
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`✅ 游戏迁移完成: ${this.migrationStats.games.migrated}/${this.migrationStats.games.total}`);
      
    } catch (error) {
      console.error('❌ 游戏迁移失败:', error.message);
      throw error;
    }
  }

  async getCategoryId(categoryName) {
    if (!categoryName) return null;
    
    try {
      const result = await this.newDb.query(
        'SELECT id FROM categories WHERE name = $1',
        [categoryName]
      );
      
      if (result.rows.length > 0) {
        return result.rows[0].id;
      }
      
      // 如果分类不存在，创建新分类
      const insertResult = await this.newDb.query(`
        INSERT INTO categories (name, slug, description)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [
        categoryName,
        this.generateSlug(categoryName),
        `自动创建的分类: ${categoryName}`
      ]);
      
      return insertResult.rows[0].id;
      
    } catch (error) {
      console.error('获取分类ID失败:', error.message);
      return null;
    }
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }

  async validateMigration() {
    console.log('🔍 验证迁移结果...');
    
    try {
      // 验证分类数量
      const categoryCount = await this.newDb.query('SELECT COUNT(*) FROM categories');
      console.log(`📂 分类总数: ${categoryCount.rows[0].count}`);
      
      // 验证游戏数量
      const gameCount = await this.newDb.query('SELECT COUNT(*) FROM games');
      console.log(`🎮 游戏总数: ${gameCount.rows[0].count}`);
      
      // 验证数据完整性
      const gamesWithoutCategory = await this.newDb.query(`
        SELECT COUNT(*) FROM games WHERE category_id IS NULL AND category IS NOT NULL
      `);
      
      if (parseInt(gamesWithoutCategory.rows[0].count) > 0) {
        console.warn(`⚠️  有 ${gamesWithoutCategory.rows[0].count} 个游戏缺少分类ID`);
      }
      
      // 验证索引
      const indexCount = await this.newDb.query(`
        SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public'
      `);
      console.log(`📊 索引总数: ${indexCount.rows[0].count}`);
      
      console.log('✅ 数据验证完成');
      
    } catch (error) {
      console.error('❌ 数据验证失败:', error.message);
      throw error;
    }
  }

  printStats() {
    console.log('\n📊 迁移统计:');
    console.log('========================');
    console.log(`📂 分类: ${this.migrationStats.categories.migrated}/${this.migrationStats.categories.total} (错误: ${this.migrationStats.categories.errors})`);
    console.log(`🎮 游戏: ${this.migrationStats.games.migrated}/${this.migrationStats.games.total} (错误: ${this.migrationStats.games.errors})`);
    console.log(`⏱️  总耗时: ${(this.migrationStats.total_time / 1000).toFixed(2)} 秒`);
    console.log('========================\n');
  }

  async close() {
    await this.newDb.end();
  }

  // 导出数据备份
  async exportBackup() {
    console.log('💾 导出数据备份...');
    
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        categories: [],
        games: []
      };
      
      // 导出分类
      const { data: categories } = await this.supabase
        .from('categories')
        .select('*');
      backup.categories = categories || [];
      
      // 导出游戏
      let offset = 0;
      const batchSize = 100;
      let hasMore = true;
      
      while (hasMore) {
        const { data: games } = await this.supabase
          .from('games')
          .select('*')
          .range(offset, offset + batchSize - 1);
        
        if (!games || games.length === 0) {
          hasMore = false;
          break;
        }
        
        backup.games.push(...games);
        offset += batchSize;
      }
      
      // 保存备份文件
      const backupPath = path.join(__dirname, `backup_${Date.now()}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
      
      console.log(`✅ 备份已保存: ${backupPath}`);
      console.log(`📊 备份统计: ${backup.categories.length} 个分类, ${backup.games.length} 个游戏`);
      
      return backupPath;
      
    } catch (error) {
      console.error('❌ 导出备份失败:', error.message);
      throw error;
    }
  }
}

// 主执行函数
async function main() {
  const migration = new DatabaseMigration();
  
  try {
    await migration.init();
    
    // 先导出备份
    await migration.exportBackup();
    
    // 执行迁移
    await migration.runMigration();
    
  } catch (error) {
    console.error('💥 迁移过程发生错误:', error);
    process.exit(1);
  } finally {
    await migration.close();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = DatabaseMigration;