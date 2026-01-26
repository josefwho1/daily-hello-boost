import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useGuestMode } from './useGuestMode';

// Unified progress interface that works for both guest and authenticated users
export interface UnifiedProgress {
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
  onboarding_completed_at?: string;
  last_hello_at?: string;
  daily_path_selected_at?: string;
  chill_path_selected_at?: string;
  username?: string;
}

export interface UnifiedHelloLog {
  id: string;
  name: string | null;
  notes: string | null;
  location?: string | null;
  rating: 'positive' | 'neutral' | 'negative' | null;
  difficulty_rating: number | null;
  created_at: string;
  timezone_offset: string;
}

export const useUnifiedProgress = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    guestProgress, 
    guestLogs, 
    loading: guestLoading, 
    updateProgress: updateGuestProgress,
    addLog: addGuestLog,
    shouldShowSavePrompt,
    dismissSavePrompt,
    guestState,
    isGuest
  } = useGuestMode();
  
  const [cloudProgress, setCloudProgress] = useState<UnifiedProgress | null>(null);
  const [cloudLogs, setCloudLogs] = useState<UnifiedHelloLog[]>([]);
  const [cloudLoading, setCloudLoading] = useState(true);

  // Fetch cloud data for authenticated users
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setCloudProgress(null);
      setCloudLogs([]);
      setCloudLoading(false);
      return;
    }

    const fetchCloudData = async () => {
      setCloudLoading(true);
      try {
        // Fetch progress
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setCloudProgress(progressData);

        // Fetch logs
        const { data: logsData } = await supabase
          .from('hello_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        setCloudLogs((logsData || []) as UnifiedHelloLog[]);
      } catch (error) {
        console.error('Error fetching cloud data:', error);
      } finally {
        setCloudLoading(false);
      }
    };

    fetchCloudData();
  }, [user, authLoading]);

  // Unified getters
  const progress: UnifiedProgress | null = user ? cloudProgress : (guestProgress ? {
    current_streak: guestProgress.current_streak,
    current_day: guestProgress.current_day,
    last_completed_date: guestProgress.last_completed_date,
    selected_pack_id: guestProgress.selected_pack_id,
    mode: guestProgress.mode,
    target_hellos_per_week: guestProgress.target_hellos_per_week,
    hellos_this_week: guestProgress.hellos_this_week,
    weekly_streak: guestProgress.weekly_streak,
    daily_streak: guestProgress.daily_streak,
    longest_streak: guestProgress.longest_streak,
    is_onboarding_week: guestProgress.is_onboarding_week,
    onboarding_week_start: guestProgress.onboarding_week_start || undefined,
    week_start_date: guestProgress.week_start_date || undefined,
    has_completed_onboarding: guestProgress.has_completed_onboarding,
    orbs: guestProgress.orbs,
    has_received_first_orb: guestProgress.has_received_first_orb,
    total_hellos: guestProgress.total_hellos,
    total_xp: guestProgress.total_xp,
    current_level: guestProgress.current_level,
    hellos_today_count: guestProgress.hellos_today_count,
    names_today_count: guestProgress.names_today_count,
    notes_today_count: guestProgress.notes_today_count,
    last_xp_reset_date: guestProgress.last_xp_reset_date || undefined,
    username: guestProgress.username,
  } : null);

  const logs: UnifiedHelloLog[] = user ? cloudLogs : guestLogs;
  const loading = authLoading || (user ? cloudLoading : guestLoading);

  // Update progress - works for both modes
  const updateProgress = useCallback(async (updates: Partial<UnifiedProgress>) => {
    if (user) {
      // Update cloud progress
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .update(updates)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        setCloudProgress(data);
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    } else {
      // Update guest progress
      await updateGuestProgress(updates);
    }
  }, [user, updateGuestProgress]);

  // Add log - works for both modes
  const addLog = useCallback(async (log: {
    name?: string;
    notes?: string;
    location?: string;
    rating?: 'positive' | 'neutral' | 'negative';
    difficulty_rating?: number;
  }) => {
    if (user) {
      // Add to cloud
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('timezone_preference')
          .eq('id', user.id)
          .maybeSingle();

        const timezoneOffset = profile?.timezone_preference || '+00:00';

        const { data, error } = await supabase
          .from('hello_logs')
          .insert({
            user_id: user.id,
            name: log.name || null,
            notes: log.notes || null,
            location: log.location || null,
            rating: log.rating || null,
            difficulty_rating: log.difficulty_rating || null,
            timezone_offset: timezoneOffset
          })
          .select()
          .single();

        if (error) throw error;
        setCloudLogs(prev => [data as UnifiedHelloLog, ...prev]);
        return data;
      } catch (error) {
        console.error('Error adding log:', error);
        return null;
      }
    } else {
      // Add to guest storage
      const timezoneOffset = '+00:00'; // Guest uses default
      return await addGuestLog({
        name: log.name || null,
        notes: log.notes || null,
        location: log.location || null,
        rating: log.rating || null,
        difficulty_rating: log.difficulty_rating || null,
        timezone_offset: timezoneOffset
      });
    }
  }, [user, addGuestLog]);

  // Refetch function
  const refetch = useCallback(async () => {
    if (!user) return;
    
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    setCloudProgress(progressData);

    const { data: logsData } = await supabase
      .from('hello_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    setCloudLogs((logsData || []) as UnifiedHelloLog[]);
  }, [user]);

  return {
    progress,
    logs,
    loading,
    updateProgress,
    addLog,
    refetch,
    // Guest-specific features
    isGuest,
    shouldShowSavePrompt,
    dismissSavePrompt,
    totalHellosLogged: guestState?.total_hellos_logged || 0,
  };
};
