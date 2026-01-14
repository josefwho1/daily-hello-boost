import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useHelloLogs } from "@/hooks/useHelloLogs";
import { useTimezone } from "@/hooks/useTimezone";
import { useGuestMode } from "@/hooks/useGuestMode";
import { LogHelloDialog, HelloType } from "@/components/LogHelloDialog";
import { FirstHelloCard } from "@/components/FirstHelloCard";
import { OnboardingChallengeCard } from "@/components/OnboardingChallengeCard";
import { FirstOrbGiftDialog } from "@/components/FirstOrbGiftDialog";
import { ComeBackTomorrowDialog } from "@/components/ComeBackTomorrowDialog";
import { ModeSelectionDialog } from "@/components/ModeSelectionDialog";
import { DailyModeSelectedDialog } from "@/components/DailyModeSelectedDialog";
import { ChillModeSelectedDialog } from "@/components/ChillModeSelectedDialog";
import { UseOrbDialog } from "@/components/UseOrbDialog";
import { TodaysHelloCard } from "@/components/TodaysHelloCard";
import { RemisWeeklyChallengeCard } from "@/components/RemisWeeklyChallengeCard";
import { StatsBar } from "@/components/StatsBar";
import { LogHelloButton } from "@/components/LogHelloButton";
import { DayChallengeRevealDialog } from "@/components/DayChallengeRevealDialog";
import { ChallengeCompletionCelebrationDialog } from "@/components/ChallengeCompletionCelebrationDialog";
import { OnboardingCompleteMilestoneDialog } from "@/components/OnboardingCompleteMilestoneDialog";
import { WeeklyChallengeCompleteDialog } from "@/components/WeeklyChallengeCompleteDialog";
import { WeeklyGoalCelebrationDialog } from "@/components/WeeklyGoalCelebrationDialog";
import { LevelUpCelebrationDialog } from "@/components/LevelUpCelebrationDialog";
import { SaveProgressDialog } from "@/components/SaveProgressDialog";
import { FirstHelloInstructionDialog, FirstHelloPhase } from "@/components/FirstHelloInstructionDialog";
import { FirstHelloRatingDialog } from "@/components/FirstHelloRatingDialog";
import { firstHellos } from "@/data/firstHellos";
import { onboardingChallenges } from "@/data/onboardingChallenges";
import { getTodaysHello } from "@/data/dailyHellos";
import { getThisWeeksChallenge } from "@/data/weeklyChallenges";
import { calculateHelloXp, getLevelFromXp } from "@/lib/xpSystem";
import { toast } from "sonner";
import { format, startOfWeek, isBefore, parseISO, differenceInDays } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import logoSticker from "@/assets/one-hello-logo-tagline.svg";
import remiMascot from "@/assets/remi-waving.webp";
import { Sparkles } from "lucide-react";

const normalizeTimezoneOffset = (offset?: string | null) => {
  if (!offset) return "+00:00";
  return offset.startsWith("+") || offset.startsWith("-") ? offset : `+${offset}`;
};

const getDayKeyInOffset = (date: Date, offset: string) =>
  formatInTimeZone(date, offset, "yyyy-MM-dd");

const getWeekStartKeyInOffset = (date: Date, offset: string) => {
  // Use date-fns-tz to avoid off-by-one issues when the browser timezone differs
  // from the user's chosen offset.
  const zonedNow = toZonedTime(date, offset);
  const weekStart = startOfWeek(zonedNow, { weekStartsOn: 1 });
  return formatInTimeZone(weekStart, offset, "yyyy-MM-dd");
};

export default function Dashboard() {
  const { user } = useAuth();
  const { progress: cloudProgress, loading: progressLoading, updateProgress: updateCloudProgress, refetch } = useUserProgress();
  const { logs: cloudLogs, loading: logsLoading, addLog: addCloudLog, getLogsTodayCount } = useHelloLogs();
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
    isGuest
  } = useGuestMode();
  
  // Unified progress and logs - works for both guest and authenticated users
  const progress = user ? cloudProgress : (guestProgress ? {
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
  } : null);
  
  const logs = user ? cloudLogs : guestLogs.map(log => ({
    ...log,
    user_id: guestProgress?.guest_user_id || '',
  }));
  
  const updateProgress = user ? updateCloudProgress : updateGuestProgress;
  const addLog = user ? addCloudLog : async (data: Parameters<typeof addCloudLog>[0]) => {
    const result = await addGuestLog({
      name: data.name || null,
      notes: data.notes || null,
      hello_type: data.hello_type || null,
      rating: data.rating || null,
      difficulty_rating: data.difficulty_rating || null,
      timezone_offset: '+00:00',
    });
    return result;
  };

  const tzOffset = normalizeTimezoneOffset(timezoneOffset);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [selectedHelloType, setSelectedHelloType] = useState<HelloType>('regular_hello');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [username, setUsername] = useState("");
  
  // Dialog states
  const [showFirstOrbGift, setShowFirstOrbGift] = useState(false);
  const [showComeBackTomorrow, setShowComeBackTomorrow] = useState(false);
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [showDailyModeConfirm, setShowDailyModeConfirm] = useState(false);
  const [showChillModeConfirm, setShowChillModeConfirm] = useState(false);
  const [showDailyOrbDialog, setShowDailyOrbDialog] = useState(false);
  const [showWeeklyOrbDialog, setShowWeeklyOrbDialog] = useState(false);
  const [showDayReveal, setShowDayReveal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showWeeklyChallengeComplete, setShowWeeklyChallengeComplete] = useState(false);
  const [weeklyChallengeOrbAwarded, setWeeklyChallengeOrbAwarded] = useState(false);
  const [showWeeklyGoalCelebration, setShowWeeklyGoalCelebration] = useState(false);
  const [newWeeklyStreakValue, setNewWeeklyStreakValue] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevelValue, setNewLevelValue] = useState(1);
  const [pendingMode, setPendingMode] = useState<'daily' | 'chill' | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  
  // First Hello instruction dialog states
  const [showFirstHelloRating, setShowFirstHelloRating] = useState(false);
  const [showFirstHelloInstruction, setShowFirstHelloInstruction] = useState(false);
  const [firstHelloPhase, setFirstHelloPhase] = useState<FirstHelloPhase>('observation_intro');
  const [lastCompletedFirstHello, setLastCompletedFirstHello] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.user_metadata?.name || 'Friend');
    } else if (guestProgress?.username) {
      setUsername(guestProgress.username);
    }
  }, [user, guestProgress?.username]);

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

  // Get completed onboarding challenges from logs (for 7-day-starter legacy mode)
  const getCompletedOnboardingChallenges = () => {
    if (!progress?.is_onboarding_week || progress?.has_completed_onboarding) return [];
    
    const weekLogs = logs.filter(log => {
      const logDate = new Date(log.created_at);
      const onboardingStart = new Date(progress.onboarding_week_start || new Date());
      return logDate >= onboardingStart;
    });

    return weekLogs.map(log => log.hello_type).filter(Boolean);
  };

  const completedTypes = getCompletedOnboardingChallenges();
  
  // Count how many DAYS are completed (1 per day max) - for legacy 7-day-starter
  const getCompletedDaysCount = () => {
    let count = 0;
    for (let i = 0; i < onboardingChallenges.length; i++) {
      if (completedTypes.includes(onboardingChallenges[i].title)) {
        count++;
      }
    }
    return count;
  };

  const completedDaysCount = getCompletedDaysCount();
  const allOnboardingComplete = completedDaysCount >= 7;

  // First Hellos mode - get completed first hellos from logs
  const getCompletedFirstHellos = () => {
    if (progress?.mode !== 'first_hellos' || progress?.has_completed_onboarding) return [];
    return logs.map(log => log.hello_type).filter(Boolean);
  };

  const completedFirstHelloTypes = getCompletedFirstHellos();
  
  // Count completed first hellos
  const getCompletedFirstHellosCount = () => {
    let count = 0;
    for (let i = 0; i < firstHellos.length; i++) {
      if (completedFirstHelloTypes.includes(firstHellos[i].title)) {
        count++;
      }
    }
    return count;
  };

  const completedFirstHellosCount = getCompletedFirstHellosCount();
  const allFirstHellosComplete = completedFirstHellosCount >= 5;

  // Check if in First Hellos mode
  const isFirstHellosMode = progress?.mode === 'first_hellos' && !progress?.has_completed_onboarding;

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
        const target = mode === 'chill' ? 5 : 7;
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

  // Check for missed daily streak (Daily Mode AND 7-day-starter mode)
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

    if (dailyStreak > 0 && lastCompletedDate) {
      // Normalize lastCompletedDate to date-only format (handles both ISO timestamps and date-only strings)
      const normalizedLastDate = lastCompletedDate.includes('T') 
        ? lastCompletedDate.split('T')[0] 
        : lastCompletedDate;
      
      const hasHelloToday = normalizedLastDate === today;

      if (!hasHelloToday) {
        // Use normalized date-only strings for consistent comparison
        const lastDate = parseISO(normalizedLastDate);
        const todayDate = parseISO(today);
        const daysSinceLastHello = differenceInDays(todayDate, lastDate);

        // If more than 1 day has passed and we haven't offered save today
        if (daysSinceLastHello > 1 && saveOfferedForDate !== today) {
          setShowDailyOrbDialog(true);
          updateProgress({ save_offered_for_date: today });
        }
      }
    }
  }, [progress, progressLoading, logsLoading, timezoneLoading, logs, tzOffset]);

  const handleUseDailyOrb = async () => {
    const currentOrbs = progress?.orbs || 0;
    if (currentOrbs > 0) {
      // Using an Orb increments the streak by 1 and sets last_completed_date to TODAY
      // This prevents the hello logging logic from resetting the streak when a hello is logged the same day
      const today = getDayKeyInOffset(new Date(), tzOffset);

      await updateProgress({
        orbs: currentOrbs - 1,
        daily_streak: (progress?.daily_streak || 0) + 1,
        last_completed_date: today
      });
      toast.success("✨ Orb used! Your daily streak is protected.");
    }
    setShowDailyOrbDialog(false);
  };

  const handleDeclineDailyOrb = async () => {
    await updateProgress({ daily_streak: 0 });
    toast.info("Your daily streak has been reset to 0.");
    setShowDailyOrbDialog(false);
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

  const handleLogHello = async (data: { name?: string; notes?: string; rating?: 'positive' | 'neutral' | 'negative'; difficulty_rating?: number }) => {
    const isFirstHelloEver = logs.length === 0 && !progress?.has_received_first_orb;
    const isOnboardingChallenge = onboardingChallenges.some(c => c.title === selectedChallenge);

    const today = getDayKeyInOffset(new Date(), tzOffset);
    const isFirstHelloToday = !progress?.last_completed_date || progress.last_completed_date !== today;

    const result = await addLog({
      ...data,
      hello_type: selectedHelloType
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
      const justHitWeeklyGoal = isChillMode && newHellosThisWeek >= 5 && !alreadyAchievedThisWeek;

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

      if (isFirstHelloToday) {
        // First hello of the day - check if we should increment streak
        const lastDate = progress?.last_completed_date;
        if (lastDate) {
          const diffDays = differenceInDays(parseISO(today), parseISO(lastDate));

          if (diffDays <= 1) {
            // Yesterday was completed (or orb was used which sets to yesterday) - increment streak
            newDailyStreak = (progress?.daily_streak || 0) + 1;
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
      } else if (progress?.mode === 'first_hellos' && !progress?.has_completed_onboarding) {
        // First Hellos mode - show guided instruction dialogs
        const justCompletedType = selectedHelloType;
        setLastCompletedFirstHello(justCompletedType);
        
        if (justCompletedType === 'Greeting') {
          // First hello complete - show rating dialog
          setShowFirstHelloRating(true);
        } else if (justCompletedType === 'Observation') {
          setFirstHelloPhase('compliment_intro');
          setShowFirstHelloInstruction(true);
        } else if (justCompletedType === 'Compliment') {
          setFirstHelloPhase('question_intro');
          setShowFirstHelloInstruction(true);
        } else if (justCompletedType === 'Question') {
          setFirstHelloPhase('getname_intro');
          setShowFirstHelloInstruction(true);
        } else if (justCompletedType === 'Get a Name') {
          // All 5 complete - will trigger milestone via useEffect
        }
      } else if (justHitWeeklyGoal) {
        // Show weekly goal celebration in Chill mode
        setShowWeeklyGoalCelebration(true);
      } else if (isWeeklyChallenge) {
        // Show weekly challenge completion celebration
        setWeeklyChallengeOrbAwarded(orbAwardedThisTime);
        setShowWeeklyChallengeComplete(true);
      }

      // Day 1 shows the consolidated FirstOrbGiftDialog instead of multiple popups
      if (isFirstHelloEver) {
        setShowFirstOrbGift(true);
      }
      
      // Show save prompt for guests after hello triggers (1, 5, 20)
      if (isGuest && shouldShowSavePrompt()) {
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

  // Check if all 5 First Hellos are complete - show mode selection
  useEffect(() => {
    if (progress?.mode !== 'first_hellos') return;
    if (allFirstHellosComplete && !progress?.has_completed_onboarding) {
      setShowMilestone(true);
    }
  }, [allFirstHellosComplete, progress?.has_completed_onboarding, progress?.mode]);

  const handleModeSelect = async (mode: 'daily' | 'chill') => {
    setPendingMode(mode);
    setShowModeSelection(false);
    
    // Show the appropriate mode confirmation dialog
    if (mode === 'daily') {
      setShowDailyModeConfirm(true);
    } else {
      setShowChillModeConfirm(true);
    }
  };

  const handleModeConfirmContinue = async () => {
    if (!pendingMode) return;
    
    const target = pendingMode === 'daily' ? 7 : 5;
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
    setPendingMode(null);
    toast.success(`🎉 You're now in ${pendingMode === 'daily' ? 'Daily' : 'Chill'} Mode! (+${FIRST_HELLOS_COMPLETE_BONUS} XP)`);
    
    // Check for level up
    if (newLevel > oldLevel) {
      setNewLevelValue(newLevel);
      setShowLevelUp(true);
    }
  };

  // Check if today's hello is completed
  const isTodaysHelloComplete = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return logs.some(log => {
      const logDate = new Date(log.created_at);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime() && log.hello_type === 'todays_hello';
    });
  };

  // Check if weekly challenge is completed this week
  // IMPORTANT: Use stored progress fields first (they're date-only strings in the user's timezone),
  // because logs-based calculations can be stale during auth transitions.
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
    
    // Debug log to help diagnose the issue
    console.log('[WeeklyChallenge] weekStartStr:', weekStartStr, 'lastChallengeDate:', lastChallengeDate, 'comparison:', lastChallengeDate && lastChallengeDate >= weekStartStr);

    if (lastChallengeDate) {
      return lastChallengeDate >= weekStartStr;
    }

    // Fallback for older users/data (no last_weekly_challenge_date set)
    return logs.some((log) => {
      if (log.hello_type !== "remis_challenge") return false;
      const logDateInTz = formatInTimeZone(new Date(log.created_at), tzOffset, "yyyy-MM-dd");
      return logDateInTz >= weekStartStr;
    });
  };

  const todaysHello = getTodaysHello();
  const thisWeeksChallenge = getThisWeeksChallenge();
  const todaysOnboardingChallenge = onboardingChallenges[currentOnboardingDay - 1];

  const isLoading = user ? (progressLoading || logsLoading || timezoneLoading) : guestLoading;
  
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

  const mode = (progress.mode === 'connect' ? 'chill' : (progress.mode || 'daily')) as 'daily' | 'chill';
  const targetHellos = mode === 'chill' ? 5 : 7;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logoSticker} alt="One Hello" className="h-32" />
        </div>

        {/* Greeting - Centered */}
        <div className="text-center mb-6">
          <p className="text-lg font-medium text-foreground">
            Hello, <span className="text-primary">{username}</span>! 👋
          </p>
        </div>

        {/* Stats Bar - ALWAYS visible */}
        <StatsBar
          hellosToday={user ? getLogsTodayCount(tzOffset) : (progress.hellos_today_count || 0)}
          hellosThisWeek={progress.hellos_this_week || 0}
          dailyStreak={progress.daily_streak || 0}
          weeklyStreak={progress.weekly_streak || 0}
          lifetimeHellos={progress.total_hellos || logs.length}
          orbs={progress.orbs || 0}
          mode={(progress.mode === '7-day-starter' ? 'first_hellos' : progress.mode) as 'daily' | 'chill' | 'first_hellos' || 'first_hellos'}
          isOnboardingWeek={progress.is_onboarding_week || false}
          onboardingCompleted={completedDaysCount}
          hasCompletedOnboarding={progress.has_completed_onboarding || false}
          currentLevel={progress.current_level || 1}
          totalXp={progress.total_xp || 0}
          firstHellosCompleted={completedFirstHellosCount}
        />

        {/* Log a Hello Button - Show above challenges for non-onboarding users */}
        {!isFirstHellosMode && progress.has_completed_onboarding && (
          <div className="mt-6">
            <LogHelloButton 
              onClick={() => {
                setSelectedChallenge(null);
                setSelectedHelloType('regular_hello');
                setShowLogDialog(true);
              }}
            />
          </div>
        )}

        {/* First Hellos Mode - New sequential challenge system */}
        {isFirstHellosMode ? (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">First Hello's</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {completedFirstHellosCount === 0 
                ? "Complete each challenge to unlock the next"
                : completedFirstHellosCount < 5
                ? `${completedFirstHellosCount}/5 completed - keep going!`
                : "Amazing! You've completed all First Hello's!"}
            </p>
            <div className="space-y-3">
              {firstHellos.map((challenge, index) => {
                const isCompleted = completedFirstHelloTypes.includes(challenge.title);
                // Sequential unlock: challenge is unlocked if all previous are completed
                const previousCompleted = index === 0 || firstHellos.slice(0, index).every(
                  prev => completedFirstHelloTypes.includes(prev.title)
                );
                const isLocked = !previousCompleted;
                const isCurrent = previousCompleted && !isCompleted;
                const isAvailable = previousCompleted && !isCompleted;
                
                return (
                  <FirstHelloCard
                    key={challenge.id}
                    challenge={challenge}
                    isCompleted={isCompleted}
                    isAvailable={isAvailable}
                    isLocked={isLocked}
                    isCurrent={isCurrent}
                    onComplete={() => {
                      setSelectedChallenge(challenge.title);
                      setSelectedHelloType(challenge.title as HelloType);
                      setSelectedDayNumber(index + 1);
                      setShowLogDialog(true);
                    }}
                  />
                );
              })}
            </div>

            {/* Log a Hello Button - Show below for extra hellos */}
            <div className="mt-6">
              <LogHelloButton 
                onClick={() => {
                  setSelectedChallenge(null);
                  setSelectedHelloType('regular_hello');
                  setShowLogDialog(true);
                }}
                variant="onboarding"
              />
              <p className="text-center text-sm text-muted-foreground mt-2">For any extra Hellos</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {/* Today's Hello */}
            <TodaysHelloCard
              title={todaysHello.title}
              description={todaysHello.description}
              isCompleted={isTodaysHelloComplete()}
              onComplete={() => {
                setSelectedChallenge(todaysHello.title);
                setSelectedHelloType('todays_hello');
                setShowLogDialog(true);
              }}
            />

            {/* Remi's Weekly Challenge */}
            <RemisWeeklyChallengeCard
              title={thisWeeksChallenge.title}
              description={thisWeeksChallenge.description}
              isCompleted={isWeeklyChallengeComplete()}
              orbsFull={(progress.orbs || 0) >= 3}
              onComplete={() => {
                setSelectedChallenge(thisWeeksChallenge.title);
                setSelectedHelloType('remis_challenge');
                setShowLogDialog(true);
              }}
            />
          </div>
        )}

      </div>

      {/* Dialogs */}
      <LogHelloDialog 
        open={showLogDialog}
        onOpenChange={(open) => {
          setShowLogDialog(open);
          if (!open) {
            setSelectedChallenge(null);
            setSelectedHelloType('regular_hello');
          }
        }}
        onLog={handleLogHello}
        challengeTitle={selectedChallenge}
        helloType={selectedHelloType}
      />

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
        totalChallengesCompleted={getCompletedOnboardingChallenges().length + 1}
      />

      <OnboardingCompleteMilestoneDialog
        open={showMilestone}
        onContinue={handleMilestoneContinue}
      />

      <FirstOrbGiftDialog
        open={showFirstOrbGift}
        onClaim={handleClaimFirstOrb}
        username={username}
      />

      <ComeBackTomorrowDialog
        open={showComeBackTomorrow}
        onContinue={() => setShowComeBackTomorrow(false)}
      />

      <ModeSelectionDialog
        open={showModeSelection}
        onSelectMode={handleModeSelect}
      />

      <DailyModeSelectedDialog
        open={showDailyModeConfirm}
        onContinue={handleModeConfirmContinue}
      />

      <ChillModeSelectedDialog
        open={showChillModeConfirm}
        onContinue={handleModeConfirmContinue}
      />

      <UseOrbDialog
        open={showDailyOrbDialog}
        onUseOrb={handleUseDailyOrb}
        onDecline={handleDeclineDailyOrb}
        type="daily"
        orbsAvailable={progress?.orbs || 0}
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

      {/* First Hello Rating Dialog */}
      <FirstHelloRatingDialog
        open={showFirstHelloRating}
        onRate={(rating) => {
          setShowFirstHelloRating(false);
          setFirstHelloPhase('observation_intro');
          setShowFirstHelloInstruction(true);
        }}
      />

      {/* First Hello Instruction Dialogs */}
      <FirstHelloInstructionDialog
        open={showFirstHelloInstruction}
        onContinue={() => {
          setShowFirstHelloInstruction(false);
          // If all complete phase, show mode selection
          if (firstHelloPhase === 'all_complete') {
            setShowModeSelection(true);
          }
        }}
        phase={firstHelloPhase}
        username={username}
      />
    </div>
  );
}
