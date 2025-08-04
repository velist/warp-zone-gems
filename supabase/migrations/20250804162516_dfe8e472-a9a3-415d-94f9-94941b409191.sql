-- Create games table for storing game resources
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  cover_image TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (since it's a public game resource site)
CREATE POLICY "Games are publicly readable" 
ON public.games 
FOR SELECT 
USING (true);

-- Create policy for authenticated users to insert/update games
CREATE POLICY "Authenticated users can insert games" 
ON public.games 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update games" 
ON public.games 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#FF6B6B',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public read access for categories
CREATE POLICY "Categories are publicly readable" 
ON public.categories 
FOR SELECT 
USING (true);

-- Insert some default categories
INSERT INTO public.categories (name, slug, description, color) VALUES
('动作冒险', 'action-adventure', '刺激的动作和冒险游戏', '#FF6B6B'),
('角色扮演', 'rpg', '沉浸式角色扮演游戏', '#4ECDC4'),
('策略游戏', 'strategy', '考验智慧的策略游戏', '#45B7D1'),
('休闲益智', 'puzzle', '轻松有趣的益智游戏', '#96CEB4'),
('竞速游戏', 'racing', '速度与激情的竞速游戏', '#FFEAA7'),
('体感游戏', 'motion', '体感互动游戏', '#DDA0DD');

-- Insert some sample games data
INSERT INTO public.games (title, description, content, cover_image, category, tags, author) VALUES
('超级马里奥：奥德赛', '马里奥的全新3D冒险之旅，探索未知的王国', '在这款革命性的3D平台游戏中，马里奥将前往全新的王国展开冒险。游戏采用了创新的帽子机制，让玩家可以控制各种敌人和物体。每个王国都有独特的环境和挑战，从繁华的都市到神秘的森林，每一处都充满了惊喜。游戏的画面表现力极佳，音乐也十分出色，是Switch平台必玩的游戏之一。', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&h=300&fit=crop', '动作冒险', ARRAY['3D平台', '冒险', '任天堂'], '任天堂'),
('塞尔达传说：王国之泪', '海拉鲁的全新冒险等待着你', '作为《荒野之息》的续作，这款游戏在保持前作优秀基础的同时，加入了更多创新元素。新的天空岛屿、地下洞穴为探索增添了立体感。组合建造系统让玩家可以发挥创意，制作各种工具和载具。故事剧情更加丰富，画面表现更上一层楼。', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop', '动作冒险', ARRAY['开放世界', '冒险', 'RPG元素'], '任天堂'),
('马里奥赛车8：豪华版', '最受欢迎的卡丁车竞速游戏', '这款游戏包含了48条赛道，支持最多4人本地游戏和12人在线游戏。游戏操作简单易上手，但要精通却需要大量练习。赛道设计充满创意，从经典的马里奥赛道到全新的设计都令人印象深刻。', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&h=300&fit=crop', '竞速游戏', ARRAY['竞速', '多人游戏', '休闲'], '任天堂'),
('集合啦！动物森友会', '在无人岛上建造属于你的理想生活', '这是一款生活模拟游戏，玩家可以在无人岛上自由建造和装饰。游戏采用实时系统，不同的季节和时间会有不同的活动和景色。可以钓鱼、捉虫、种花，还可以邀请朋友来参观你的岛屿。', 'https://images.unsplash.com/photo-1578408443895-97ac2fc01e78?w=500&h=300&fit=crop', '休闲益智', ARRAY['生活模拟', '休闲', '多人游戏'], '任天堂');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();