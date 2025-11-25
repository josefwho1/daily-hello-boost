import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChallengeCompletion {
  id: string;
  challenge_day: number;
  completed_at: string;
  interaction_name: string | null;
  notes: string | null;
  rating: 'positive' | 'neutral' | 'negative';
  difficulty_rating: number | null;
}

export const useChallengeCompletions = () => {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<ChallengeCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchCompletions();
  }, [user]);

  const fetchCompletions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('challenge_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setCompletions(data || []);
    } catch (error) {
      console.error('Error fetching completions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCompletion = async (completion: {
    challenge_day: number;
    interaction_name: string | null;
    notes: string | null;
    rating: 'positive' | 'neutral' | 'negative';
    difficulty_rating: number | null;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('challenge_completions')
        .insert({
          user_id: user.id,
          ...completion
        })
        .select()
        .single();

      if (error) throw error;
      setCompletions([data, ...completions]);
      return data;
    } catch (error) {
      console.error('Error adding completion:', error);
      throw error;
    }
  };

  const clearCompletions = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('challenge_completions')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setCompletions([]);
    } catch (error) {
      console.error('Error clearing completions:', error);
    }
  };

  return {
    completions,
    loading,
    addCompletion,
    clearCompletions,
    refetch: fetchCompletions
  };
};
