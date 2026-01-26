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
  orbs?: number;
  last_weekly_challenge_date?: string;
  save_offered_for_date?: string;
  has_received_first_orb?: boolean;
  total_hellos?: number;
  weekly_goal_achieved_this_week?: boolean;
  // XP System fields
  total_xp?: number;
  current_level?: number;
  hellos_today_count?: number;
  names_today_count?: number;
  notes_today_count?: number;
  last_xp_reset_date?: string;
  // Email notification fields
  current_phase?: string;
  onboarding_email_opt_in?: boolean;
  daily_email_opt_in?: boolean;
  chill_email_opt_in?: boolean;
  onboarding_completed_at?: string | null;
  last_hello_at?: string;
  daily_path_selected_at?: string;
  chill_path_selected_at?: string;
}

export const useUserProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchProgress();
  }, [user]);

  const fetchProgress = async () => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      // Try to load existing progress
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const legacyCompleted = !data.has_completed_onboarding && Boolean((data as any).onboarding_completed_at);
        const legacyMode = data.mode === 'first_hellos';

        const normalized: UserProgress = {
          ...(data as any),
          has_completed_onboarding: Boolean(data.has_completed_onboarding) || legacyCompleted,
          mode: legacyMode ? 'daily' : data.mode,
          // If legacy onboarding is completed, ensure we don't keep onboarding flags around.
          is_onboarding_week: legacyCompleted ? false : data.is_onboarding_week,
          current_phase: legacyCompleted ? 'active' : data.current_phase,
        };

        setProgress(normalized);

        // Best-effort cleanup in the background so guards stop looping.
        if ((legacyCompleted || legacyMode) && user) {
          supabase
            .from('user_progress')
            .update({
              has_completed_onboarding: true,
              is_onboarding_week: false,
              current_phase: legacyCompleted ? 'active' : data.current_phase,
              mode: 'daily',
            })
            .eq('user_id', user.id)
            .then(() => {
              // no-op
            });
        }
      } else {
        // No progress found - don't create default progress here
        // Let the routing redirect to onboarding which will create proper progress
        setProgress(null);
      }
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
