import { useCallback, useMemo, useEffect, useRef } from 'react';
import { useUserProgressQuery } from './useUserProgressQuery';
import { useHelloLogs } from './useHelloLogs';
import { useTimezone } from './useTimezone';
import { getDayKeyInOffset, getDayKeyDifference, normalizeTimezoneOffset } from '@/lib/timezone';
import { useLocalStorage } from './useLocalStorage';
import { useLocalNotifications } from './useLocalNotifications';

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
  const { 
    scheduleNotifications, 
    onHelloLogged, 
    onStreakChange, 
    onDailyModeToggle,
    isNativePlatform,
    preferences: notificationPrefs,
  } = useLocalNotifications();
  
  // Local storage for reminder tracking (resets at midnight client-side)
  const [morningReminderDismissed, setMorningReminderDismissed] = useLocalStorage<string | null>('daily_mode_morning_dismissed', null);
  const [afternoonReminderDismissed, setAfternoonReminderDismissed] = useLocalStorage<string | null>('daily_mode_afternoon_dismissed', null);

  const tzOffset = normalizeTimezoneOffset(timezoneOffset);
  const todayKey = getDayKeyInOffset(new Date(), tzOffset);
  
  // Track previous streak for change detection
  const prevStreakRef = useRef<number | null>(null);
  const prevTodaysHelloCountRef = useRef<number>(0);
  
  // Calculate today's hello count from logs
  const todaysHelloCount = useMemo(() => {
    if (!logs.length) return 0;
    return logs.filter(log => {
      const logDayKey = getDayKeyInOffset(new Date(log.created_at), tzOffset);
      return logDayKey === todayKey;
    }).length;
  }, [logs, todayKey, tzOffset]);

  const hasLoggedToday = todaysHelloCount > 0;

  // Current state values
  const isActive = progress?.daily_mode_active || false;
  const currentStreak = progress?.daily_mode_current_streak || 0;
  const bestStreak = progress?.daily_mode_best_streak || 0;

  // Initialize notifications on mount and when Daily Mode state changes
  useEffect(() => {
    if (progressLoading || !isNativePlatform) return;
    
    scheduleNotifications(isActive, currentStreak);
  }, [isActive, currentStreak, progressLoading, isNativePlatform, scheduleNotifications]);

  // Detect hello logged and notify
  useEffect(() => {
    if (!isActive || !isNativePlatform) return;
    
    // Check if a new hello was logged today
    if (todaysHelloCount > prevTodaysHelloCountRef.current) {
      onHelloLogged(isActive, currentStreak, todaysHelloCount);
    }
    
    prevTodaysHelloCountRef.current = todaysHelloCount;
  }, [todaysHelloCount, isActive, currentStreak, isNativePlatform, onHelloLogged]);

  // Detect streak changes and notify
  useEffect(() => {
    if (!isActive || !isNativePlatform) return;
    
    if (prevStreakRef.current !== null && prevStreakRef.current !== currentStreak) {
      onStreakChange(currentStreak, prevStreakRef.current, isActive);
    }
    
    prevStreakRef.current = currentStreak;
  }, [currentStreak, isActive, isNativePlatform, onStreakChange]);

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
    
    // Notify notification system
    await onDailyModeToggle(true, 0);
  }, [updateProgress, onDailyModeToggle]);

  // Deactivate Daily Mode
  const deactivateDailyMode = useCallback(async () => {
    await updateProgress({
      daily_mode_active: false,
      daily_mode_current_streak: 0,
      daily_mode_start_date: null,
      daily_mode_last_hello_date: null,
    });
    
    // Notify notification system
    await onDailyModeToggle(false, 0);
  }, [updateProgress, onDailyModeToggle]);

  // Called when user logs a hello - updates streak
  const recordHelloForDailyMode = useCallback(async () => {
    if (!progress?.daily_mode_active) return;
    
    const lastHelloDateStr = progress.daily_mode_last_hello_date;
    const currentStreakValue = progress.daily_mode_current_streak || 0;
    const bestStreakValue = progress.daily_mode_best_streak || 0;
    
    // If already logged today, don't increment streak again
    if (lastHelloDateStr === todayKey) return;
    
    let newStreak = currentStreakValue;
    
    if (!lastHelloDateStr) {
      // First hello in daily mode
      newStreak = 1;
    } else {
      const dayDiff = getDayKeyDifference(lastHelloDateStr, todayKey);
      
      if (dayDiff === 1) {
        // Consecutive day - increment streak
        newStreak = currentStreakValue + 1;
      } else if (dayDiff > 1) {
        // Missed day(s) - streak was already reset
        newStreak = 1;
      } else {
        // Same day - shouldn't happen but just in case
        return;
      }
    }
    
    const newBestStreak = Math.max(bestStreakValue, newStreak);
    
    await updateProgress({
      daily_mode_current_streak: newStreak,
      daily_mode_best_streak: newBestStreak,
      daily_mode_last_hello_date: todayKey,
    });
  }, [progress, todayKey, updateProgress]);

  // Check and reset streak at midnight (called on component mount/update)
  const checkAndResetStreak = useCallback(async () => {
    if (!progress?.daily_mode_active) return;
    // Don't reset streak while timezone is still loading - could cause false resets
    if (tzLoading) return;
    
    const lastHelloDateStr = progress.daily_mode_last_hello_date;
    if (!lastHelloDateStr) return;
    
    const dayDiff = getDayKeyDifference(lastHelloDateStr, todayKey);
    
    // If more than 1 day has passed, reset streak
    if (dayDiff > 1) {
      await updateProgress({
        daily_mode_current_streak: 0,
      });
    }
  }, [progress, todayKey, updateProgress, tzLoading]);

  const state: DailyModeState = {
    isActive,
    currentStreak,
    bestStreak,
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
    // Expose notification preferences for settings UI
    notificationPrefs,
    isNativePlatform,
  };
};
