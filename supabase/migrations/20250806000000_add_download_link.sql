-- Add download_link column to games table
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS download_link TEXT;