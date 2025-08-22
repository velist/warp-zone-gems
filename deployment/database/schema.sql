-- Warp Zone Gems 数据库架构
-- 适用于 PostgreSQL (Supabase)

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 游戏分类表
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3b82f6',
    icon VARCHAR(50) DEFAULT '🎮',
    games_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 游戏表
CREATE TABLE IF NOT EXISTS games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    content TEXT,
    cover_image TEXT,
    category VARCHAR(100) NOT NULL,
    tags TEXT[],
    author VARCHAR(100),
    download_link TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0.0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 外键关系
    CONSTRAINT fk_games_category FOREIGN KEY (category) REFERENCES categories(name) ON UPDATE CASCADE
);

-- 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 唯一约束：每个用户对每个游戏只能收藏一次
    UNIQUE(user_id, game_id)
);

-- 用户评分表
CREATE TABLE IF NOT EXISTS user_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 唯一约束：每个用户对每个游戏只能评分一次
    UNIQUE(user_id, game_id)
);

-- 管理员设置表
CREATE TABLE IF NOT EXISTS admin_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    silicon_flow_api_key TEXT,
    preferred_ai_model VARCHAR(100) DEFAULT 'Qwen/Qwen2.5-7B-Instruct',
    imgbb_api_key TEXT,
    site_title VARCHAR(200) DEFAULT 'Warp Zone Gems',
    site_description TEXT DEFAULT '精品游戏资源分享平台',
    site_keywords TEXT DEFAULT '游戏,3A游戏,赛车游戏,动作游戏,冒险游戏,解谜游戏',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 每个用户只能有一个设置记录
    UNIQUE(user_id)
);

-- 导航菜单配置表
CREATE TABLE IF NOT EXISTS navigation_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    path VARCHAR(500) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Menu',
    description TEXT,
    visible BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    item_type VARCHAR(20) DEFAULT 'page' CHECK (item_type IN ('page', 'category', 'external')),
    target VARCHAR(10) DEFAULT '_self' CHECK (target IN ('_self', '_blank')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 网站统计表
CREATE TABLE IF NOT EXISTS site_statistics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    total_games INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    total_downloads INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_games_category ON games(category);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_published_at ON games(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_view_count ON games(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_games_download_count ON games(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_games_rating ON games(rating DESC);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_game_id ON user_favorites(game_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_game_id ON user_ratings(game_id);
CREATE INDEX IF NOT EXISTS idx_navigation_items_visible ON navigation_items(visible);
CREATE INDEX IF NOT EXISTS idx_navigation_items_order ON navigation_items(order_index);

-- 创建全文搜索索引
CREATE INDEX IF NOT EXISTS idx_games_search ON games USING GIN (
    to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || array_to_string(tags, ' '))
);

-- 创建触发器函数：自动更新 updated_at 时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建触发器
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_ratings_updated_at BEFORE UPDATE ON user_ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_navigation_items_updated_at BEFORE UPDATE ON navigation_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建函数：更新游戏评分
CREATE OR REPLACE FUNCTION update_game_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- 重新计算游戏的平均评分
    UPDATE games 
    SET rating = (
        SELECT COALESCE(AVG(rating::DECIMAL), 0)
        FROM user_ratings 
        WHERE game_id = NEW.game_id
    )
    WHERE id = NEW.game_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建评分更新触发器
CREATE TRIGGER update_game_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_ratings
    FOR EACH ROW EXECUTE FUNCTION update_game_rating();

-- 创建函数：更新分类游戏计数
CREATE OR REPLACE FUNCTION update_category_games_count()
RETURNS TRIGGER AS $$
DECLARE
    old_category VARCHAR(100);
    new_category VARCHAR(100);
BEGIN
    -- INSERT 情况
    IF TG_OP = 'INSERT' THEN
        UPDATE categories 
        SET games_count = games_count + 1 
        WHERE name = NEW.category;
        RETURN NEW;
    END IF;
    
    -- DELETE 情况
    IF TG_OP = 'DELETE' THEN
        UPDATE categories 
        SET games_count = games_count - 1 
        WHERE name = OLD.category AND games_count > 0;
        RETURN OLD;
    END IF;
    
    -- UPDATE 情况
    IF TG_OP = 'UPDATE' THEN
        -- 如果分类改变了
        IF OLD.category != NEW.category THEN
            UPDATE categories 
            SET games_count = games_count - 1 
            WHERE name = OLD.category AND games_count > 0;
            
            UPDATE categories 
            SET games_count = games_count + 1 
            WHERE name = NEW.category;
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 创建分类计数更新触发器
CREATE TRIGGER update_category_games_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON games
    FOR EACH ROW EXECUTE FUNCTION update_category_games_count();

-- 创建行级安全策略 (RLS)

-- 启用RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;

-- Games表策略
-- 所有用户可以查看已发布的游戏
CREATE POLICY "Anyone can view published games" ON games
    FOR SELECT USING (status = 'published');

-- 认证用户可以创建游戏（草稿状态）
CREATE POLICY "Authenticated users can create games" ON games
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 用户可以更新自己创建的游戏或管理员可以更新任何游戏
CREATE POLICY "Users can update own games or admins can update any" ON games
    FOR UPDATE USING (
        auth.uid() = (author::UUID) OR 
        EXISTS (
            SELECT 1 FROM admin_settings 
            WHERE user_id = auth.uid()
        )
    );

-- 用户可以删除自己创建的游戏或管理员可以删除任何游戏  
CREATE POLICY "Users can delete own games or admins can delete any" ON games
    FOR DELETE USING (
        auth.uid() = (author::UUID) OR 
        EXISTS (
            SELECT 1 FROM admin_settings 
            WHERE user_id = auth.uid()
        )
    );

-- Categories表策略
-- 所有人可以查看分类
CREATE POLICY "Anyone can view categories" ON categories
    FOR SELECT USING (true);

-- 只有管理员可以管理分类
CREATE POLICY "Only admins can manage categories" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_settings 
            WHERE user_id = auth.uid()
        )
    );

-- User favorites表策略
-- 用户只能查看和管理自己的收藏
CREATE POLICY "Users can manage own favorites" ON user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- User ratings表策略  
-- 用户只能查看所有评分，但只能管理自己的评分
CREATE POLICY "Anyone can view ratings" ON user_ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own ratings" ON user_ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON user_ratings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings" ON user_ratings
    FOR DELETE USING (auth.uid() = user_id);

-- Admin settings表策略
-- 用户只能查看和管理自己的设置
CREATE POLICY "Users can manage own admin settings" ON admin_settings
    FOR ALL USING (auth.uid() = user_id);

-- Navigation items表策略
-- 所有人可以查看导航项
CREATE POLICY "Anyone can view navigation items" ON navigation_items
    FOR SELECT USING (true);

-- 只有管理员可以管理导航项
CREATE POLICY "Only admins can manage navigation items" ON navigation_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_settings 
            WHERE user_id = auth.uid()
        )
    );

-- 插入初始数据

-- 插入默认分类
INSERT INTO categories (name, slug, description, color, icon, games_count) VALUES
('3A游戏', 'aaa-games', '顶级制作的大型游戏作品', '#dc2626', '🎮', 0),
('赛车游戏', 'racing', '高速竞技赛车游戏', '#3b82f6', '🏎️', 0),
('动作游戏', 'action', '紧张刺激的动作冒险游戏', '#f59e0b', '⚔️', 0),
('冒险游戏', 'adventure', '探索未知世界的冒险之旅', '#10b981', '🗺️', 0),
('解谜游戏', 'puzzle', '考验智慧的解谜益智游戏', '#8b5cf6', '🧩', 0)
ON CONFLICT (name) DO NOTHING;

-- 插入默认导航菜单
INSERT INTO navigation_items (name, path, icon, description, visible, order_index, item_type, target) VALUES
('首页', '/', 'Home', '网站首页', true, 1, 'page', '_self'),
('游戏资源', '/', 'Gamepad2', '游戏资源页面', true, 2, 'page', '_self'),
('分类浏览', '/categories', 'Menu', '游戏分类页面', true, 3, 'page', '_self'),
('关于我们', '/about', 'Info', '关于页面', true, 4, 'page', '_self')
ON CONFLICT DO NOTHING;

-- 初始化网站统计
INSERT INTO site_statistics (total_games, total_users, total_downloads, total_views) 
VALUES (0, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- 创建视图：游戏统计视图
CREATE OR REPLACE VIEW game_stats_view AS
SELECT 
    g.id,
    g.title,
    g.category,
    g.view_count,
    g.download_count,
    g.rating,
    COUNT(uf.id) as favorites_count,
    COUNT(ur.id) as ratings_count
FROM games g
LEFT JOIN user_favorites uf ON g.id = uf.game_id
LEFT JOIN user_ratings ur ON g.id = ur.game_id
WHERE g.status = 'published'
GROUP BY g.id, g.title, g.category, g.view_count, g.download_count, g.rating;

-- 创建视图：热门游戏视图
CREATE OR REPLACE VIEW popular_games_view AS
SELECT *
FROM game_stats_view
ORDER BY 
    (view_count * 0.3 + download_count * 0.5 + rating * favorites_count * 0.2) DESC
LIMIT 20;

-- 创建函数：搜索游戏
CREATE OR REPLACE FUNCTION search_games(search_query TEXT, category_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    title VARCHAR(200),
    description TEXT,
    cover_image TEXT,
    category VARCHAR(100),
    tags TEXT[],
    download_count INTEGER,
    rating DECIMAL(2,1),
    published_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id, g.title, g.description, g.cover_image, g.category, 
        g.tags, g.download_count, g.rating, g.published_at
    FROM games g
    WHERE 
        g.status = 'published' AND
        (category_filter IS NULL OR g.category = category_filter) AND
        (
            search_query IS NULL OR 
            search_query = '' OR
            to_tsvector('english', g.title || ' ' || COALESCE(g.description, '') || ' ' || array_to_string(g.tags, ' ')) 
            @@ plainto_tsquery('english', search_query)
        )
    ORDER BY 
        CASE 
            WHEN search_query IS NOT NULL AND search_query != '' THEN
                ts_rank(
                    to_tsvector('english', g.title || ' ' || COALESCE(g.description, '') || ' ' || array_to_string(g.tags, ' ')),
                    plainto_tsquery('english', search_query)
                )
            ELSE 0
        END DESC,
        g.published_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 创建函数：获取推荐游戏
CREATE OR REPLACE FUNCTION get_recommended_games(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    title VARCHAR(200),
    description TEXT,
    cover_image TEXT,
    category VARCHAR(100),
    download_count INTEGER,
    rating DECIMAL(2,1)
) AS $$
BEGIN
    RETURN QUERY
    -- 基于用户收藏的同类游戏推荐
    WITH user_categories AS (
        SELECT DISTINCT g.category
        FROM user_favorites uf
        JOIN games g ON uf.game_id = g.id
        WHERE uf.user_id = user_uuid
    ),
    recommended AS (
        SELECT DISTINCT g.id, g.title, g.description, g.cover_image, g.category, 
               g.download_count, g.rating
        FROM games g
        JOIN user_categories uc ON g.category = uc.category
        LEFT JOIN user_favorites uf ON g.id = uf.game_id AND uf.user_id = user_uuid
        WHERE 
            g.status = 'published' 
            AND uf.id IS NULL  -- 排除已收藏的游戏
        ORDER BY g.rating DESC, g.download_count DESC
        LIMIT limit_count
    )
    SELECT * FROM recommended;
END;
$$ LANGUAGE plpgsql;

-- 创建定期任务：更新网站统计
-- 注意：此函数需要通过 pg_cron 扩展或外部定时任务调用
CREATE OR REPLACE FUNCTION update_site_statistics()
RETURNS VOID AS $$
BEGIN
    UPDATE site_statistics SET
        total_games = (SELECT COUNT(*) FROM games WHERE status = 'published'),
        total_users = (SELECT COUNT(*) FROM auth.users),
        total_downloads = (SELECT COALESCE(SUM(download_count), 0) FROM games),
        total_views = (SELECT COALESCE(SUM(view_count), 0) FROM games),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 完成数据库架构设置
SELECT 'Database schema setup completed successfully!' as status;