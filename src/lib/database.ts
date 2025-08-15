// 新数据库客户端 - 替代 Supabase
import { Pool, PoolClient } from 'pg';
import { config } from './config';

// 数据库配置
const DB_CONFIG = {
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  max: config.database.maxConnections,
  idleTimeoutMillis: config.database.idleTimeout,
  connectionTimeoutMillis: config.database.connectionTimeout,
};

// 数据库连接池
let pool: Pool | null = null;

// 初始化数据库连接
export function initDatabase(): Pool {
  if (!pool) {
    pool = new Pool(DB_CONFIG);
    
    pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });

    pool.on('connect', () => {
      console.log('Database connected');
    });
  }
  
  return pool;
}

// 获取数据库连接
export async function getConnection(): Promise<PoolClient> {
  if (!pool) {
    pool = initDatabase();
  }
  
  return await pool.connect();
}

// 执行查询
export async function query<T = any>(
  text: string, 
  params?: any[]
): Promise<T[]> {
  const client = await getConnection();
  
  try {
    const start = Date.now();
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    
    // 开发环境记录慢查询
    if (import.meta.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`Slow query (${duration}ms):`, text);
    }
    
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 执行事务
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getConnection();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// 数据库操作类
export class DatabaseService {
  // 游戏相关操作
  static async getGames(options: {
    limit?: number;
    offset?: number;
    category?: string;
    status?: string;
    search?: string;
    orderBy?: string;
  } = {}) {
    const {
      limit = 20,
      offset = 0,
      category,
      status = 'published',
      search,
      orderBy = 'published_at DESC'
    } = options;

    let whereClause = 'WHERE status = $1';
    let params: any[] = [status];
    let paramIndex = 2;

    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (
        title ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex + 1} OR
        to_tsvector('chinese', title || ' ' || COALESCE(description, '')) @@ plainto_tsquery('chinese', $${paramIndex + 2})
      )`;
      params.push(`%${search}%`, `%${search}%`, search);
      paramIndex += 3;
    }

    const sql = `
      SELECT 
        g.*,
        c.name as category_name,
        c.color as category_color,
        u.username as author_name
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      LEFT JOIN users u ON g.created_by = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    
    return await query(sql, params);
  }

  static async getGameBySlug(slug: string) {
    const games = await query(`
      SELECT 
        g.*,
        c.name as category_name,
        c.color as category_color,
        u.username as author_name
      FROM games g
      LEFT JOIN categories c ON g.category_id = c.id
      LEFT JOIN users u ON g.created_by = u.id
      WHERE g.slug = $1 AND g.status = 'published'
    `, [slug]);

    return games[0] || null;
  }

  static async createGame(gameData: {
    title: string;
    description?: string;
    content?: string;
    cover_image?: string;
    download_link?: string;
    category_id?: string;
    tags?: string[];
    created_by: string;
  }) {
    const slug = this.generateSlug(gameData.title);
    
    const result = await query(`
      INSERT INTO games (
        title, slug, description, content, cover_image,
        download_link, category_id, tags, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      gameData.title,
      slug,
      gameData.description,
      gameData.content,
      gameData.cover_image,
      gameData.download_link,
      gameData.category_id,
      gameData.tags || [],
      gameData.created_by
    ]);

    return result[0];
  }

  static async updateGame(id: string, gameData: Partial<{
    title: string;
    description: string;
    content: string;
    cover_image: string;
    download_link: string;
    category_id: string;
    tags: string[];
    status: string;
  }>) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(gameData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE games 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result[0];
  }

  static async deleteGame(id: string) {
    await query('DELETE FROM games WHERE id = $1', [id]);
  }

  static async incrementViewCount(id: string) {
    await query(
      'UPDATE games SET view_count = view_count + 1 WHERE id = $1',
      [id]
    );
  }

  static async incrementDownloadCount(id: string) {
    await query(
      'UPDATE games SET download_count = download_count + 1 WHERE id = $1',
      [id]
    );
  }

  // 分类相关操作
  static async getCategories() {
    return await query(`
      SELECT *, 
        (SELECT COUNT(*) FROM games WHERE category_id = categories.id AND status = 'published') as games_count
      FROM categories 
      WHERE is_active = true 
      ORDER BY sort_order, name
    `);
  }

  static async getCategoryBySlug(slug: string) {
    const categories = await query(
      'SELECT * FROM categories WHERE slug = $1 AND is_active = true',
      [slug]
    );
    return categories[0] || null;
  }

  // 用户相关操作
  static async getUserByEmail(email: string) {
    const users = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    return users[0] || null;
  }

  static async getUserById(id: string) {
    const users = await query(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [id]
    );
    return users[0] || null;
  }

  static async createUser(userData: {
    email: string;
    password_hash: string;
    username?: string;
    role?: string;
  }) {
    const result = await query(`
      INSERT INTO users (email, password_hash, username, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, username, role, created_at
    `, [
      userData.email,
      userData.password_hash,
      userData.username,
      userData.role || 'user'
    ]);

    return result[0];
  }

  static async updateUserLastLogin(id: string) {
    await query(`
      UPDATE users 
      SET last_login_at = NOW(), login_count = login_count + 1
      WHERE id = $1
    `, [id]);
  }

  // 会话相关操作
  static async createSession(sessionData: {
    user_id: string;
    token_hash: string;
    expires_at: Date;
    device_info?: object;
    ip_address?: string;
    user_agent?: string;
  }) {
    const result = await query(`
      INSERT INTO user_sessions (
        user_id, token_hash, expires_at, device_info, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      sessionData.user_id,
      sessionData.token_hash,
      sessionData.expires_at,
      sessionData.device_info || {},
      sessionData.ip_address,
      sessionData.user_agent
    ]);

    return result[0];
  }

  static async getSessionByToken(tokenHash: string) {
    const sessions = await query(`
      SELECT s.*, u.email, u.username, u.role
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token_hash = $1 AND s.expires_at > NOW() AND u.is_active = true
    `, [tokenHash]);

    return sessions[0] || null;
  }

  static async deleteSession(tokenHash: string) {
    await query('DELETE FROM user_sessions WHERE token_hash = $1', [tokenHash]);
  }

  static async cleanupExpiredSessions() {
    return await query('SELECT cleanup_expired_sessions()');
  }

  // 收藏相关操作
  static async addToFavorites(userId: string, gameId: string) {
    await query(`
      INSERT INTO user_favorites (user_id, game_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, game_id) DO NOTHING
    `, [userId, gameId]);
  }

  static async removeFromFavorites(userId: string, gameId: string) {
    await query(
      'DELETE FROM user_favorites WHERE user_id = $1 AND game_id = $2',
      [userId, gameId]
    );
  }

  static async getUserFavorites(userId: string) {
    return await query(`
      SELECT g.*, c.name as category_name, c.color as category_color
      FROM user_favorites uf
      JOIN games g ON uf.game_id = g.id
      LEFT JOIN categories c ON g.category_id = c.id
      WHERE uf.user_id = $1 AND g.status = 'published'
      ORDER BY uf.created_at DESC
    `, [userId]);
  }

  // 评分相关操作
  static async addRating(userId: string, gameId: string, rating: number, review?: string) {
    await query(`
      INSERT INTO user_ratings (user_id, game_id, rating, review)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, game_id) DO UPDATE SET
        rating = EXCLUDED.rating,
        review = EXCLUDED.review,
        updated_at = NOW()
    `, [userId, gameId, rating, review]);
  }

  static async getGameRatings(gameId: string) {
    return await query(`
      SELECT ur.*, u.username
      FROM user_ratings ur
      JOIN users u ON ur.user_id = u.id
      WHERE ur.game_id = $1
      ORDER BY ur.created_at DESC
    `, [gameId]);
  }

  // 统计相关操作
  static async getStats() {
    const results = await Promise.all([
      query('SELECT COUNT(*) as count FROM games WHERE status = \'published\''),
      query('SELECT COUNT(*) as count FROM categories WHERE is_active = true'),
      query('SELECT COUNT(*) as count FROM users WHERE is_active = true'),
      query('SELECT SUM(download_count) as total FROM games')
    ]);

    return {
      games: parseInt(results[0][0].count),
      categories: parseInt(results[1][0].count),
      users: parseInt(results[2][0].count),
      downloads: parseInt(results[3][0].total || '0')
    };
  }

  // 工具方法
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  }
}

// 关闭数据库连接
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// 导出默认实例
export default DatabaseService;