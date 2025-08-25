-- Fix schema for proper data synchronization
-- This migration ensures database schema matches frontend JSON structure

-- 1. Add missing columns if they don't exist (some may have been added in previous migrations)
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS download_link TEXT;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- 2. Add a unique slug/identifier column to help with data synchronization
-- This will store the original string IDs from JSON (like "cyberpunk-2077")
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 3. Update existing records to have default values
UPDATE public.games SET 
  view_count = COALESCE(view_count, 0),
  download_count = COALESCE(download_count, 0),
  status = COALESCE(status, 'published'),
  download_link = COALESCE(download_link, '#')
WHERE view_count IS NULL OR download_count IS NULL OR status IS NULL OR download_link IS NULL;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_games_category ON public.games(category);
CREATE INDEX IF NOT EXISTS idx_games_slug ON public.games(slug);
CREATE INDEX IF NOT EXISTS idx_games_published_at ON public.games(published_at DESC);

-- 5. Add check constraints for data integrity
ALTER TABLE public.games ADD CONSTRAINT IF NOT EXISTS check_status 
  CHECK (status IN ('published', 'draft', 'archived'));

ALTER TABLE public.games ADD CONSTRAINT IF NOT EXISTS check_view_count_positive 
  CHECK (view_count >= 0);

ALTER TABLE public.games ADD CONSTRAINT IF NOT EXISTS check_download_count_positive 
  CHECK (download_count >= 0);

-- 6. Update categories table to match frontend structure
-- Drop existing categories and recreate with proper data
TRUNCATE public.categories;

INSERT INTO public.categories (name, slug, description, color) VALUES
('3A游戏', 'aaa-games', '顶级制作的大型游戏作品', '#dc2626'),
('赛车游戏', 'racing', '高速竞技赛车游戏', '#3b82f6'),  
('动作游戏', 'action', '紧张刺激的动作冒险游戏', '#f59e0b'),
('冒险游戏', 'adventure', '探索未知世界的冒险之旅', '#10b981'),
('解谜游戏', 'puzzle', '考验智慧的解谜益智游戏', '#8b5cf6');

-- 7. Add helpful comments
COMMENT ON COLUMN public.games.slug IS '游戏的唯一标识符，用于前后端数据同步';
COMMENT ON COLUMN public.games.view_count IS '游戏查看次数统计';
COMMENT ON COLUMN public.games.download_count IS '游戏下载次数统计'; 
COMMENT ON COLUMN public.games.status IS '游戏发布状态：published, draft, archived';
COMMENT ON COLUMN public.games.download_link IS '游戏下载链接';

-- 8. Create function for automatic slug generation
CREATE OR REPLACE FUNCTION public.generate_slug_from_title(title_text TEXT)
RETURNS TEXT AS $$
DECLARE
  slug_text TEXT;
BEGIN
  -- Simple slug generation - in production you might want more sophisticated logic
  slug_text := LOWER(TRIM(title_text));
  slug_text := REGEXP_REPLACE(slug_text, '[^\w\s-]', '', 'g'); -- Remove special characters
  slug_text := REGEXP_REPLACE(slug_text, '\s+', '-', 'g'); -- Replace spaces with hyphens
  slug_text := REGEXP_REPLACE(slug_text, '-+', '-', 'g'); -- Replace multiple hyphens with single
  RETURN TRIM(slug_text, '-');
END;
$$ LANGUAGE plpgsql;

-- 9. Add trigger to auto-generate slugs if not provided
CREATE OR REPLACE FUNCTION public.ensure_game_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_slug_from_title(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_games_slug
  BEFORE INSERT OR UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_game_slug();