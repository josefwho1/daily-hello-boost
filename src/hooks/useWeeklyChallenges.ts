import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WeeklyChallenge {
  id: string;
  week_number: number;
  title: string;
  description: string;
}

export const useWeeklyChallenges = () => {
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_challenges')
        .select('*')
        .order('week_number', { ascending: true });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching weekly challenges:', error);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  // Get the current week's challenge based on weeks since app launch or user signup
  const getCurrentChallenge = (weeksSinceStart: number = 0) => {
    if (challenges.length === 0) return null;
    // Rotate through challenges based on week number
    const index = weeksSinceStart % challenges.length;
    return challenges[index];
  };

  return {
    challenges,
    loading,
    getCurrentChallenge,
    refetch: fetchChallenges
  };
};
