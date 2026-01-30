import { useCallback, useMemo } from 'react';
import { useUserProgressQuery } from './useUserProgressQuery';
import { useHelloLogs } from './useHelloLogs';
import { useTimezone } from './useTimezone';
import { getDayKeyInOffset, getDayKeyDifference, normalizeTimezoneOffset } from '@/lib/timezone';
import { useLocalStorage } from './useLocalStorage';

export interface DailyModeState {
  isActive: boolean;
  currentStreak: number;
  bestStreak: number;
  startDate: string | null;
  lastHelloDate: string | null;
  todaysHelloCount: number;
  hasLoggedToday: boolean;
}

export const useDailyMode = () => {
  const { progress, updateProgress, loading: progressLoading } = useUserProgressQuery();
  const { logs, loading: logsLoading } = useHelloLogs();
  const { timezoneOffset, loading: tzLoading } = useTimezone();
  
  // Local storage for reminder tracking (resets at midnight client-side)
  const [morningReminderDismissed, setMorningReminderDismissed] = useLocalStorage<string | null>('daily_mode_morning_dismissed', null);
  const [afternoonReminderDismissed, setAfternoonReminderDismissed] = useLocalStorage<string | null>('daily_mode_afternoon_dismissed', null);

  const tzOffset = normalizeTimezoneOffset(timezoneOffset);
  const todayKey = getDayKeyInOffset(new Date(), tzOffset);
  
  // Calculate today's hello count from logs
  const todaysHelloCount = useMemo(() => {
    if (!logs.length) return 0;
    return logs.filter(log => {
      const logDayKey = getDayKeyInOffset(new Date(log.created_at), tzOffset);
      return logDayKey === todayKey;
    }).length;
  }, [logs, todayKey, tzOffset]);

  const hasLoggedToday = todaysHelloCount > 0;

  // Check if reminders should show
  const shouldShowMorningReminder = useMemo(() => {
    if (!progress?.daily_mode_active) return false;
    if (morningReminderDismissed === todayKey) return false;
    
    const now = new Date();
    const hours = now.getHours();
    return hours >= 9;
  }, [progress?.daily_mode_active, morningReminderDismissed, todayKey]);

  const shouldShowAfternoonReminder = useMemo(() => {
    if (!progress?.daily_mode_active) return false;
    if (hasLoggedToday) return false;
    if (afternoonReminderDismissed === todayKey) return false;
    
    const now = new Date();
    const hours = now.getHours();
    return hours >= 16;
  }, [progress?.daily_mode_active, hasLoggedToday, afternoonReminderDismissed, todayKey]);

  const dismissMorningReminder = useCallback(() => {
    setMorningReminderDismissed(todayKey);
  }, [setMorningReminderDismissed, todayKey]);

  const dismissAfternoonReminder = useCallback(() => {
    setAfternoonReminderDismissed(todayKey);
  }, [setAfternoonReminderDismissed, todayKey]);

  // Activate Daily Mode
  const activateDailyMode = useCallback(async () => {
    await updateProgress({
      daily_mode_active: true,
      daily_mode_current_streak: 0,
      daily_mode_start_date: new Date().toISOString(),
      daily_mode_last_hello_date: null,
    });
  }, [updateProgress]);

  // Deactivate Daily Mode
  const deactivateDailyMode = useCallback(async () => {
    await updateProgress({
      daily_mode_active: false,
      daily_mode_current_streak: 0,
      daily_mode_start_date: null,
      daily_mode_last_hello_date: null,
    });
  }, [updateProgress]);

  // Called when user logs a hello - updates streak
  const recordHelloForDailyMode = useCallback(async () => {
    if (!progress?.daily_mode_active) return;
    
    const lastHelloDateStr = progress.daily_mode_last_hello_date;
    const currentStreak = progress.daily_mode_current_streak || 0;
    const bestStreak = progress.daily_mode_best_streak || 0;
    
    // If already logged today, don't increment streak again
    if (lastHelloDateStr === todayKey) return;
    
    let newStreak = currentStreak;
    
    if (!lastHelloDateStr) {
      // First hello in daily mode
      newStreak = 1;
    } else {
      const dayDiff = getDayKeyDifference(lastHelloDateStr, todayKey);
      
      if (dayDiff === 1) {
        // Consecutive day - increment streak
        newStreak = currentStreak + 1;
      } else if (dayDiff > 1) {
        // Missed day(s) - streak was already reset
        newStreak = 1;
      } else {
        // Same day - shouldn't happen but just in case
        return;
      }
    }
    
    const newBestStreak = Math.max(bestStreak, newStreak);
    
    await updateProgress({
      daily_mode_current_streak: newStreak,
      daily_mode_best_streak: newBestStreak,
      daily_mode_last_hello_date: todayKey,
    });
  }, [progress, todayKey, updateProgress]);

  // Check and reset streak at midnight (called on component mount/update)
  const checkAndResetStreak = useCallback(async () => {
    if (!progress?.daily_mode_active) return;
    
    const lastHelloDateStr = progress.daily_mode_last_hello_date;
    if (!lastHelloDateStr) return;
    
    const dayDiff = getDayKeyDifference(lastHelloDateStr, todayKey);
    
    // If more than 1 day has passed, reset streak
    if (dayDiff > 1) {
      await updateProgress({
        daily_mode_current_streak: 0,
      });
    }
  }, [progress, todayKey, updateProgress]);

  const state: DailyModeState = {
    isActive: progress?.daily_mode_active || false,
    currentStreak: progress?.daily_mode_current_streak || 0,
    bestStreak: progress?.daily_mode_best_streak || 0,
    startDate: progress?.daily_mode_start_date || null,
    lastHelloDate: progress?.daily_mode_last_hello_date || null,
    todaysHelloCount,
    hasLoggedToday,
  };

  return {
    state,
    loading: progressLoading || logsLoading || tzLoading,
    activateDailyMode,
    deactivateDailyMode,
    recordHelloForDailyMode,
    checkAndResetStreak,
    shouldShowMorningReminder,
    shouldShowAfternoonReminder,
    dismissMorningReminder,
    dismissAfternoonReminder,
  };
};
