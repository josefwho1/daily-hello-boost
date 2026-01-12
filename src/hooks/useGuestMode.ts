import { useState, useEffect, useCallback } from 'react';
import {
  GuestState,
  GuestProgress,
  GuestHelloLog,
  getGuestState,
  createGuestState,
  updateGuestState,
  getGuestProgress,
  createGuestProgress,
  updateGuestProgress,
  getGuestHelloLogs,
  addGuestHelloLog,
  updateGuestHelloLog,
  clearGuestData,
  isIndexedDBAvailable,
} from '@/lib/indexedDB';
import { useAuth } from './useAuth';

export interface UseGuestModeReturn {
  // State
  isGuest: boolean;
  guestState: GuestState | null;
  guestProgress: GuestProgress | null;
  guestLogs: GuestHelloLog[];
  loading: boolean;
  
  // Progress operations
  updateProgress: (updates: Partial<GuestProgress>) => Promise<void>;
  
  // Hello log operations
  addLog: (log: Omit<GuestHelloLog, 'id' | 'created_at'>) => Promise<GuestHelloLog | null>;
  updateLog: (id: string, updates: Partial<GuestHelloLog>) => Promise<void>;
  
  // Save prompt tracking
  shouldShowSavePrompt: () => boolean;
  dismissSavePrompt: () => Promise<void>;
  
  // Sync operations
  syncToCloud: (userId: string) => Promise<boolean>;
  
  // Refetch
  refetch: () => Promise<void>;
}

// Constants for save prompt triggers
const SAVE_PROMPT_TRIGGERS = [1, 5, 20];
const PROMPT_COOLDOWN_HOURS = 24;

export const useGuestMode = (): UseGuestModeReturn => {
  const { user, loading: authLoading } = useAuth();
  const [guestState, setGuestState] = useState<GuestState | null>(null);
  const [guestProgress, setGuestProgress] = useState<GuestProgress | null>(null);
  const [guestLogs, setGuestLogs] = useState<GuestHelloLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionPromptShown, setSessionPromptShown] = useState(false);

  // User is a guest if not logged in and has guest state
  const isGuest = !user && guestState !== null && !guestState.account_linked;

  // Initialize or load guest state
  const initializeGuest = useCallback(async () => {
    if (!isIndexedDBAvailable()) {
      setLoading(false);
      return;
    }

    try {
      let state = await getGuestState();
      
      if (!state) {
        // First visit - create guest state
        state = await createGuestState();
        await createGuestProgress(state.device_id, state.guest_user_id);
      }
      
      setGuestState(state);
      
      const progress = await getGuestProgress();
      setGuestProgress(progress);
      
      const logs = await getGuestHelloLogs();
      setGuestLogs(logs);
    } catch (error) {
      console.error('Error initializing guest mode:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // If user is logged in, don't initialize guest mode
    if (authLoading) return;
    
    if (user) {
      setLoading(false);
      return;
    }
    
    initializeGuest();
  }, [user, authLoading, initializeGuest]);

  const updateProgress = useCallback(async (updates: Partial<GuestProgress>) => {
    if (!guestProgress) return;
    
    await updateGuestProgress(updates);
    setGuestProgress(prev => prev ? { ...prev, ...updates } : null);
  }, [guestProgress]);

  const addLog = useCallback(async (log: Omit<GuestHelloLog, 'id' | 'created_at'>): Promise<GuestHelloLog | null> => {
    try {
      const newLog = await addGuestHelloLog(log);
      setGuestLogs(prev => [newLog, ...prev]);
      
      // Update total hellos count in guest state
      if (guestState) {
        const newTotal = (guestState.total_hellos_logged || 0) + 1;
        await updateGuestState({ total_hellos_logged: newTotal });
        setGuestState(prev => prev ? { ...prev, total_hellos_logged: newTotal } : null);
      }
      
      return newLog;
    } catch (error) {
      console.error('Error adding guest log:', error);
      return null;
    }
  }, [guestState]);

  const updateLog = useCallback(async (id: string, updates: Partial<GuestHelloLog>) => {
    await updateGuestHelloLog(id, updates);
    setGuestLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
  }, []);

  const shouldShowSavePrompt = useCallback((): boolean => {
    if (!guestState || guestState.account_linked) return false;
    if (sessionPromptShown) return false;
    
    const totalHellos = guestState.total_hellos_logged || 0;
    
    // Check if we hit a trigger point
    const shouldTrigger = SAVE_PROMPT_TRIGGERS.includes(totalHellos);
    if (!shouldTrigger) return false;
    
    // Check cooldown
    if (guestState.last_prompt_shown_at) {
      const lastShown = new Date(guestState.last_prompt_shown_at);
      const hoursSinceShown = (Date.now() - lastShown.getTime()) / (1000 * 60 * 60);
      if (hoursSinceShown < PROMPT_COOLDOWN_HOURS) return false;
    }
    
    return true;
  }, [guestState, sessionPromptShown]);

  const dismissSavePrompt = useCallback(async () => {
    if (!guestState) return;
    
    setSessionPromptShown(true);
    
    await updateGuestState({
      prompt_dismissed_count: (guestState.prompt_dismissed_count || 0) + 1,
      last_prompt_shown_at: new Date().toISOString(),
    });
    
    setGuestState(prev => prev ? {
      ...prev,
      prompt_dismissed_count: (prev.prompt_dismissed_count || 0) + 1,
      last_prompt_shown_at: new Date().toISOString(),
    } : null);
  }, [guestState]);

  const syncToCloud = useCallback(async (userId: string): Promise<boolean> => {
    // This will be called after magic link verification
    // The actual sync happens in the sync service
    try {
      await updateGuestState({ account_linked: true });
      setGuestState(prev => prev ? { ...prev, account_linked: true } : null);
      return true;
    } catch (error) {
      console.error('Error marking account as linked:', error);
      return false;
    }
  }, []);

  const refetch = useCallback(async () => {
    if (user) return;
    
    const progress = await getGuestProgress();
    setGuestProgress(progress);
    
    const logs = await getGuestHelloLogs();
    setGuestLogs(logs);
  }, [user]);

  return {
    isGuest,
    guestState,
    guestProgress,
    guestLogs,
    loading: loading || authLoading,
    updateProgress,
    addLog,
    updateLog,
    shouldShowSavePrompt,
    dismissSavePrompt,
    syncToCloud,
    refetch,
  };
};
