import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useUserProgressQuery } from './useUserProgressQuery';
import { thirtyDayChallenge, getNextIncompleteChallenge, isAllChallengesComplete } from '@/data/thirtyDayChallenge';

export interface ChallengeProgressState {
  completedDays: number[];
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  isComplete: boolean;
  nextChallenge: typeof thirtyDayChallenge[0] | null;
  startedAt: string | null;
  completedAt: string | null;
  timesCompleted: number;
}

export const useChallengeProgress = () => {
  const { progress, updateProgress, loading } = useUserProgressQuery();

  // Avoid stale closures for toast-based undo: always operate on the latest completion state.
  const completedDaysRef = useRef<number[]>([]);
  const progressRef = useRef<typeof progress | null>(null);

  // Parse completed days from progress - handle both array and null cases
  const completedDays = useMemo(() => {
    const days = progress?.challenge_completed_days;
    if (Array.isArray(days)) {
      return days.filter((d: unknown): d is number => typeof d === 'number');
    }
    return [];
  }, [progress]);

  useEffect(() => {
    completedDaysRef.current = completedDays;
  }, [completedDays]);

  useEffect(() => {
    progressRef.current = progress ?? null;
  }, [progress]);

  const state: ChallengeProgressState = useMemo(() => {
    const completedCount = completedDays.length;
    const totalCount = thirtyDayChallenge.length;
    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    const isComplete = isAllChallengesComplete(completedDays);
    const nextChallenge = getNextIncompleteChallenge(completedDays);

    return {
      completedDays,
      completedCount,
      totalCount,
      progressPercent,
      isComplete,
      nextChallenge,
      startedAt: progress?.challenge_started_at || null,
      completedAt: progress?.challenge_completed_at || null,
      timesCompleted: progress?.challenge_times_completed || 0,
    };
  }, [completedDays, progress]);

  // Mark a day as complete
  const markDayComplete = useCallback(async (day: number) => {
    const currentCompletedDays = completedDaysRef.current;
    const currentProgress = progressRef.current;

    if (currentCompletedDays.includes(day)) {
      return; // Already completed
    }

    const newCompletedDays = [...currentCompletedDays, day].sort((a, b) => a - b);
    const isNowComplete = isAllChallengesComplete(newCompletedDays);

    const updates: Record<string, unknown> = {
      challenge_completed_days: newCompletedDays,
    };

    // If this is the first challenge, set started date
    if (currentCompletedDays.length === 0) {
      updates.challenge_started_at = new Date().toISOString();
    }

    // If all 30 complete, set completed date and increment times completed
    if (isNowComplete) {
      updates.challenge_completed_at = new Date().toISOString();
      updates.challenge_times_completed = ((currentProgress as any)?.challenge_times_completed || 0) + 1;
    }

    await updateProgress(updates);
  }, [updateProgress]);

  // Unmark a day (undo completion)
  const unmarkDayComplete = useCallback(async (day: number) => {
    const currentCompletedDays = completedDaysRef.current;
    const currentProgress = progressRef.current;

    if (!currentCompletedDays.includes(day)) {
      return; // Not completed
    }

    const newCompletedDays = currentCompletedDays.filter(d => d !== day);

    const updates: Record<string, unknown> = {
      challenge_completed_days: newCompletedDays,
    };

    // If we're unmarking and challenge was complete, clear completion date
    if (currentProgress?.challenge_completed_at) {
      updates.challenge_completed_at = null;
    }

    await updateProgress(updates);
  }, [updateProgress]);

  // Restart the challenge
  const restartChallenge = useCallback(async () => {
    await updateProgress({
      challenge_completed_days: [],
      challenge_started_at: new Date().toISOString(),
      challenge_completed_at: null,
    });
  }, [updateProgress]);

  // Check if a specific day is complete
  const isDayComplete = useCallback((day: number) => {
    return completedDays.includes(day);
  }, [completedDays]);

  return {
    state,
    loading,
    markDayComplete,
    unmarkDayComplete,
    restartChallenge,
    isDayComplete,
  };
};
