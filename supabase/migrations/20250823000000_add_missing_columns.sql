-- Add missing columns to games table for frontend data compatibility
-- Fixes sync issue: "Could not find the download_count column of 'games' in the schema cache"

-- Add view_count column
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add download_count column  
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- Add status column
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(status);
CREATE INDEX IF NOT EXISTS idx_games_download_count ON public.games(download_count);

-- Update existing rows to have default values if needed
UPDATE public.games SET view_count = 0 WHERE view_count IS NULL;
UPDATE public.games SET download_count = 0 WHERE download_count IS NULL;
UPDATE public.games SET status = 'published' WHERE status IS NULL;

-- Comment explaining the change
COMMENT ON COLUMN public.games.view_count IS '游戏查看次数统计';
COMMENT ON COLUMN public.games.download_count IS '游戏下载次数统计'; 
COMMENT ON COLUMN public.games.status IS '游戏发布状态：published, draft, archived';