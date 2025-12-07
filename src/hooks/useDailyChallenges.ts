import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  day_of_year: number;
}

export const useDailyChallenges = () => {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_challenges')
        .select('*')
        .order('day_of_year', { ascending: true });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching daily challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTodaysChallenge = (): DailyChallenge | null => {
    if (challenges.length === 0) return null;
    
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    // Rotate through challenges based on day of year
    const challengeIndex = dayOfYear % challenges.length;
    return challenges[challengeIndex] || null;
  };

  return {
    challenges,
    loading,
    getTodaysChallenge
  };
};
