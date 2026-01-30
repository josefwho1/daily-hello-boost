import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserProgress {
  current_streak: number;
  current_day: number;
  last_completed_date: string | null;
  has_seen_welcome_messages?: boolean;
  selected_pack_id?: string | null;
  pack_start_date?: string | null;
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
  total_xp?: number;
  current_level?: number;
  hellos_today_count?: number;
  names_today_count?: number;
  notes_today_count?: number;
  last_xp_reset_date?: string;
  current_phase?: string;
  onboarding_email_opt_in?: boolean;
  daily_email_opt_in?: boolean;
  chill_email_opt_in?: boolean;
  onboarding_completed_at?: string | null;
  last_hello_at?: string;
  daily_path_selected_at?: string;
  chill_path_selected_at?: string;
  // Daily Mode fields
  daily_mode_active?: boolean;
  daily_mode_current_streak?: number;
  daily_mode_best_streak?: number;
  daily_mode_start_date?: string | null;
  daily_mode_last_hello_date?: string | null;
  daily_mode_morning_reminder_shown_date?: string | null;
  daily_mode_afternoon_reminder_shown_date?: string | null;
}

const QUERY_KEY = ['user-progress'];

export const useUserProgressQuery = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading: loading, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<UserProgress | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Normalize legacy data
      const legacyCompleted = !data.has_completed_onboarding && Boolean((data as any).onboarding_completed_at);
      const legacyMode = data.mode === 'first_hellos';

      return {
        ...(data as any),
        has_completed_onboarding: Boolean(data.has_completed_onboarding) || legacyCompleted,
        mode: legacyMode ? 'daily' : data.mode,
        is_onboarding_week: legacyCompleted ? false : data.is_onboarding_week,
        current_phase: legacyCompleted ? 'active' : data.current_phase,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<UserProgress>) => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('user_progress')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data);
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user');

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
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data);
    },
  });

  return {
    progress: progress ?? null,
    loading,
    updateProgress: updateMutation.mutateAsync,
    resetProgress: resetMutation.mutateAsync,
    refetch,
  };
};
