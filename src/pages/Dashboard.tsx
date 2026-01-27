import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useHelloLogs } from "@/hooks/useHelloLogs";
import { useTimezone } from "@/hooks/useTimezone";
import { useGuestMode } from "@/hooks/useGuestMode";
import { LogHelloScreen } from "@/components/LogHelloScreen";
import { OnboardingChallengeCard } from "@/components/OnboardingChallengeCard";
import { FirstOrbGiftDialog } from "@/components/FirstOrbGiftDialog";
import { ComeBackTomorrowDialog } from "@/components/ComeBackTomorrowDialog";
import { UseOrbDialog } from "@/components/UseOrbDialog";
import { StreakSaverDialog, StreakSaverScenario } from "@/components/StreakSaverDialog";
import { DailySuggestionCard } from "@/components/DailySuggestionCard";
import { RecentHellosSection } from "@/components/RecentHellosSection";
import { HomeStatsBar } from "@/components/HomeStatsBar";
import { SaveHelloButton } from "@/components/SaveHelloButton";
import { HelloOfTheDay } from "@/components/HelloOfTheDay";
import EditHelloDialog from "@/components/EditHelloDialog";
import { HelloLog } from "@/hooks/useHelloLogs";
import { LogHelloButton } from "@/components/LogHelloButton";
import { DayChallengeRevealDialog } from "@/components/DayChallengeRevealDialog";
import { ChallengeCompletionCelebrationDialog } from "@/components/ChallengeCompletionCelebrationDialog";
import { OnboardingCompleteMilestoneDialog } from "@/components/OnboardingCompleteMilestoneDialog";
import { WeeklyChallengeCompleteDialog } from "@/components/WeeklyChallengeCompleteDialog";
import { WeeklyGoalCelebrationDialog } from "@/components/WeeklyGoalCelebrationDialog";
import { DailyStreakCelebrationDialog } from "@/components/DailyStreakCelebrationDialog";
import { LevelUpCelebrationDialog } from "@/components/LevelUpCelebrationDialog";
import { SaveProgressDialog } from "@/components/SaveProgressDialog";
import { HomeScreenTutorial } from "@/components/HomeScreenTutorial";
import { onboardingChallenges } from "@/data/onboardingChallenges";
import { getTodaysHello } from "@/data/dailyHellos";
import { getThisWeeksChallenge } from "@/data/weeklyChallenges";
import { calculateHelloXp, getLevelFromXp } from "@/lib/xpSystem";
import { toast } from "sonner";
import { format, startOfWeek, isBefore, parseISO, differenceInDays } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";



import { normalizeTimezoneOffset, getDayKeyInOffset, getDayKeyDifference, getYesterdayKeyInOffset } from "@/lib/timezone";

const getWeekStartKeyInOffset = (date: Date, offset: string) => {
  // Use date-fns-tz to avoid off-by-one issues when the browser timezone differs
  // from the user's chosen offset.
  const normalizedOffset = normalizeTimezoneOffset(offset);
  const zonedNow = toZonedTime(date, normalizedOffset);
  const weekStart = startOfWeek(zonedNow, { weekStartsOn: 1 });
  return formatInTimeZone(weekStart, normalizedOffset, "yyyy-MM-dd");
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress: cloudProgress, loading: progressLoading, updateProgress: updateCloudProgress, refetch } = useUserProgress();
  const { logs: cloudLogs, loading: logsLoading, addLog: addCloudLog, updateLog: updateCloudLog, getLogsTodayCount } = useHelloLogs();
  const { timezoneOffset, loading: timezoneLoading } = useTimezone();
  const { 
    guestProgress, 
    guestLogs, 
    loading: guestLoading, 
    updateProgress: updateGuestProgress, 
    addLog: addGuestLog,
    shouldShowSavePrompt,
    dismissSavePrompt,
    guestState,
    isGuest,
    isAnonymous
  } = useGuestMode();
  
  // Unified progress and logs
  // For anonymous users (isAnonymous), use guestProgress which comes from useGuestMode
  // For regular authenticated users, use cloudProgress from useUserProgress
  const progress = isAnonymous ? (guestProgress ? {
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
    onboarding_week_start: guestProgress.onboarding_week_start,
    week_start_date: guestProgress.week_start_date,
    has_completed_onboarding: guestProgress.has_completed_onboarding,
    orbs: guestProgress.orbs,
    has_received_first_orb: guestProgress.has_received_first_orb,
    total_hellos: guestProgress.total_hellos,
    total_xp: guestProgress.total_xp,
    current_level: guestProgress.current_level,
    hellos_today_count: guestProgress.hellos_today_count,
    names_today_count: guestProgress.names_today_count,
    notes_today_count: guestProgress.notes_today_count,
    last_xp_reset_date: guestProgress.last_xp_reset_date,
  } : null) : cloudProgress;
  
  const logs = isAnonymous ? guestLogs.map(log => ({
    ...log,
    user_id: guestProgress?.user_id || '',
    location: (log as any).location || null,
    no_name_flag: (log as any).no_name_flag || false,
  })) : cloudLogs;
  
  const updateProgress = isAnonymous ? updateGuestProgress : updateCloudProgress;
  const addLog = isAnonymous ? async (data: Parameters<typeof addCloudLog>[0]) => {
    const result = await addGuestLog({
      name: data.name || null,
      notes: data.notes || null,
      rating: data.rating || null,
      difficulty_rating: data.difficulty_rating || null,
      timezone_offset: '+00:00',
    });
    return result;
  } : addCloudLog;

  const tzOffset = normalizeTimezoneOffset(timezoneOffset);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [selectedHelloType, setSelectedHelloType] = useState<string>('regular_hello');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [username, setUsername] = useState("");
  
  // Dialog states
  const [showFirstOrbGift, setShowFirstOrbGift] = useState(false);
  const [showComeBackTomorrow, setShowComeBackTomorrow] = useState(false);
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [showDailyModeConfirm, setShowDailyModeConfirm] = useState(false);
  const [showChillModeConfirm, setShowChillModeConfirm] = useState(false);
  const [showWeeklyOrbDialog, setShowWeeklyOrbDialog] = useState(false);
  const [showStreakSaverDialog, setShowStreakSaverDialog] = useState(false);
  const [streakSaverScenario, setStreakSaverScenario] = useState<StreakSaverScenario>('can_save');
  const [missedDays, setMissedDays] = useState(0);
  const [previousStreak, setPreviousStreak] = useState(0);
  const [showDayReveal, setShowDayReveal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showWeeklyChallengeComplete, setShowWeeklyChallengeComplete] = useState(false);
  const [weeklyChallengeOrbAwarded, setWeeklyChallengeOrbAwarded] = useState(false);
  const [showWeeklyGoalCelebration, setShowWeeklyGoalCelebration] = useState(false);
  const [newWeeklyStreakValue, setNewWeeklyStreakValue] = useState(1);
  const [showDailyStreakCelebration, setShowDailyStreakCelebration] = useState(false);
  const [newDailyStreakValue, setNewDailyStreakValue] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevelValue, setNewLevelValue] = useState(1);
  const [pendingMode, setPendingMode] = useState<'daily' | 'chill' | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [autoStartRecording, setAutoStartRecording] = useState(false);
  const [showHomeTutorial, setShowHomeTutorial] = useState(false);
  const [tutorialMode, setTutorialMode] = useState<'daily' | 'chill'>('daily');
  
  
  // Edit hello dialog states
  
  // Edit hello dialog states
  const [editingLog, setEditingLog] = useState<HelloLog | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUsername = async () => {
      // Resolve a display name that works for:
      // - Signed-in users
      // - Anonymous (guest) users
      // - Legacy/non-auth guest state (fallback)
      let resolvedName: string | null = null;

      if (user) {
        // For authenticated users (including anonymous), check profiles table first
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && profile?.username) {
          resolvedName = profile.username;
        }

        // Next, try auth metadata (may be empty for anonymous users)
        if (!resolvedName && user.user_metadata?.name) {
          resolvedName = user.user_metadata.name;
        }

        // Finally, fall back to progress-derived names (covers anonymous users even if profiles SELECT fails)
        if (!resolvedName && (progress as any)?.username) {
          resolvedName = (progress as any).username;
        }
        if (!resolvedName && guestProgress?.username) {
          resolvedName = guestProgress.username;
        }
      } else {
        // Legacy non-auth guest fallback
        if (guestProgress?.username) {
          resolvedName = guestProgress.username;
        }
        if (!resolvedName && (progress as any)?.username) {
          resolvedName = (progress as any).username;
        }
      }

      setUsername(resolvedName || 'Friend');
    };
    fetchUsername();
  }, [user?.id, user?.user_metadata?.name, guestProgress?.username, (progress as any)?.username]);

  // Fix for existing users who completed first hello but have streak 0
  useEffect(() => {
    const fixStreakIfNeeded = async () => {
      if (!progress) return;
      
      // If user has logs but daily_streak is 0, fix it
      const hasLogs = logs.length > 0;
      const streakIsZero = (progress.daily_streak || 0) === 0;
      
      if (hasLogs && streakIsZero) {
        const today = getDayKeyInOffset(new Date(), tzOffset);
        await updateProgress({
          daily_streak: 1,
          current_streak: 1,
          last_completed_date: progress.last_completed_date || today,
          total_hellos: logs.length,
        });
      }
    };
    
    fixStreakIfNeeded();
  }, [progress?.daily_streak, logs.length]);

  // Determine which day of onboarding the user is on
  const getOnboardingDay = () => {
    if (!progress?.onboarding_week_start) return 1;
    const start = new Date(progress.onboarding_week_start);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dayDiff = differenceInDays(now, start) + 1;
    return Math.min(Math.max(dayDiff, 1), 7);
  };

  const currentOnboardingDay = getOnboardingDay();

  // Get completed days from logs (for legacy 7-day-starter mode)
  // Since hello_type is removed, we just count unique days with hellos
  const getCompletedDaysCount = () => {
    if (!progress?.is_onboarding_week || progress?.has_completed_onboarding) return 0;
    
    const onboardingStart = new Date(progress.onboarding_week_start || new Date());
    const uniqueDays = new Set<string>();
    
    logs.forEach(log => {
      const logDate = new Date(log.created_at);
      if (logDate >= onboardingStart) {
        uniqueDays.add(logDate.toDateString());
      }
    });
    
    return Math.min(uniqueDays.size, 7);
  };

  const completedDaysCount = getCompletedDaysCount();
  const allOnboardingComplete = completedDaysCount >= 7;

  // isFirstHellosMode is no longer needed - always show main dashboard

  // Weekly reset logic - check for missed weekly goal (Chill Mode)
  // Use a ref to prevent the effect from running multiple times
  const [weeklyResetDone, setWeeklyResetDone] = useState(false);
  
  useEffect(() => {
    if (!progress || progressLoading || weeklyResetDone || timezoneLoading) return;
    if (progress.is_onboarding_week) return;

    const weekStartStr = getWeekStartKeyInOffset(new Date(), tzOffset);

    if (progress.week_start_date) {
      const storedWeekStart = parseISO(progress.week_start_date);
      const currentWeekStart = parseISO(weekStartStr);

      // Only reset if the stored week is BEFORE the current week start
      if (isBefore(storedWeekStart, currentWeekStart)) {
        const mode = progress.mode || 'daily';
        const target = mode === 'chill' ? 3 : 7;
        const targetMet = (progress.hellos_this_week || 0) >= target;
        
        setWeeklyResetDone(true); // Prevent re-running
        
        if (mode === 'chill' && !targetMet && (progress.weekly_streak || 0) > 0) {
          setShowWeeklyOrbDialog(true);
        } else {
          const newWeeklyStreak = targetMet ? (progress.weekly_streak || 0) + 1 : 0;
          const newLongestStreak = Math.max(newWeeklyStreak, progress.longest_streak || 0);

          updateProgress({
            hellos_this_week: 0,
            week_start_date: weekStartStr,
            weekly_streak: newWeeklyStreak,
            longest_streak: newLongestStreak,
            weekly_goal_achieved_this_week: false,
          });

          if (targetMet) {
            toast.success(`🎉 Week completed! Your streak is now ${newWeeklyStreak} weeks!`);
          }
        }
      }
    } else {
      // Initialize week_start_date if not set
      setWeeklyResetDone(true);
      updateProgress({
        week_start_date: weekStartStr,
        weekly_goal_achieved_this_week: false,
      });
    }
  }, [progress, progressLoading, weeklyResetDone, timezoneLoading, tzOffset]);

  // Check for missed daily streak with 48-hour (2 missed days) grace period
  useEffect(() => {
    // CRITICAL: Wait for timezone to load to avoid false positives with wrong date calculation
    if (!progress || progressLoading || logsLoading || timezoneLoading) return;

    // Check both daily mode and 7-day-starter mode for missed streak
    const mode = progress.mode || '7-day-starter';
    const shouldCheckDailyStreak = mode === 'daily' || mode === '7-day-starter';
    if (!shouldCheckDailyStreak) return;

    const dailyStreak = progress.daily_streak || 0;
    const lastCompletedDate = progress.last_completed_date;
    const saveOfferedForDate = progress.save_offered_for_date;
    const today = getDayKeyInOffset(new Date(), tzOffset);
    const currentOrbs = progress.orbs || 0;

    // Only show dialog if user has a streak to save
    if (dailyStreak > 0 && lastCompletedDate) {
      // Normalize lastCompletedDate to date-only format
      const normalizedLastDate = lastCompletedDate.includes('T') 
        ? lastCompletedDate.split('T')[0] 
        : lastCompletedDate;
      
      const hasHelloToday = normalizedLastDate === today;

      if (!hasHelloToday) {
        // Use stable day-key arithmetic instead of parseISO/differenceInDays 
        // to avoid browser timezone drift issues
        const daysSinceLastHello = getDayKeyDifference(normalizedLastDate, today);

        // Only show dialog if we haven't already offered today
        if (saveOfferedForDate !== today) {
          setMissedDays(daysSinceLastHello);
          setPreviousStreak(dailyStreak);

          // CRITICAL FIX: d=1 means yesterday (still safe), d>=2 means missed days
          // Only prompt when d >= 2 (missed at least 1 full day)
          if (daysSinceLastHello >= 4) {
            // Too late to save - missed 3+ days, streak must reset
            setStreakSaverScenario('fresh_start');
            setShowStreakSaverDialog(true);
            updateProgress({ save_offered_for_date: today });
          } else if (daysSinceLastHello >= 2) {
            // Within 2-day forgiveness window (d=2 or d=3 means missed 1-2 days)
            if (currentOrbs > 0) {
              setStreakSaverScenario('can_save');
              setShowStreakSaverDialog(true);
              updateProgress({ save_offered_for_date: today });
            } else {
              setStreakSaverScenario('no_orbs');
              setShowStreakSaverDialog(true);
              updateProgress({ save_offered_for_date: today });
            }
          }
          // If d === 1, do nothing - user logged yesterday, still safe today
        }
      }
    }
  }, [progress, progressLoading, logsLoading, timezoneLoading, logs, tzOffset]);

  // Handle using an orb to save streak
  const handleStreakSaverUseOrb = async () => {
    const currentOrbs = progress?.orbs || 0;
    if (currentOrbs > 0) {
      // Set last_completed_date to YESTERDAY so the next real hello can increment the streak
      const yesterday = getYesterdayKeyInOffset(new Date(), tzOffset);
      
      // Consume 1 orb, keep streak intact, set last_completed_date to yesterday
      // This does NOT count as a real hello - no XP, no hello count increase
      await updateProgress({
        orbs: currentOrbs - 1,
        last_completed_date: yesterday,
        // Keep current streak - don't increment, just preserve
      });
      toast.success("✨ Orb used! Your streak is saved.");
    }
    setShowStreakSaverDialog(false);
  };

  // Handle letting streak reset (user choice)
  const handleStreakSaverLetReset = async () => {
    await updateProgress({ daily_streak: 0 });
    toast.info("Your streak has been reset. Start fresh today!");
    setShowStreakSaverDialog(false);
  };

  // Handle accepting gift orb when no orbs available
  const handleStreakSaverAcceptGift = async () => {
    const currentOrbs = progress?.orbs || 0;
    await updateProgress({ 
      daily_streak: 0,
      orbs: Math.min(currentOrbs + 1, 3) // Gift 1 orb, max 3
    });
    toast.success("🎁 You received a gift orb! Use it to save your next streak.");
    setShowStreakSaverDialog(false);
  };

  // Handle fresh start (streak was too far gone)
  const handleStreakSaverFreshStart = async () => {
    await updateProgress({ daily_streak: 0 });
    toast.info("Fresh start! Let's build your streak again.");
    setShowStreakSaverDialog(false);
  };

  const handleUseWeeklyOrb = async () => {
    const currentOrbs = progress?.orbs || 0;

    const weekStartStr = getWeekStartKeyInOffset(new Date(), tzOffset);

    if (currentOrbs > 0) {
      await updateProgress({
        orbs: currentOrbs - 1,
        hellos_this_week: 0,
        week_start_date: weekStartStr,
      });
      toast.success("✨ Orb used! Your weekly streak is protected.");
    }
    setShowWeeklyOrbDialog(false);
  };

  const handleDeclineWeeklyOrb = async () => {
    const weekStartStr = getWeekStartKeyInOffset(new Date(), tzOffset);

    await updateProgress({
      weekly_streak: 0,
      hellos_this_week: 0,
      week_start_date: weekStartStr,
    });
    toast.info("Your weekly streak has been reset to 0.");
    setShowWeeklyOrbDialog(false);
  };

  // NOTE: Daily streak updates are handled exclusively in handleLogHello
  // to prevent race conditions. Do not add duplicate streak logic here.

  const handleLogHello = async (data: { name?: string; location?: string; notes?: string; rating?: 'positive' | 'neutral' | 'negative'; difficulty_rating?: number; no_name_flag?: boolean }) => {
    const isFirstHelloEver = logs.length === 0 && !progress?.has_received_first_orb;
    const isOnboardingChallenge = onboardingChallenges.some(c => c.title === selectedChallenge);

    const today = getDayKeyInOffset(new Date(), tzOffset);
    const isFirstHelloToday = !progress?.last_completed_date || progress.last_completed_date !== today;

    const result = await addLog({
      ...data
    });

    if (result) {
      const previousHellosThisWeek = progress?.hellos_this_week || 0;
      const newHellosThisWeek = previousHellosThisWeek + 1;
      const newTotalHellos = (progress?.total_hellos || logs.length) + 1;

      // Check if this is a weekly challenge completion - award orb (max 3)
      const isWeeklyChallenge = selectedHelloType === "remis_challenge";
      const isTodaysHello = selectedHelloType === "todays_hello";
      const currentOrbs = progress?.orbs || 0;
      const lastChallengeDate = progress?.last_weekly_challenge_date;

      // Prefer the stored week_start_date from user_progress (source of truth).
      // Fallback to computing in user's timezone if it's missing.
      const thisWeekStartStr = progress?.week_start_date
        ? progress.week_start_date
        : (() => {
            return getWeekStartKeyInOffset(new Date(), tzOffset);
          })();

      const alreadyEarnedThisWeek = !!(lastChallengeDate && lastChallengeDate >= thisWeekStartStr);

      // XP System - check if daily counts need reset
      const lastXpResetDate = progress?.last_xp_reset_date;
      const needsXpReset = lastXpResetDate !== today;

      let hellosToday = needsXpReset ? 0 : (progress?.hellos_today_count || 0);
      let namesToday = needsXpReset ? 0 : (progress?.names_today_count || 0);
      let notesToday = needsXpReset ? 0 : (progress?.notes_today_count || 0);

      // Check if this completes weekly goal (for XP bonus)
      const mode = (progress?.mode === 'connect' ? 'chill' : (progress?.mode || 'daily')) as 'daily' | 'chill';
      const isChillMode = mode === 'chill' && !progress?.is_onboarding_week;
      const alreadyAchievedThisWeek = (progress as any)?.weekly_goal_achieved_this_week === true;
      const justHitWeeklyGoal = isChillMode && newHellosThisWeek >= 3 && !alreadyAchievedThisWeek;

      // Calculate XP
      const xpResult = calculateHelloXp(
        hellosToday,
        namesToday,
        notesToday,
        !!data.name && data.name.trim().length > 0,
        !!data.notes && data.notes.trim().length > 0,
        isTodaysHello,
        isWeeklyChallenge,
        justHitWeeklyGoal,
        mode,
        progress?.daily_streak || 0,
        progress?.weekly_streak || 0
      );

      const currentXp = progress?.total_xp || 0;
      const newTotalXp = currentXp + xpResult.totalXp;
      const currentLevel = progress?.current_level || 1;
      const newLevel = getLevelFromXp(newTotalXp);
      const didLevelUp = newLevel > currentLevel;

      // Calculate the new daily streak
      let newDailyStreak = progress?.daily_streak || 0;
      let streakWasIncremented = false;

      if (isFirstHelloToday) {
        // First hello of the day - check if we should increment streak
        const lastDate = progress?.last_completed_date;
        if (lastDate) {
          // Normalize to date-only format
          const normalizedLastDate = lastDate.includes('T') 
            ? lastDate.split('T')[0] 
            : lastDate;
          // Use stable day-key arithmetic instead of parseISO/differenceInDays
          const diffDays = getDayKeyDifference(normalizedLastDate, today);

          if (diffDays <= 1) {
            // Yesterday was completed (or orb was used which sets to yesterday) - increment streak
            newDailyStreak = (progress?.daily_streak || 0) + 1;
            streakWasIncremented = true;
          } else {
            // Missed days - reset to 1
            newDailyStreak = 1;
          }
        } else {
          // First ever hello
          newDailyStreak = 1;
        }
      }
      // If not first hello today, keep current streak value

      const updates: Record<string, unknown> = {
        hellos_this_week: newHellosThisWeek,
        last_completed_date: today,
        total_hellos: newTotalHellos,
        daily_streak: newDailyStreak,
        // XP updates
        total_xp: newTotalXp,
        current_level: newLevel,
        hellos_today_count: hellosToday + 1,
        names_today_count: data.name ? namesToday + 1 : namesToday,
        notes_today_count: data.notes ? notesToday + 1 : notesToday,
        last_xp_reset_date: today
      };

      // Award orb for weekly challenge (max 3, once per week)
      let orbAwardedThisTime = false;
      if (isWeeklyChallenge && !alreadyEarnedThisWeek && currentOrbs < 3) {
        updates.orbs = currentOrbs + 1;
        updates.last_weekly_challenge_date = today;
        orbAwardedThisTime = true;
      } else if (isWeeklyChallenge) {
        updates.last_weekly_challenge_date = today;
      }

      if (justHitWeeklyGoal) {
        const currentWeeklyStreak = progress?.weekly_streak || 0;
        const newWeeklyStreak = currentWeeklyStreak + 1;
        updates.weekly_streak = newWeeklyStreak;
        updates.longest_streak = Math.max(newWeeklyStreak, progress?.longest_streak || 0);
        updates.weekly_goal_achieved_this_week = true;
        setNewWeeklyStreakValue(newWeeklyStreak);
      }

      await updateProgress(updates);

      // Show XP toast
      if (xpResult.totalXp > 0) {
        toast.success(`+${xpResult.totalXp} XP earned!`, {
          description: xpResult.breakdown.slice(0, 2).join(' • ')
        });
      }

      // Show level up celebration
      if (didLevelUp) {
        setNewLevelValue(newLevel);
        setTimeout(() => setShowLevelUp(true), 500);
      }

      // Show celebration for onboarding challenges (only in 7-day-starter mode)
      // For Day 1 (first hello ever), only show FirstOrbGiftDialog (skip ChallengeCompletionCelebrationDialog)
      if (isOnboardingChallenge && progress?.is_onboarding_week && progress?.mode === '7-day-starter') {
        if (!isFirstHelloEver) {
          // Days 2-7: show the normal celebration dialog
          setShowCelebration(true);
        }
      } else if (justHitWeeklyGoal) {
        // Show weekly goal celebration in Chill mode
        setShowWeeklyGoalCelebration(true);
      } else if (streakWasIncremented && progress?.mode === 'daily') {
        // Show daily streak celebration in Daily mode when streak increases
        setNewDailyStreakValue(newDailyStreak);
        setShowDailyStreakCelebration(true);
      } else if (isWeeklyChallenge) {
        // Show weekly challenge completion celebration
        setWeeklyChallengeOrbAwarded(orbAwardedThisTime);
        setShowWeeklyChallengeComplete(true);
      }

      // First orb is now handled in onboarding flow, not here
      // This is kept as a fallback for edge cases only
      if (isFirstHelloEver && !progress?.has_received_first_orb) {
        setShowFirstOrbGift(true);
      }
      
      // Show save prompt for guests at 2, 8, and 20 hellos
      if (isAnonymous && shouldShowSavePrompt()) {
        // Delay slightly so other dialogs can show first
        setTimeout(() => {
          setShowSavePrompt(true);
        }, 1000);
      }
    }
    
    setSelectedChallenge(null);
  };

  const handleCelebrationContinue = () => {
    setShowCelebration(false);
    
    // Check if all 7 are now complete - completedDaysCount already includes the just-completed challenge
    // since logs have been refetched, so no need to add +1
    if (completedDaysCount >= 7) {
      setShowMilestone(true);
    }
    // Don't show ComeBackTomorrow - celebration messages now include this context
  };

  const handleMilestoneContinue = () => {
    setShowMilestone(false);
    setShowModeSelection(true);
  };

  const handleClaimFirstOrb = async () => {
    const currentOrbs = progress?.orbs || 0;
    await updateProgress({ 
      orbs: Math.min(currentOrbs + 1, 3),
      has_received_first_orb: true 
    });
    setShowFirstOrbGift(false);
    // Don't show ComeBackTomorrow since FirstOrbGiftDialog now includes that messaging
  };

  // Check if all 7 onboarding challenges are complete - show mode selection (7-day starter only)
  useEffect(() => {
    // Only trigger in 7-day-starter mode
    if (progress?.mode !== '7-day-starter') return;
    if (allOnboardingComplete && progress?.is_onboarding_week && !progress?.has_completed_onboarding) {
      setShowMilestone(true);
    }
  }, [allOnboardingComplete, progress?.is_onboarding_week, progress?.has_completed_onboarding, progress?.mode]);

  // Track if we've already awarded the initiation orb this session to prevent duplicates
  const [hasAwardedInitiationOrb, setHasAwardedInitiationOrb] = useState(false);

  const handleModeSelect = async (mode: 'daily' | 'chill') => {
    setPendingMode(mode);
    setShowModeSelection(false);
    
    // For daily mode, skip the confirmation dialog and go straight to tutorial
    if (mode === 'daily') {
      // Trigger mode confirmation immediately
      setTutorialMode('daily');
      
      const target = 7;
      const FIRST_HELLOS_COMPLETE_BONUS = 50;
      const currentTotalXp = progress?.total_xp || 0;
      const newTotalXp = currentTotalXp + FIRST_HELLOS_COMPLETE_BONUS;
      const oldLevel = progress?.current_level || getLevelFromXp(currentTotalXp);
      const newLevel = getLevelFromXp(newTotalXp);
      
      await updateProgress({ 
        mode: 'daily',
        target_hellos_per_week: target,
        has_completed_onboarding: true,
        is_onboarding_week: false,
        hellos_this_week: 0,
        week_start_date: getWeekStartKeyInOffset(new Date(), tzOffset),
        current_phase: 'daily_path',
        onboarding_completed_at: new Date().toISOString(),
        daily_path_selected_at: new Date().toISOString(),
        chill_path_selected_at: null,
        total_xp: newTotalXp,
        current_level: newLevel
      });
      
      setPendingMode(null);
      
      // Show tutorial after a brief delay
      setTimeout(() => {
        setShowHomeTutorial(true);
      }, 300);
      
      // Check for level up after tutorial completes
      if (newLevel > oldLevel) {
        setNewLevelValue(newLevel);
      }
    } else {
      // Chill mode - go directly to tutorial (skip confirmation dialog)
      const target = 3;
      
      // Award 50 XP bonus for completing First Hellos
      const FIRST_HELLOS_COMPLETE_BONUS = 50;
      const currentTotalXp = progress?.total_xp || 0;
      const newTotalXp = currentTotalXp + FIRST_HELLOS_COMPLETE_BONUS;
      const oldLevel = progress?.current_level || getLevelFromXp(currentTotalXp);
      const newLevel = getLevelFromXp(newTotalXp);
      
      await updateProgress({ 
        mode: 'chill',
        target_hellos_per_week: target,
        has_completed_onboarding: true,
        is_onboarding_week: false,
        hellos_this_week: 0,
        week_start_date: getWeekStartKeyInOffset(new Date(), tzOffset),
        current_phase: 'chill_path',
        onboarding_completed_at: new Date().toISOString(),
        daily_path_selected_at: null,
        chill_path_selected_at: new Date().toISOString(),
        total_xp: newTotalXp,
        current_level: newLevel
      });
      
      setTutorialMode('chill');
      setPendingMode(null);
      
      // Show tutorial after a brief delay
      setTimeout(() => {
        setShowHomeTutorial(true);
      }, 300);
      
      // Check for level up after tutorial completes
      if (newLevel > oldLevel) {
        setNewLevelValue(newLevel);
      }
    }
  };

  const handleModeConfirmContinue = async () => {
    if (!pendingMode) return;
    
    const target = pendingMode === 'daily' ? 7 : 3;
    const isDaily = pendingMode === 'daily';
    
    // Award 50 XP bonus for completing First Hellos
    const FIRST_HELLOS_COMPLETE_BONUS = 50;
    const currentTotalXp = progress?.total_xp || 0;
    const newTotalXp = currentTotalXp + FIRST_HELLOS_COMPLETE_BONUS;
    const oldLevel = progress?.current_level || getLevelFromXp(currentTotalXp);
    const newLevel = getLevelFromXp(newTotalXp);
    
    await updateProgress({ 
      mode: pendingMode,
      target_hellos_per_week: target,
      has_completed_onboarding: true,
      is_onboarding_week: false,
      hellos_this_week: 0,
      week_start_date: getWeekStartKeyInOffset(new Date(), tzOffset),
      current_phase: isDaily ? 'daily_path' : 'chill_path',
      onboarding_completed_at: new Date().toISOString(),
      daily_path_selected_at: isDaily ? new Date().toISOString() : null,
      chill_path_selected_at: !isDaily ? new Date().toISOString() : null,
      total_xp: newTotalXp,
      current_level: newLevel
    });
    
    setShowDailyModeConfirm(false);
    setShowChillModeConfirm(false);
    
    // Set up tutorial
    setTutorialMode(pendingMode);
    setPendingMode(null);
    
    // Show tutorial after a brief delay for the mode confirmation to close
    setTimeout(() => {
      setShowHomeTutorial(true);
    }, 300);
    
    // Check for level up after tutorial completes
    if (newLevel > oldLevel) {
      setNewLevelValue(newLevel);
      // Delay level up to show after tutorial
      // We'll handle this when tutorial completes
    }
  };

  // Check if today's hello is completed - now just checks if any hello was logged today
  const isTodaysHelloComplete = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return logs.some(log => {
      const logDate = new Date(log.created_at);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime();
    });
  };

  // Check if weekly challenge is completed this week
  // Now uses stored progress field only (since hello_type is removed)
  const isWeeklyChallengeComplete = () => {
    if (!progress) return false;

    const weekStartStr = progress.week_start_date
      ? progress.week_start_date
      : (() => {
          if (timezoneLoading) return null;
          return getWeekStartKeyInOffset(new Date(), tzOffset);
        })();

    if (!weekStartStr) return false;

    // Primary source of truth - compare date strings
    const lastChallengeDate = progress.last_weekly_challenge_date;
    
    return !!(lastChallengeDate && lastChallengeDate >= weekStartStr);
  };

  const todaysHello = getTodaysHello();
  const thisWeeksChallenge = getThisWeeksChallenge();
  const todaysOnboardingChallenge = onboardingChallenges[currentOnboardingDay - 1];

  const isLoading = isAnonymous ? (guestLoading || timezoneLoading) : (progressLoading || logsLoading || timezoneLoading);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!progress) return null;

  // Full-screen milestone dialog for onboarding completion (with orb ceremony)
  // Now uses a dialog overlay instead of replacing the whole page

  // Full-screen Log Hello
  if (showLogDialog) {
    return (
      <LogHelloScreen
        onBack={() => {
          setShowLogDialog(false);
          setSelectedChallenge(null);
          setSelectedHelloType('regular_hello');
          setAutoStartRecording(false);
        }}
        onLog={handleLogHello}
        challengeTitle={selectedChallenge}
        autoStartRecording={autoStartRecording}
      />
    );
  }

  const mode = (progress.mode === 'connect' ? 'chill' : (progress.mode || 'daily')) as 'daily' | 'chill';
  const targetHellos = mode === 'chill' ? 5 : 7;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-8">

        {/* Friendly Header Greeting */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-wide" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            <span style={{ color: '#ff6f3b' }}>Hello</span> {username} 👋
          </h1>
        </div>

        {/* Stats Dashboard */}
        <HomeStatsBar 
          logs={logs} 
          lifetimeHellos={logs.length} 
        />

        {/* Main Dashboard - Connection-focused layout */}
        <div className="space-y-6">
          
            {/* Memory & Today's Hello - Tighter spacing */}
            <div className="space-y-3">
              {/* Memory - Featured memory from user's history */}
              <HelloOfTheDay 
                logs={logs} 
                onEditLog={(log) => {
                  setEditingLog(log as HelloLog);
                  setIsEditDialogOpen(true);
                }}
              />

              {/* Today's Hello - Daily inspiration */}
              <DailySuggestionCard />
            </div>

            {/* Log a Hello Button */}
            <div className="py-2">
              <SaveHelloButton
                onClick={() => {
                  setSelectedChallenge(null);
                  setSelectedHelloType('regular_hello');
                  setAutoStartRecording(false);
                  setShowLogDialog(true);
                }}
                onDictateClick={() => {
                  setSelectedChallenge(null);
                  setSelectedHelloType('regular_hello');
                  setAutoStartRecording(true);
                  setShowLogDialog(true);
                }}
              />
            </div>

            {/* Recent Hellos Section */}
            <RecentHellosSection
              logs={logs}
              onViewAll={() => navigate('/hellobook')}
              onEditLog={(log) => {
                setEditingLog(log);
                setIsEditDialogOpen(true);
              }}
            />
            
            {/* Spacer for bottom nav */}
            <div className="h-8" />
        </div>
      </div>


      {/* Dialogs */}

      {todaysOnboardingChallenge && (
        <DayChallengeRevealDialog
          open={showDayReveal}
          onOpenChange={setShowDayReveal}
          dayNumber={currentOnboardingDay}
          challengeTitle={todaysOnboardingChallenge.title}
          challengeDescription={todaysOnboardingChallenge.description}
          challengeSuggestion={todaysOnboardingChallenge.suggestion}
          onAccept={() => setShowDayReveal(false)}
        />
      )}

      <ChallengeCompletionCelebrationDialog
        open={showCelebration}
        onContinue={handleCelebrationContinue}
        dayNumber={selectedDayNumber}
        currentStreak={progress?.daily_streak || 0}
        username={username}
        isFirstHelloEver={logs.length === 1}
        isPerfectWeek={(progress?.daily_streak || 0) === 7 && selectedDayNumber === 7}
        totalChallengesCompleted={getCompletedDaysCount() + 1}
      />

      <FirstOrbGiftDialog
        open={showFirstOrbGift}
        onClaim={handleClaimFirstOrb}
        username={username}
      />

      <OnboardingCompleteMilestoneDialog
        open={showMilestone}
        onContinue={handleMilestoneContinue}
      />

      <ComeBackTomorrowDialog
        open={showComeBackTomorrow}
        onContinue={() => setShowComeBackTomorrow(false)}
      />


      {/* Streak Saver Dialog - handles all scenarios */}
      <StreakSaverDialog
        open={showStreakSaverDialog}
        onClose={() => setShowStreakSaverDialog(false)}
        scenario={streakSaverScenario}
        orbsAvailable={progress?.orbs || 0}
        missedDays={missedDays}
        previousStreak={previousStreak}
        onUseOrb={handleStreakSaverUseOrb}
        onLetReset={handleStreakSaverLetReset}
        onAcceptGift={handleStreakSaverAcceptGift}
        onFreshStart={handleStreakSaverFreshStart}
      />

      <UseOrbDialog
        open={showWeeklyOrbDialog}
        onUseOrb={handleUseWeeklyOrb}
        onDecline={handleDeclineWeeklyOrb}
        type="weekly"
        orbsAvailable={progress?.orbs || 0}
      />

      <WeeklyChallengeCompleteDialog
        open={showWeeklyChallengeComplete}
        onContinue={() => setShowWeeklyChallengeComplete(false)}
        orbsAwarded={weeklyChallengeOrbAwarded}
      />

      <WeeklyGoalCelebrationDialog
        open={showWeeklyGoalCelebration}
        onContinue={() => setShowWeeklyGoalCelebration(false)}
        newStreak={newWeeklyStreakValue}
      />

      <DailyStreakCelebrationDialog
        open={showDailyStreakCelebration}
        onContinue={() => setShowDailyStreakCelebration(false)}
        newStreak={newDailyStreakValue}
      />

      <LevelUpCelebrationDialog
        open={showLevelUp}
        onClose={() => setShowLevelUp(false)}
        newLevel={newLevelValue}
        totalXp={progress?.total_xp || 0}
      />

      {/* Save Progress Dialog for Guests */}
      <SaveProgressDialog
        open={showSavePrompt}
        onOpenChange={setShowSavePrompt}
        onDismiss={dismissSavePrompt}
        totalHellos={guestState?.total_hellos_logged || 0}
      />

      {/* Home Screen Tutorial - shows after mode selection */}
      <HomeScreenTutorial
        open={showHomeTutorial}
        mode={tutorialMode}
        onComplete={() => {
          setShowHomeTutorial(false);
          toast.success(`🎉 You're all set in ${tutorialMode === 'daily' ? 'Daily' : 'Chill'} Mode!`);
        }}
      />

      {/* Edit Hello Dialog */}
      <EditHelloDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        log={editingLog}
        onSave={async (id, updates) => {
          const result = await updateCloudLog(id, updates);
          if (result) {
            toast.success("Hello updated!");
          } else {
            toast.error("Failed to update hello");
          }
          return result;
        }}
      />
    </div>
  );
}
