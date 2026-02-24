import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserProgressQuery } from './useUserProgressQuery';
import { useQuery } from '@tanstack/react-query';

export interface GuestProgress {
  id?: string;
  user_id: string;
  current_streak: number;
  current_day: number;
  last_completed_date: string | null;
  target_hellos_per_week: number;
  hellos_this_week: number;
  weekly_streak: number;
  daily_streak: number;
  longest_streak: number;
  is_onboarding_week: boolean;
  onboarding_week_start: string | null;
  week_start_date: string | null;
  has_completed_onboarding: boolean;
  has_seen_welcome_messages?: boolean;
  orbs: number;
  has_received_first_orb: boolean;
  total_hellos: number;
  total_xp: number;
  current_level: number;
  hellos_today_count: number;
  names_today_count: number;
  notes_today_count: number;
  last_xp_reset_date: string | null;
  mode: string;
  why_here: string | null;
  selected_pack_id: string | null;
  pack_start_date: string | null;
  comfort_rating: number | null;
  username?: string;
}

export interface GuestHelloLog {
  id: string;
  user_id: string;
  name: string | null;
  notes: string | null;
  location?: string | null;
  rating: 'positive' | 'neutral' | 'negative' | null;
  difficulty_rating: number | null;
  created_at: string;
  timezone_offset: string;
}

export interface UseGuestModeReturn {
  // State
  isGuest: boolean;
  isAnonymous: boolean;
  guestState: { account_linked: boolean; total_hellos_logged: number } | null;
  guestProgress: GuestProgress | null;
  guestLogs: GuestHelloLog[];
  loading: boolean;
  
  // Progress operations
  updateProgress: (updates: Partial<GuestProgress>) => Promise<void>;
  
  // Hello log operations
  addLog: (log: Omit<GuestHelloLog, 'id' | 'created_at' | 'user_id'>) => Promise<GuestHelloLog | null>;
  updateLog: (id: string, updates: Partial<GuestHelloLog>) => Promise<void>;
  
  // Challenge completion operations
  clearPackCompletions: (packId: string) => Promise<void>;
  
  // Save prompt tracking
  shouldShowSavePrompt: () => boolean;
  dismissSavePrompt: () => Promise<void>;
  
  // Sync operations - linking anonymous to email
  linkToEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  
  // Refetch
  refetch: () => Promise<void>;
  
  // Initialize anonymous user
  initializeAnonymous: () => Promise<{ success: boolean; userId?: string; error?: string }>;
}

// Trigger save prompt at specific hello milestones
const SAVE_PROMPT_TRIGGERS = [2, 8, 15];
const PROMPT_COOLDOWN_HOURS = 24;

export const useGuestMode = (): UseGuestModeReturn => {
  const { user, loading: authLoading } = useAuth();
  
  // Use shared React Query for progress data — deduplicates across all consumers
  const { progress: queryProgress, loading: progressLoading, updateProgress: updateQueryProgress, refetch: refetchProgress } = useUserProgressQuery();
  
  const [sessionPromptShown, setSessionPromptShown] = useState(false);
  const [lastPromptShownAt, setLastPromptShownAt] = useState<string | null>(null);

  // Use React Query for is_anonymous check — shared cache across all useGuestMode consumers
  const { data: profileIsAnonymous, isLoading: profileLoading } = useQuery({
    queryKey: ['profile-is-anonymous', user?.id],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_anonymous')
        .eq('id', user!.id)
        .maybeSingle();
      return profile?.is_anonymous ?? null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Check if user is an anonymous user
  const isAnonymous = profileIsAnonymous ?? user?.is_anonymous === true;
  const isGuest = isAnonymous;

  // Derive guestProgress from shared React Query data (no separate fetch)
  const guestProgress = isAnonymous && queryProgress ? queryProgress as unknown as GuestProgress : null;

  // Simulated guest state for compatibility
  const guestState = isAnonymous ? {
    account_linked: false,
    total_hellos_logged: guestProgress?.total_hellos || 0,
  } : null;

  // Loading: auth + profile anonymous check + (if anonymous) progress query
  const loading = authLoading || (!!user && profileLoading) || (isAnonymous && progressLoading);

  // Initialize anonymous auth for guests
  const initializeAnonymous = useCallback(async (): Promise<{ success: boolean; userId?: string; error?: string }> => {
    try {
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession?.user) {
        return { success: true, userId: existingSession.user.id };
      }

      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error('Error signing in anonymously:', error);
        return { success: false, error: error.message };
      }

      const userId = data.user?.id;
      if (!userId) {
        return { success: false, error: 'No user ID returned' };
      }

      await supabase.from('profiles').upsert({
        id: userId,
        username: 'Guest',
        is_anonymous: true,
        hide_from_leaderboard: false,
      }, { onConflict: 'id' });

      await supabase.from('user_progress').upsert({
        user_id: userId,
        current_streak: 0,
        current_day: 1,
        is_onboarding_week: false,
        mode: 'daily',
        selected_pack_id: '30-day-hello',
        has_completed_onboarding: false,
        orbs: 0,
        has_received_first_orb: false,
      }, { onConflict: 'user_id' });

      return { success: true, userId };
    } catch (error) {
      console.error('Error initializing anonymous auth:', error);
      return { success: false, error: 'Failed to initialize' };
    }
  }, []);

  // Update progress using shared React Query mutation
  const updateProgress = useCallback(async (updates: Partial<GuestProgress>) => {
    if (!user || !isAnonymous) return;
    await updateQueryProgress(updates as any);
  }, [user, isAnonymous, updateQueryProgress]);

  const addLog = useCallback(async (log: Omit<GuestHelloLog, 'id' | 'created_at' | 'user_id'>): Promise<GuestHelloLog | null> => {
    if (!user || !isAnonymous) return null;
    
    try {
      const { data, error } = await supabase
        .from('hello_logs')
        .insert({
          user_id: user.id,
          name: log.name,
          notes: log.notes,
          location: log.location,
          rating: log.rating,
          difficulty_rating: log.difficulty_rating,
          timezone_offset: log.timezone_offset,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as GuestHelloLog;
    } catch (error) {
      console.error('Error adding log:', error);
      return null;
    }
  }, [user, isAnonymous]);

  const updateLog = useCallback(async (id: string, updates: Partial<GuestHelloLog>) => {
    if (!user || !isAnonymous) return;
    
    await supabase
      .from('hello_logs')
      .update({
        name: updates.name,
        notes: updates.notes,
        rating: updates.rating,
        difficulty_rating: updates.difficulty_rating,
      })
      .eq('id', id)
      .eq('user_id', user.id);
  }, [user, isAnonymous]);

  const shouldShowSavePrompt = useCallback((): boolean => {
    if (!isAnonymous) return false;
    if (sessionPromptShown) return false;
    
    const totalHellos = guestProgress?.total_hellos || 0;
    if (!SAVE_PROMPT_TRIGGERS.includes(totalHellos)) return false;
    
    if (lastPromptShownAt) {
      const lastShown = new Date(lastPromptShownAt);
      const hoursSinceShown = (Date.now() - lastShown.getTime()) / (1000 * 60 * 60);
      if (hoursSinceShown < PROMPT_COOLDOWN_HOURS) return false;
    }
    
    return true;
  }, [isAnonymous, guestProgress, sessionPromptShown, lastPromptShownAt]);

  const dismissSavePrompt = useCallback(async () => {
    setSessionPromptShown(true);
    setLastPromptShownAt(new Date().toISOString());
  }, []);

  const linkToEmail = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || !isAnonymous) {
      return { success: false, error: 'Not an anonymous user' };
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();
      
      const currentUsername = (profile?.username && profile.username !== 'Guest') 
        ? profile.username 
        : (guestProgress?.username || 'Friend');

      const { error } = await supabase.auth.updateUser({
        email,
        password,
        data: { name: currentUsername }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      await supabase.from('profiles').update({
        is_anonymous: false,
        email,
        username: currentUsername,
      }).eq('id', user.id);

      await supabase.from('user_progress').update({
        username: currentUsername,
      }).eq('user_id', user.id);

      return { success: true };
    } catch (error) {
      console.error('Error linking to email:', error);
      return { success: false, error: 'Failed to link account' };
    }
  }, [user, isAnonymous, guestProgress?.username]);

  const clearPackCompletions = useCallback(async (packId: string) => {
    if (!user || !isAnonymous) return;

    try {
      const { error } = await supabase
        .from('challenge_completions')
        .delete()
        .eq('user_id', user.id)
        .like('challenge_tag', `${packId}-%`);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing pack completions:', error);
      throw error;
    }
  }, [user, isAnonymous]);

  const refetch = useCallback(async () => {
    await refetchProgress();
  }, [refetchProgress]);

  return {
    isGuest,
    isAnonymous,
    guestState,
    guestProgress,
    guestLogs: [], // No longer fetched separately — use useHelloLogs directly
    loading,
    updateProgress,
    addLog,
    updateLog,
    clearPackCompletions,
    shouldShowSavePrompt,
    dismissSavePrompt,
    linkToEmail,
    refetch,
    initializeAnonymous,
  };
};
