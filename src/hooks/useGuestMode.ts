import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
const SAVE_PROMPT_TRIGGERS = [2, 8, 20];
const PROMPT_COOLDOWN_HOURS = 24;

export const useGuestMode = (): UseGuestModeReturn => {
  const { user, loading: authLoading } = useAuth();
  const [guestProgress, setGuestProgress] = useState<GuestProgress | null>(null);
  const [guestLogs, setGuestLogs] = useState<GuestHelloLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionPromptShown, setSessionPromptShown] = useState(false);
  const [lastPromptShownAt, setLastPromptShownAt] = useState<string | null>(null);
  const [profileIsAnonymous, setProfileIsAnonymous] = useState<boolean | null>(null);

  // Check if user is an anonymous user
  // We use the profiles table is_anonymous flag as the source of truth since
  // Supabase's user.is_anonymous stays true even after linking email/password
  const isAnonymous = profileIsAnonymous ?? user?.is_anonymous === true;
  
  // User is a "guest" if they are anonymous (we use Supabase anonymous auth now)
  const isGuest = isAnonymous;

  // Simulated guest state for compatibility
  const guestState = isAnonymous ? {
    account_linked: false,
    total_hellos_logged: guestProgress?.total_hellos || 0,
  } : null;

  // Check if user is truly anonymous based on profiles table
  useEffect(() => {
    const checkProfileAnonymousStatus = async () => {
      if (!user) {
        setProfileIsAnonymous(null);
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_anonymous')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile !== null) {
        setProfileIsAnonymous(profile.is_anonymous);
      }
    };
    
    checkProfileAnonymousStatus();
  }, [user]);

  // Load anonymous user's progress and logs from Supabase
  const loadAnonymousUserData = useCallback(async () => {
    if (!user || !isAnonymous) {
      setLoading(false);
      return;
    }

    try {
      // Load progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (progress) {
        setGuestProgress(progress as GuestProgress);
      }

      // Load logs
      const { data: logs } = await supabase
        .from('hello_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      setGuestLogs((logs as GuestHelloLog[]) || []);
    } catch (error) {
      console.error('Error loading anonymous user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isAnonymous]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setLoading(false);
      return;
    }
    
    if (isAnonymous) {
      loadAnonymousUserData();
    } else {
      setLoading(false);
    }
  }, [user, authLoading, isAnonymous, loadAnonymousUserData]);

  // Initialize anonymous auth for guests
  const initializeAnonymous = useCallback(async (): Promise<{ success: boolean; userId?: string; error?: string }> => {
    try {
      // Check if already signed in using local session first (avoids network call that can fail)
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      if (existingSession?.user) {
        return { success: true, userId: existingSession.user.id };
      }

      // Sign in anonymously
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        console.error('Error signing in anonymously:', error);
        return { success: false, error: error.message };
      }

      const userId = data.user?.id;
      if (!userId) {
        return { success: false, error: 'No user ID returned' };
      }

      // Create profile for anonymous user
      await supabase.from('profiles').upsert({
        id: userId,
        username: 'Guest',
        is_anonymous: true,
        hide_from_leaderboard: false,
      }, { onConflict: 'id' });

      // Create user_progress for anonymous user with mode='daily' (single mode now)
      await supabase.from('user_progress').upsert({
        user_id: userId,
        current_streak: 0,
        current_day: 1,
        is_onboarding_week: false,
        mode: 'daily',
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

  const updateProgress = useCallback(async (updates: Partial<GuestProgress>) => {
    if (!user || !isAnonymous) return;
    
    const { error } = await supabase
      .from('user_progress')
      .update(updates)
      .eq('user_id', user.id);
    
    if (!error) {
      setGuestProgress(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [user, isAnonymous]);

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
      
      const newLog = data as GuestHelloLog;
      setGuestLogs(prev => [newLog, ...prev]);
      
      return newLog;
    } catch (error) {
      console.error('Error adding log:', error);
      return null;
    }
  }, [user, isAnonymous]);

  const updateLog = useCallback(async (id: string, updates: Partial<GuestHelloLog>) => {
    if (!user || !isAnonymous) return;
    
    const { error } = await supabase
      .from('hello_logs')
      .update({
        name: updates.name,
        notes: updates.notes,
        rating: updates.rating,
        difficulty_rating: updates.difficulty_rating,
      })
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (!error) {
      setGuestLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
    }
  }, [user, isAnonymous]);

  const shouldShowSavePrompt = useCallback((): boolean => {
    if (!isAnonymous) return false;
    if (sessionPromptShown) return false;
    
    const totalHellos = guestProgress?.total_hellos || 0;
    
    // Check if we hit a trigger milestone (2, 8, or 20 hellos)
    if (!SAVE_PROMPT_TRIGGERS.includes(totalHellos)) return false;
    
    // Check cooldown
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

  // Link anonymous account to email (convert to full account)
  const linkToEmail = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!user || !isAnonymous) {
      return { success: false, error: 'Not an anonymous user' };
    }

    try {
      // Get current username from profiles before conversion
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();
      
      const currentUsername = (profile?.username && profile.username !== 'Guest') 
        ? profile.username 
        : (guestProgress?.username || 'Friend');

      // Update the anonymous user's email and password, also set user_metadata.name
      const { error } = await supabase.auth.updateUser({
        email,
        password,
        data: { name: currentUsername }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Update profile to mark as no longer anonymous and preserve username
      await supabase.from('profiles').update({
        is_anonymous: false,
        email,
        username: currentUsername,
      }).eq('id', user.id);

      // Also ensure user_progress has the correct username
      await supabase.from('user_progress').update({
        username: currentUsername,
      }).eq('user_id', user.id);

      return { success: true };
    } catch (error) {
      console.error('Error linking to email:', error);
      return { success: false, error: 'Failed to link account' };
    }
  }, [user, isAnonymous, guestProgress?.username]);

  // Clear challenge completions for a specific pack (for restart functionality)
  const clearPackCompletions = useCallback(async (packId: string) => {
    if (!user || !isAnonymous) return;

    try {
      // Delete challenge completions that match this pack's challenge tags
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
    if (user && isAnonymous) {
      await loadAnonymousUserData();
    }
  }, [user, isAnonymous, loadAnonymousUserData]);

  return {
    isGuest,
    isAnonymous,
    guestState,
    guestProgress,
    guestLogs,
    loading: loading || authLoading,
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
