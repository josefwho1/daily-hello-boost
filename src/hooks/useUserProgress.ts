import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserProgress {
  current_streak: number;
  current_day: number;
  last_completed_date: string | null;
  has_seen_welcome_messages?: boolean;
  selected_pack_id?: string;
  mode?: string;
  target_hellos_per_week?: number;
  hellos_this_week?: number;
  weekly_streak?: number;
  daily_streak?: number;
  longest_streak?: number;
  is_onboarding_week?: boolean;
  onboarding_week_start?: string;
  week_start_date?: string;
  has_completed_onboarding?: boolean;
  why_here?: string;
  streak_savers?: number;
}

export const useUserProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchProgress();
  }, [user]);

  const fetchProgress = async () => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      // Try to load existing progress first
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProgress(data);
        return;
      }

      // No progress found – ensure a profile exists for this user
      const profileName = (user.user_metadata as { name?: string } | null)?.name || 'User';

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          { id: user.id, username: profileName },
          { onConflict: 'id' }
        );

      if (profileError && profileError.code !== '23505') {
        // Log but don't block progress creation if profile already exists or conflicts
        console.error('Error ensuring profile exists:', profileError);
      }

      // Check again in case database trigger created progress when profile was inserted
      const { data: progressAfterProfile, error: progressError2 } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (progressError2) throw progressError2;

      if (progressAfterProfile) {
        setProgress(progressAfterProfile);
        return;
      }

      // Still no progress – create initial progress directly
      const { data: newData, error: insertError } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          current_streak: 0,
          current_day: 1,
          last_completed_date: null
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setProgress(newData);
    } catch (error) {
      console.error('Error fetching progress:', error);
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<UserProgress>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProgress(data);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const resetProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .update({
          current_streak: 0,
          current_day: 1,
          last_completed_date: null
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProgress(data);
    } catch (error) {
      console.error('Error resetting progress:', error);
    }
  };

  return {
    progress,
    loading,
    updateProgress,
    resetProgress,
    refetch: fetchProgress
  };
};
