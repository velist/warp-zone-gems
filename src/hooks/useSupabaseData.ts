import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Game {
  id: string;
  title: string;
  description?: string;
  content?: string;
  cover_image?: string;
  category: string;
  tags?: string[];
  author?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  created_at: string;
}

export const useSupabaseData = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch games
        const { data: gamesData, error: gamesError } = await supabase
          .from('games')
          .select('*')
          .order('published_at', { ascending: false });

        if (gamesError) {
          throw gamesError;
        }

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (categoriesError) {
          throw categoriesError;
        }

        setGames(gamesData || []);
        setCategories(categoriesData || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    games,
    categories,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      // Re-run the fetch logic
    }
  };
};