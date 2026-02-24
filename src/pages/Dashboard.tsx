import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getCachedProgress } from "@/lib/offlineCache";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgressQuery } from "@/hooks/useUserProgressQuery";
import { useHelloLogs } from "@/hooks/useHelloLogs";
import { useTimezone } from "@/hooks/useTimezone";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useDailyMode } from "@/hooks/useDailyMode";
import { useChallengeProgress } from "@/hooks/useChallengeProgress";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { SyncStatusBadge } from "@/components/SyncStatusBadge";
import { CurrentChallengeCard } from "@/components/CurrentChallengeCard";
import { DailySuggestionCard } from "@/components/DailySuggestionCard";
import { ThirtyHellosCard } from "@/components/ThirtyHellosCard";
import { ChallengeListView } from "@/components/ChallengeListView";
import { ThirtyHellosListView } from "@/components/ThirtyHellosListView";
import { ThirtyChallengeCompleteDialog } from "@/components/ThirtyChallengeCompleteDialog";
import { TierUnlockCelebrationDialog } from "@/components/TierUnlockCelebrationDialog";
import { ChallengeRevealDialog } from "@/components/ChallengeRevealDialog";
import { LogHelloScreen } from "@/components/LogHelloScreen";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";


import { HomeStatsBar } from "@/components/HomeStatsBar";
import { SaveHelloButton } from "@/components/SaveHelloButton";
import { DailyQuote } from "@/components/DailyQuote";
import ViewHelloDialog from "@/components/ViewHelloDialog";
import { HelloLog } from "@/hooks/useHelloLogs";
import { SaveProgressDialog } from "@/components/SaveProgressDialog";
import { HomeScreenTutorial } from "@/components/HomeScreenTutorial";
import { MilestoneCelebrationDialog, HELLO_MILESTONES, NAME_MILESTONES, checkMilestoneReached, MilestoneType } from "@/components/MilestoneCelebrationDialog";
import { FirstHelloCelebrationDialog } from "@/components/FirstHelloCelebrationDialog";
import { ChallengeDayCelebrationDialog } from "@/components/ChallengeDayCelebrationDialog";
import { StreakCelebrationDialog } from "@/components/StreakCelebrationDialog";
import { toast } from "sonner";
import { ChallengeCompletionToast } from "@/components/ChallengeCompletionToast";
import { thirtyDayChallenge } from "@/data/thirtyDayChallenge";
import remiWaving4 from "@/assets/remi-waving-4.webp";
import remiSuper1 from "@/assets/remi-super-1.webp";
import remiSuper2 from "@/assets/remi-super-2.webp";
import { startOfWeek, isBefore, parseISO } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { normalizeTimezoneOffset, getDayKeyInOffset } from "@/lib/timezone";
import { vibrateSuccess, vibrateCelebration } from "@/lib/haptics";
const getWeekStartKeyInOffset = (date: Date, offset: string) => {
  const normalizedOffset = normalizeTimezoneOffset(offset);
  const zonedNow = toZonedTime(date, normalizedOffset);
  const weekStart = startOfWeek(zonedNow, {
    weekStartsOn: 1
  });
  return formatInTimeZone(weekStart, normalizedOffset, "yyyy-MM-dd");
};
export default function Dashboard() {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    progress: cloudProgress,
    loading: progressLoading,
    updateProgress: updateCloudProgress,
    refetch
  } = useUserProgressQuery();
  const {
    logs: cloudLogs,
    loading: logsLoading,
    addLog: addCloudLog,
    updateLog: updateCloudLog,
    deleteLog: deleteCloudLog,
    toggleFavorite
  } = useHelloLogs();
  const {
    timezoneOffset,
  } = useTimezone();
  const {
    state: dailyModeState,
    recordHelloForDailyMode,
    checkAndResetStreak,
    loading: dailyModeLoading
  } = useDailyMode();
  const {
    state: challengeState,
    markDayComplete,
    unmarkDayComplete,
    restartChallenge,
    loading: challengeLoading
  } = useChallengeProgress();
  const {
    guestProgress,
    loading: guestLoading,
    updateProgress: updateGuestProgress,
    shouldShowSavePrompt,
    dismissSavePrompt,
    guestState,
    isAnonymous
  } = useGuestMode();
  const { syncStatus, pendingCount } = useOfflineSync();

  // Unified progress and logs
  // IMPORTANT: Anonymous users now use the same Supabase tables as regular users
  // so we always use cloudLogs for consistency and instant updates via React Query cache
  const progress = isAnonymous ? guestProgress ? {
    current_streak: guestProgress.current_streak,
    current_day: guestProgress.current_day,
    last_completed_date: guestProgress.last_completed_date,
    selected_pack_id: guestProgress.selected_pack_id || '30-day-hello',
    mode: guestProgress.mode,
    target_hellos_per_week: guestProgress.target_hellos_per_week,
    hellos_this_week: guestProgress.hellos_this_week,
    weekly_streak: guestProgress.weekly_streak,
    daily_streak: guestProgress.daily_streak,
    longest_streak: guestProgress.longest_streak,
    is_onboarding_week: guestProgress.is_onboarding_week,
    onboarding_week_start: guestProgress.onboarding_week_start,
    week_start_date: guestProgress.week_start_date,
    has_completed_onboarding: guestProgress.has_completed_onboarding,
    has_seen_welcome_messages: guestProgress.has_seen_welcome_messages,
    total_hellos: guestProgress.total_hellos
  } : null : cloudProgress;
  
  // Always use cloudLogs since anonymous users have real Supabase sessions
  // This ensures consistent data and proper React Query cache invalidation
  const logs = cloudLogs;
  
  const updateProgress = isAnonymous ? updateGuestProgress : updateCloudProgress;
  
  // Always use the cloud addLog since anonymous users have real Supabase sessions
  const addLog = addCloudLog;
  const tzOffset = normalizeTimezoneOffset(timezoneOffset);
  const [showLogDialog, setShowLogDialog] = useState(false);
  

  // Dialog states
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [autoStartRecording, setAutoStartRecording] = useState(false);
  const [showHomeTutorial, setShowHomeTutorial] = useState(false);
  const [showChallengeList, setShowChallengeList] = useState(false);
  const [showThirtyHellosList, setShowThirtyHellosList] = useState(false);
  const [showThirtyChallengeComplete, setShowThirtyChallengeComplete] = useState(false);
  const [showTierUnlock, setShowTierUnlock] = useState(false);
  const [tierUnlockValue, setTierUnlockValue] = useState<10 | 20>(10);
  const [showChallengeReveal, setShowChallengeReveal] = useState(false);
  const [challengeRevealDay, setChallengeRevealDay] = useState(0);
  const [pendingChallengeCompletion, setPendingChallengeCompletion] = useState<{
    day: number;
    name: string;
  } | null>(null);

  // Milestone celebration states
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [milestoneValue, setMilestoneValue] = useState(0);
  const [milestoneType, setMilestoneType] = useState<MilestoneType>('hellos');

  // First hello celebration state
  const [showFirstHelloCelebration, setShowFirstHelloCelebration] = useState(false);

  // Challenge day celebration queue state
  const [showChallengeDayCelebration, setShowChallengeDayCelebration] = useState(false);
  const [challengeDayCelebrationInfo, setChallengeDayCelebrationInfo] = useState<{ day: number; name: string } | null>(null);
  // Queued celebrations to show after challenge day celebration
  const queuedStreakRef = useRef<number | null>(null);
  const queuedRevealDayRef = useRef<number | null>(null);
  // Flag to suppress streak celebration during challenge completion flow
  const isChallengeCompletionRef = useRef(false);

  // Streak celebration states
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [celebratedStreakValue, setCelebratedStreakValue] = useState(0);

  // Easter egg: Remi super saiyan tap counter
  const [remiTapCount, setRemiTapCount] = useState(0);

  // Edit hello dialog states
  const [editingLog, setEditingLog] = useState<HelloLog | null>(null);
  const [editingLogIndex, setEditingLogIndex] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Derive username - prioritize cached progress username for instant display
  const username = useMemo(() => {
    const cached = getCachedProgress<Record<string, unknown>>();
    return (progress as any)?.username || guestProgress?.username || cached?.username || user?.user_metadata?.name || 'Friend';
  }, [(progress as any)?.username, guestProgress?.username, user?.user_metadata?.name]);

  // Show walkthrough tutorial for users coming from onboarding
  const tutorialShownRef = useRef(false);
  const tutorialTimerRef = useRef<number | null>(null);
  // Derive stable tutorial eligibility values to avoid object-reference churn
  const tutorialEligibleOnboarding = Boolean(progress?.has_completed_onboarding);
  const tutorialSeenWelcome = progress?.has_seen_welcome_messages === true;
  const tutorialLocalKey = user?.id ? `tutorial_completed_${user.id}` : 'tutorial_completed';
  const tutorialSeenLocal = localStorage.getItem(tutorialLocalKey) === '1';
  const hasProgress = !!progress;

  useEffect(() => {
    if (!hasProgress) return;
    if (showHomeTutorial) return;
    // Never show again if localStorage flag is set (bulletproof guard)
    if (tutorialSeenLocal) return;
    const eligible = tutorialEligibleOnboarding && !tutorialSeenWelcome;
    const pending = sessionStorage.getItem('pending_home_tutorial') === '1';
    if (!eligible) {
      if (pending) sessionStorage.removeItem('pending_home_tutorial');
      return;
    }
    if (tutorialShownRef.current) return;
    tutorialShownRef.current = true;
    if (pending) sessionStorage.removeItem('pending_home_tutorial');
    tutorialTimerRef.current = window.setTimeout(() => {
      setShowHomeTutorial(true);
    }, 400);
    return () => {
      if (tutorialTimerRef.current) {
        window.clearTimeout(tutorialTimerRef.current);
        tutorialTimerRef.current = null;
      }
    };
  }, [showHomeTutorial, hasProgress, tutorialEligibleOnboarding, tutorialSeenWelcome, tutorialSeenLocal]);

  // Mark tutorial as seen as soon as it opens
  const handleTutorialMarkSeen = async () => {
    // Set localStorage immediately — this is the bulletproof guard
    localStorage.setItem(tutorialLocalKey, '1');
    sessionStorage.removeItem('pending_home_tutorial');
    if (user?.id) {
      supabase.from('user_progress').update({
        has_seen_welcome_messages: true
      }).eq('user_id', user.id);
      if (isAnonymous) {
        updateGuestProgress({
          has_seen_welcome_messages: true
        } as any);
      }
    }
  };
  const handleTutorialComplete = () => {
    localStorage.setItem(tutorialLocalKey, '1');
    setShowHomeTutorial(false);
    toast.success("🎉 You're all set!");
  };

  // Weekly reset logic
  const [weeklyResetDone, setWeeklyResetDone] = useState(false);
  useEffect(() => {
    if (!progress || progressLoading || weeklyResetDone) return;
    if (progress.is_onboarding_week) return;
    const weekStartStr = getWeekStartKeyInOffset(new Date(), tzOffset);
    if (progress.week_start_date) {
      const storedWeekStart = parseISO(progress.week_start_date);
      const currentWeekStart = parseISO(weekStartStr);
      if (isBefore(storedWeekStart, currentWeekStart)) {
        setWeeklyResetDone(true);
        updateProgress({
          hellos_this_week: 0,
          week_start_date: weekStartStr,
          weekly_goal_achieved_this_week: false
        });
      }
    } else {
      setWeeklyResetDone(true);
      updateProgress({
        week_start_date: weekStartStr,
        weekly_goal_achieved_this_week: false
      });
    }
  }, [progress, progressLoading, weeklyResetDone, tzOffset]);

  // Daily Mode streak reset check on mount
  useEffect(() => {
    if (!dailyModeLoading) {
      checkAndResetStreak();
    }
  }, [dailyModeLoading, checkAndResetStreak]);
  const handleLogHello = async (data: {
    name?: string;
    location?: string;
    notes?: string;
    rating?: 'positive' | 'neutral' | 'negative';
    difficulty_rating?: number;
    no_name_flag?: boolean;
    linked_to?: string;
    hello_type?: string;
    silent?: boolean;
  }) => {
    const today = getDayKeyInOffset(new Date(), tzOffset);
    const result = await addLog({
      ...data
    });
    if (result) {
      const previousHellosThisWeek = progress?.hellos_this_week || 0;
      const newHellosThisWeek = previousHellosThisWeek + 1;
      const newTotalHellos = (progress?.total_hellos || logs.length) + 1;
      const updates: Record<string, unknown> = {
        hellos_this_week: newHellosThisWeek,
        last_completed_date: today,
        total_hellos: newTotalHellos
      };
      await updateProgress(updates);

      // Haptic feedback
      vibrateSuccess();

      // Only show toast if not silent (for multi-entry logging)
      if (!data.silent) {
        if (!navigator.onLine) {
          toast.success("Hello saved! It'll sync when you're back online.", { duration: 3000 });
        } else {
          toast.success("Hello logged!");
        }
      }

      // Check for first hello celebration
      const previousTotalHellos = progress?.total_hellos || logs.length;
      if (previousTotalHellos === 0 && newTotalHellos >= 1) {
        setTimeout(() => setShowFirstHelloCelebration(true), 600);
      }

      // Check for hello/name milestones
      const helloMilestone = checkMilestoneReached(previousTotalHellos, newTotalHellos, HELLO_MILESTONES);
      if (helloMilestone) {
        setMilestoneValue(helloMilestone);
        setMilestoneType('hellos');
        setTimeout(() => setShowMilestoneCelebration(true), 1000);
      }

      // Check for names milestone
      const uniqueNamesCount = new Set(logs.filter(l => l.name).map(l => l.name?.toLowerCase())).size + (data.name ? 1 : 0);
      const previousUniqueNames = new Set(logs.filter(l => l.name).map(l => l.name?.toLowerCase())).size;
      const nameMilestone = checkMilestoneReached(previousUniqueNames, uniqueNamesCount, NAME_MILESTONES);
      if (nameMilestone && !helloMilestone) {
        setMilestoneValue(nameMilestone);
        setMilestoneType('names');
        setTimeout(() => setShowMilestoneCelebration(true), 1000);
      }

      // Show save prompt for guests
      if (isAnonymous && shouldShowSavePrompt()) {
        setTimeout(() => {
          setShowSavePrompt(true);
        }, 1000);
      }

      // Record for Daily Mode if active and trigger streak celebration
      // Always record streak regardless of mode
      {
        const todayKey = getDayKeyInOffset(new Date(), tzOffset);
        const hasAlreadyRecordedForDailyModeToday = dailyModeState.lastHelloDate === todayKey;
        const streakBeforeLog = dailyModeState.currentStreak;
        await recordHelloForDailyMode();

        // Show celebration only if streak is visible
        const isStreakHidden = localStorage.getItem('hideStreak') === 'true';
        if (!hasAlreadyRecordedForDailyModeToday && !isStreakHidden) {
          const newStreakValue = streakBeforeLog === 0 ? 1 : streakBeforeLog + 1;
          if (isChallengeCompletionRef.current) {
            queuedStreakRef.current = newStreakValue;
          } else {
            setCelebratedStreakValue(newStreakValue);
            setTimeout(() => setShowStreakCelebration(true), 500);
          }
        }
      }
    }
  };
  // Fast loading: if we have progress (from cache or query), render immediately.
  // Only show skeleton if we truly have no data at all.
  if (!progress) {
    const cached = getCachedProgress<Record<string, unknown>>();
    if (cached) {
      // We have cached data — don't block, the query will hydrate soon
    } else {
      // No data at all — show skeleton briefly
      return <DashboardSkeleton />;
    }
  }

  // Helper to show challenge completion toast with Undo and Add Details buttons
  const showChallengeCompletedToast = (day: number, challengeName: string) => {
    // Track if hello entry has been created for this completion
    vibrateCelebration();
    let helloEntryCreated = false;
    let createdHelloId: string | null = null;

    const createHelloEntry = async () => {
      if (helloEntryCreated) return;
      helloEntryCreated = true;

      // Create hello entry with challenge info
      const isThirtyHellos = day >= 101;
      const helloTypePrefix = isThirtyHellos ? 'thirty' : 'challenge';
      const tagDay = isThirtyHellos ? day - 100 : day;
      const result = await addLog({
        hello_type: `${helloTypePrefix}:${tagDay}`,
      });

      if (result) {
        createdHelloId = result.id;
        // Update progress stats
        const today = getDayKeyInOffset(new Date(), tzOffset);
        const previousHellosThisWeek = progress?.hellos_this_week || 0;
        const newHellosThisWeek = previousHellosThisWeek + 1;
        const newTotalHellos = (progress?.total_hellos || logs.length) + 1;
        
        await updateProgress({
          hellos_this_week: newHellosThisWeek,
          last_completed_date: today,
          total_hellos: newTotalHellos,
        });

        // Always record streak regardless of mode
        {
          const todayKey = getDayKeyInOffset(new Date(), tzOffset);
          const hasAlreadyRecordedForDailyModeToday = dailyModeState.lastHelloDate === todayKey;
          const streakBeforeLog = dailyModeState.currentStreak;
          await recordHelloForDailyMode();

          const isStreakHidden = localStorage.getItem('hideStreak') === 'true';
          if (!hasAlreadyRecordedForDailyModeToday && !isStreakHidden) {
            const newStreakValue = streakBeforeLog === 0 ? 1 : streakBeforeLog + 1;
            setCelebratedStreakValue(newStreakValue);
            setTimeout(() => setShowStreakCelebration(true), 500);
          }
        }
      }
    };

    const handleUndo = async () => {
      // Revert challenge completion
      await unmarkDayComplete(day);

      // Delete the hello entry if it was created
      if (createdHelloId) {
        try {
          await deleteCloudLog(createdHelloId);
          // Revert progress stats
          const previousHellosThisWeek = progress?.hellos_this_week || 0;
          const previousTotalHellos = progress?.total_hellos || logs.length;
          await updateProgress({
            hellos_this_week: Math.max(0, previousHellosThisWeek - 1),
            total_hellos: Math.max(0, previousTotalHellos - 1),
          });
        } catch (error) {
          console.error("Failed to delete hello entry on undo:", error);
        }
      }
      helloEntryCreated = false;
      createdHelloId = null;
      toast.dismiss(toastId);
    };

    const handleAddDetails = () => {
      toast.dismiss(toastId);
      // Set up the log screen with pre-filled challenge data
      // We'll edit the existing entry if it exists
      if (createdHelloId) {
        // Navigate to edit the existing hello
        setEditingLog(logs.find(l => l.id === createdHelloId) || null);
        // Find the log in the list - but we need to refresh logs first
        // Instead, open the log dialog with the challenge pre-filled
      }
      // Open the log screen to add details
      setPendingChallengeCompletion({ day, name: challengeName });
      setAutoStartRecording(false);
      setShowLogDialog(true);
    };

    const handleUndoExpired = () => {
      // Create the hello entry after 5-second window expires
      createHelloEntry();
    };

    const toastId = toast.custom(
      (id) => (
        <ChallengeCompletionToast
          id={id}
          challengeNumber={day}
          challengeName={challengeName}
          onUndo={handleUndo}
          onAddDetails={handleAddDetails}
          onUndoExpired={handleUndoExpired}
        />
      ),
      {
        duration: 10000, // Total toast duration: 10 seconds
        onDismiss: () => {
          // When toast is swiped away, treat it as a save (create the hello entry)
          createHelloEntry();
        },
      }
    );
  };

  // Helper to handle challenge celebrations — only for 7-day challenge
  // Queues the reveal day; the challenge day celebration is shown first
  const checkAndShowCelebrations = (previousCount: number, newCount: number, completedDay: number, challengeName: string) => {
    // Only show challenge reveal screens during 7-day challenge
    if (progress?.selected_pack_id === '30-hellos' || progress?.selected_pack_id === 'daily') return;

    // Queue the reveal day
    if (newCount === 7 && previousCount < 7) {
      queuedRevealDayRef.current = 7;
    } else if (newCount < 7 && newCount > previousCount) {
      queuedRevealDayRef.current = newCount;
    }

    // Show challenge day celebration first (this kicks off the queue)
    setChallengeDayCelebrationInfo({ day: completedDay, name: challengeName });
    setTimeout(() => setShowChallengeDayCelebration(true), 400);
  };

  // Advance celebration queue: challenge → streak → reveal
  const advanceCelebrationQueue = () => {
    setShowChallengeDayCelebration(false);

    // Next: streak celebration if queued
    if (queuedStreakRef.current !== null) {
      const streakVal = queuedStreakRef.current;
      queuedStreakRef.current = null;
      setCelebratedStreakValue(streakVal);
      setTimeout(() => setShowStreakCelebration(true), 300);
      return;
    }

    // Next: challenge reveal if queued
    if (queuedRevealDayRef.current !== null) {
      const revealDay = queuedRevealDayRef.current;
      queuedRevealDayRef.current = null;
      setChallengeRevealDay(revealDay);
      setTimeout(() => setShowChallengeReveal(true), 300);
      return;
    }

    isChallengeCompletionRef.current = false;
  };

  // When streak celebration closes, advance to reveal if queued
  const handleStreakCelebrationClose = () => {
    setShowStreakCelebration(false);

    if (queuedRevealDayRef.current !== null) {
      const revealDay = queuedRevealDayRef.current;
      queuedRevealDayRef.current = null;
      setChallengeRevealDay(revealDay);
      setTimeout(() => setShowChallengeReveal(true), 300);
      return;
    }

    isChallengeCompletionRef.current = false;
  };

  // Full-screen 30 Hellos List View
  if (showThirtyHellosList) {
    // Filter to only 30 Hellos days (101-130) and map back to 1-30 for display
    const thirtyHellosCompleted = challengeState.completedDays
      .filter(d => d >= 101 && d <= 130)
      .map(d => d - 100);
    return <ThirtyHellosListView
      completedDays={thirtyHellosCompleted}
      onComplete={async (day, name) => {
        setShowThirtyHellosList(false);
        // Store with offset so it doesn't clash with 7-day challenge
        setPendingChallengeCompletion({ day: day + 100, name });
        setAutoStartRecording(false);
        setShowLogDialog(true);
      }}
      onBack={() => setShowThirtyHellosList(false)}
    />;
  }

  // Full-screen Challenge List View
  if (showChallengeList) {
    return <ChallengeListView completedDays={challengeState.completedDays} onComplete={async (day, challengeName) => {
      setShowChallengeList(false);
      setPendingChallengeCompletion({ day, name: challengeName });
      setAutoStartRecording(false);
      setShowLogDialog(true);
    }} onUncomplete={async day => {
      await unmarkDayComplete(day);
    }} onBack={() => setShowChallengeList(false)} onSelectChallenge={index => {
      setShowChallengeList(false);
      navigate('/', { state: { selectedChallengeIndex: index }, replace: true });
    }} />;
  }

  // Full-screen Log Hello - also handles "Add Details" for challenge completions
  if (showLogDialog) {
    // If we're adding details for a challenge that already created a hello entry, 
    // find and edit it. Otherwise, create a new one.
    // Only look for existing challenge log if day is already completed (i.e. "Add Details" flow)
    // After a restart, old logs still exist but the day won't be in completedDays
    // For 30 Hellos, pendingChallengeCompletion.day is offset (101-130)
    // For hello_type tag and log lookup, use the raw day number
    const rawDay = pendingChallengeCompletion ? (pendingChallengeCompletion.day >= 101 ? pendingChallengeCompletion.day - 100 : pendingChallengeCompletion.day) : null;
    const helloTypeForLookup = pendingChallengeCompletion 
      ? (pendingChallengeCompletion.day >= 101 ? `thirty:${rawDay}` : `challenge:${rawDay}`)
      : null;
    const challengeHelloLog = pendingChallengeCompletion && challengeState.completedDays.includes(pendingChallengeCompletion.day)
      ? logs.find(l => l.hello_type === helloTypeForLookup)
      : null;

    return <LogHelloScreen 
      onBack={() => {
        setShowLogDialog(false);
        setAutoStartRecording(false);
        setPendingChallengeCompletion(null);
      }} 
      onLog={async data => {
        if (challengeHelloLog) {
          // Update existing challenge hello entry
          await updateCloudLog(challengeHelloLog.id, {
            name: data.name || null,
            location: data.location || null,
            notes: data.notes || null,
            rating: data.rating || null,
            difficulty_rating: data.difficulty_rating || null,
          });
          toast.success("Hello details saved!");
          setShowLogDialog(false);
          setAutoStartRecording(false);
        } else if (pendingChallengeCompletion) {
          // Create new hello for challenge with hello_type tag
          // Use different prefix for 30 Hellos vs 7-day challenge
          const isThirtyHellos = pendingChallengeCompletion.day >= 101;
          const helloTypePrefix = isThirtyHellos ? 'thirty' : 'challenge';
          const tagDay = isThirtyHellos ? pendingChallengeCompletion.day - 100 : pendingChallengeCompletion.day;
          // Set flag so handleLogHello queues streak instead of showing it
          isChallengeCompletionRef.current = true;
          await handleLogHello({
            ...data,
            hello_type: `${helloTypePrefix}:${tagDay}`,
          });
          // Mark challenge complete
          if (!challengeState.completedDays.includes(pendingChallengeCompletion.day)) {
            const previousCount = challengeState.completedDays.length;
            await markDayComplete(pendingChallengeCompletion.day);
            checkAndShowCelebrations(previousCount, previousCount + 1, tagDay, pendingChallengeCompletion.name);
          } else {
            isChallengeCompletionRef.current = false;
          }
          setShowLogDialog(false);
          setAutoStartRecording(false);
        } else {
          // Regular hello log - tag as "regular"
          await handleLogHello({
            ...data,
            hello_type: data.hello_type || 'regular',
          });
        }
        setPendingChallengeCompletion(null);
      }}
      challengeTitle={pendingChallengeCompletion?.name || null} 
      autoStartRecording={autoStartRecording} 
      existingLogs={logs}
      // No longer pre-fill notes - hello_type tag handles challenge context
      initialNotes={challengeHelloLog?.notes || undefined}
      initialName={challengeHelloLog?.name || undefined}
      initialLocation={challengeHelloLog?.location || undefined}
      requireAtLeastOneField={false}
    />;
  }
  return <div className="bg-background page-container">
      <div className="max-w-md mx-auto px-4 pt-8 pb-2">

        {/* Friendly Header Greeting with Remi */}
        <div className="text-center mb-6">
          <img 
            src={remiTapCount < 5 ? remiWaving4 : remiTapCount < 10 ? remiSuper1 : remiSuper2} 
            alt="Remi" 
            className="w-16 h-16 mx-auto mb-2 object-contain cursor-pointer active:scale-110 transition-transform"
            onClick={() => setRemiTapCount(prev => prev >= 14 ? 0 : prev + 1)}
          />
          <h1 className="text-2xl font-bold text-foreground tracking-wide" style={{
          fontFamily: 'Fredoka, sans-serif'
        }}>
            <span className="text-primary">Hello</span> {username}
          </h1>
        </div>

        {/* Sync / Offline Status — always rendered so offline indicator can appear */}
        <div className="flex justify-center mb-2">
          <SyncStatusBadge status={syncStatus} pendingCount={pendingCount} />
        </div>

        {/* Stats Dashboard - renders instantly from cache, fills in with live data */}
        <HomeStatsBar logs={logs} lifetimeHellos={logs.length} />

        {/* Main Dashboard */}
        <div className="space-y-4">
          
          {/* Challenge Card - DailySuggestionCard is fully local, never blocked */}
          <div id="tutorial-todays-hello-card">
            {(!progress || progress?.selected_pack_id === 'daily') ? (
              <DailySuggestionCard />
            ) : progress?.selected_pack_id === '30-hellos' ? (
              <ThirtyHellosCard
                completedDays={challengeState.completedDays
                  .filter(d => d >= 101 && d <= 130)
                  .map(d => d - 100)}
                onComplete={async (day, challengeName) => {
                  setPendingChallengeCompletion({ day: day + 100, name: challengeName });
                  setAutoStartRecording(false);
                  setShowLogDialog(true);
                }}
                onViewAll={() => setShowThirtyHellosList(true)}
              />
            ) : (
              <CurrentChallengeCard
                completedDays={challengeState.completedDays}
                nextChallenge={challengeState.nextChallenge}
                totalCount={challengeState.totalCount}
                isComplete={challengeState.isComplete}
                onComplete={async (day, challengeName) => {
                  setPendingChallengeCompletion({ day, name: challengeName });
                  setAutoStartRecording(false);
                  setShowLogDialog(true);
                }}
                onUncomplete={async day => { await unmarkDayComplete(day); }}
                onViewAll={() => setShowChallengeList(true)}
                onRestart={async () => {
                  await restartChallenge();
                  toast.success("Challenge restarted! Day 1 ready.");
                }}
              />
            )}
          </div>

          {/* Log a hello */}
          <div>
            <SaveHelloButton onClick={() => {
            setAutoStartRecording(false);
            setShowLogDialog(true);
          }} onDictateClick={() => {
            setAutoStartRecording(true);
            setShowLogDialog(true);
          }} />
          </div>
          
          {/* Daily Quote */}
          <div className="mt-6">
            <DailyQuote />
          </div>
        </div>

        </div>

      {/* Dialogs */}

      {/* Challenge Reveal / Celebration Dialog */}
      <ChallengeRevealDialog 
        open={showChallengeReveal} 
        completedDay={challengeRevealDay} 
        userName={username}
        onContinue={async () => {
          setShowChallengeReveal(false);
          isChallengeCompletionRef.current = false;
          // If day 7 completed, show normal mode transition
          if (challengeRevealDay === 7) {
            setChallengeRevealDay(8);
            setTimeout(() => setShowChallengeReveal(true), 300);
          }
          // If showing post-completion screen (day 8), switch to daily mode
          // Guard: only switch if all 7 days are actually complete
          if (challengeRevealDay === 8) {
            const sevenDayComplete = challengeState.completedDays.filter(d => d >= 1 && d <= 7).length >= 7;
            if (sevenDayComplete) {
              await updateProgress({ 
                selected_pack_id: 'daily',
                daily_mode_active: true,
                daily_mode_start_date: new Date().toISOString(),
              });
            }
          }
        }}
      />

      {/* Milestone Celebrations */}
      <MilestoneCelebrationDialog open={showMilestoneCelebration} onContinue={() => setShowMilestoneCelebration(false)} milestoneValue={milestoneValue} milestoneType={milestoneType} />

      {/* First Hello Celebration */}
      <FirstHelloCelebrationDialog open={showFirstHelloCelebration} onContinue={() => setShowFirstHelloCelebration(false)} userName={username} />

      {/* Challenge Day Celebration */}
      <ChallengeDayCelebrationDialog 
        open={showChallengeDayCelebration} 
        onContinue={advanceCelebrationQueue} 
        dayNumber={challengeDayCelebrationInfo?.day || 1} 
        challengeName={challengeDayCelebrationInfo?.name || ''} 
      />

      {/* Daily Mode Streak Celebration */}
      <StreakCelebrationDialog open={showStreakCelebration} onContinue={handleStreakCelebrationClose} streakCount={celebratedStreakValue} />

      {/* Save Progress Dialog for Guests */}
      <SaveProgressDialog open={showSavePrompt} onOpenChange={setShowSavePrompt} onDismiss={dismissSavePrompt} totalHellos={guestState?.total_hellos_logged || 0} />

      {/* Home Screen Tutorial - shows after onboarding */}
      <HomeScreenTutorial open={showHomeTutorial} onComplete={handleTutorialComplete} onMarkSeen={handleTutorialMarkSeen} />

      {/* View Hello Dialog */}
      <ViewHelloDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} log={editingLog} logs={logs} currentIndex={editingLogIndex} onNavigate={newIndex => {
      if (newIndex >= 0 && newIndex < logs.length) {
        setEditingLog(logs[newIndex]);
        setEditingLogIndex(newIndex);
      }
    }} onSave={async (id, updates) => {
      const result = await updateCloudLog(id, updates);
      if (result) {
        toast.success("Hello updated!");
      } else {
        toast.error("Failed to update hello");
      }
      return result;
    }} onDelete={async id => {
      try {
        await deleteCloudLog(id);
        toast.success("Hello deleted");
      } catch {
        toast.error("Failed to delete hello");
      }
    }} onToggleFavorite={async (id, isFavorite) => {
      const result = await toggleFavorite(id, isFavorite);
      if (result) {
        toast.success(isFavorite ? "Added to favorites" : "Removed from favorites");
      } else {
        toast.error("Failed to update favorite");
      }
    }} />
    </div>;
}