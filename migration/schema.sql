-- Warp Zone Gems - 新数据库 Schema 设计
-- 目标: 替代 Supabase，使用轻量级 PostgreSQL

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 用户表 (替代 Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator')),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户会话表 (JWT 替代方案)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 游戏分类表 (保持原有结构)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#FF6B6B',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    games_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 游戏内容表 (增强版)
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    content TEXT,
    excerpt VARCHAR(500),
    cover_image TEXT,
    screenshots TEXT[], -- 游戏截图数组
    download_link TEXT,
    download_size VARCHAR(20), -- 文件大小
    version VARCHAR(20), -- 游戏版本
    platform VARCHAR(100), -- 游戏平台
    language VARCHAR(50) DEFAULT 'zh-CN',
    category_id UUID REFERENCES categories(id),
    category VARCHAR(100), -- 兼容旧版本
    tags TEXT[], -- 标签数组
    author VARCHAR(100),
    developer VARCHAR(100), -- 开发商
    publisher VARCHAR(100), -- 发行商
    release_date DATE, -- 发布日期
    
    -- SEO 字段
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    meta_keywords TEXT[],
    
    -- 状态字段
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    is_hot BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    
    -- 统计字段
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00, -- 评分 0.00-5.00
    rating_count INTEGER DEFAULT 0,
    
    -- 用户关联
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    -- 时间戳
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 管理员设置表 (从 localStorage 迁移至数据库)
CREATE TABLE admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    is_encrypted BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, setting_key)
);

-- 用户收藏表
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_id)
);

-- 用户评分表
CREATE TABLE user_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_id)
);

-- 下载记录表
CREATE TABLE download_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    download_size BIGINT,
    download_duration INTEGER, -- 下载耗时(秒)
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 系统日志表
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(10) NOT NULL CHECK (level IN ('DEBUG', 'INFO', 'WARN', 'ERROR')),
    message TEXT NOT NULL,
    context JSONB,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

CREATE INDEX idx_games_slug ON games(slug);
CREATE INDEX idx_games_category_id ON games(category_id);
CREATE INDEX idx_games_category ON games(category);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_is_featured ON games(is_featured);
CREATE INDEX idx_games_is_hot ON games(is_hot);
CREATE INDEX idx_games_published_at ON games(published_at DESC);
CREATE INDEX idx_games_view_count ON games(view_count DESC);
CREATE INDEX idx_games_download_count ON games(download_count DESC);
CREATE INDEX idx_games_rating ON games(rating DESC);
CREATE INDEX idx_games_created_by ON games(created_by);
CREATE INDEX idx_games_tags ON games USING GIN(tags);
CREATE INDEX idx_games_title_search ON games USING GIN(to_tsvector('chinese', title));
CREATE INDEX idx_games_content_search ON games USING GIN(to_tsvector('chinese', coalesce(description, '') || ' ' || coalesce(content, '')));

CREATE INDEX idx_admin_settings_user_key ON admin_settings(user_id, setting_key);

CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_game_id ON user_favorites(game_id);

CREATE INDEX idx_user_ratings_game_id ON user_ratings(game_id);
CREATE INDEX idx_user_ratings_rating ON user_ratings(rating);

CREATE INDEX idx_download_logs_game_id ON download_logs(game_id);
CREATE INDEX idx_download_logs_created_at ON download_logs(created_at);

CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);

-- 创建触发器函数 (自动更新时间戳)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 应用触发器到相关表
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at 
    BEFORE UPDATE ON games 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at 
    BEFORE UPDATE ON admin_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ratings_updated_at 
    BEFORE UPDATE ON user_ratings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建函数：自动生成 slug
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(
        regexp_replace(title, '[^a-zA-Z0-9\u4e00-\u9fa5]+', '-', 'g'),
        '^-+|-+$', '', 'g'
    ));
END;
$$ LANGUAGE plpgsql;

-- 创建函数：更新游戏统计
CREATE OR REPLACE FUNCTION update_game_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 更新分类游戏数量
        UPDATE categories 
        SET games_count = games_count + 1 
        WHERE id = NEW.category_id;
        
        -- 更新游戏评分
        IF NEW.rating IS NOT NULL THEN
            UPDATE games 
            SET 
                rating = (
                    SELECT AVG(rating)::DECIMAL(3,2) 
                    FROM user_ratings 
                    WHERE game_id = NEW.game_id
                ),
                rating_count = (
                    SELECT COUNT(*) 
                    FROM user_ratings 
                    WHERE game_id = NEW.game_id
                )
            WHERE id = NEW.game_id;
        END IF;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 更新分类游戏数量
        UPDATE categories 
        SET games_count = games_count - 1 
        WHERE id = OLD.category_id;
        
        -- 更新游戏评分
        UPDATE games 
        SET 
            rating = COALESCE((
                SELECT AVG(rating)::DECIMAL(3,2) 
                FROM user_ratings 
                WHERE game_id = OLD.game_id
            ), 0),
            rating_count = (
                SELECT COUNT(*) 
                FROM user_ratings 
                WHERE game_id = OLD.game_id
            )
        WHERE id = OLD.game_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 应用统计触发器
CREATE TRIGGER update_game_stats_on_rating
    AFTER INSERT OR DELETE ON user_ratings
    FOR EACH ROW EXECUTE FUNCTION update_game_stats();

-- 创建默认数据
INSERT INTO categories (name, slug, description, color, sort_order) VALUES
('动作冒险', 'action-adventure', '经典的马里奥动作冒险游戏', '#FF6B6B', 1),
('角色扮演', 'rpg', '马里奥RPG系列游戏', '#4ECDC4', 2),
('竞速游戏', 'racing', '马里奥赛车系列', '#45B7D1', 3),
('益智游戏', 'puzzle', '马里奥解谜益智游戏', '#96CEB4', 4),
('体感游戏', 'motion', '需要体感操作的马里奥游戏', '#FFEAA7', 5),
('派对游戏', 'party', '马里奥派对系列', '#DDA0DD', 6);

-- 创建默认管理员用户 (开发环境)
INSERT INTO users (
    email, 
    password_hash, 
    username, 
    role, 
    is_active, 
    email_verified
) VALUES (
    'admin@warpzonegems.com',
    crypt('admin123', gen_salt('bf')),
    'admin',
    'admin',
    true,
    true
);

-- 创建视图：游戏统计概览
CREATE VIEW game_stats_overview AS
SELECT 
    g.id,
    g.title,
    g.slug,
    g.category,
    g.view_count,
    g.download_count,
    g.like_count,
    g.rating,
    g.rating_count,
    g.is_featured,
    g.is_hot,
    g.status,
    g.published_at,
    u.username as author_name,
    c.name as category_name,
    c.color as category_color
FROM games g
LEFT JOIN users u ON g.created_by = u.id
LEFT JOIN categories c ON g.category_id = c.id
WHERE g.status = 'published'
ORDER BY g.published_at DESC;

-- 创建视图：用户活动统计
CREATE VIEW user_activity_stats AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.role,
    u.login_count,
    u.last_login_at,
    COUNT(DISTINCT uf.game_id) as favorites_count,
    COUNT(DISTINCT ur.game_id) as ratings_count,
    COUNT(DISTINCT dl.game_id) as downloads_count,
    u.created_at
FROM users u
LEFT JOIN user_favorites uf ON u.id = uf.user_id
LEFT JOIN user_ratings ur ON u.id = ur.user_id
LEFT JOIN download_logs dl ON u.id = dl.user_id
GROUP BY u.id, u.username, u.email, u.role, u.login_count, u.last_login_at, u.created_at;

-- 创建清理过期会话的函数
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    INSERT INTO system_logs (level, message, context)
    VALUES ('INFO', 'Cleaned up expired sessions', 
            json_build_object('deleted_count', deleted_count));
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 权限设置 (根据实际情况调整)
-- 创建只读用户角色
CREATE ROLE readonly;
GRANT CONNECT ON DATABASE warp_zone_gems TO readonly;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;

-- 创建应用用户角色
CREATE ROLE app_user;
GRANT CONNECT ON DATABASE warp_zone_gems TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

COMMENT ON TABLE users IS '用户表 - 存储所有用户信息';
COMMENT ON TABLE user_sessions IS '用户会话表 - JWT令牌管理';
COMMENT ON TABLE categories IS '游戏分类表';
COMMENT ON TABLE games IS '游戏内容表 - 主要业务数据';
COMMENT ON TABLE admin_settings IS '管理员设置表';
COMMENT ON TABLE user_favorites IS '用户收藏表';
COMMENT ON TABLE user_ratings IS '用户评分表';
COMMENT ON TABLE download_logs IS '下载记录表';
COMMENT ON TABLE system_logs IS '系统日志表';