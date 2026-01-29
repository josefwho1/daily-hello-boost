import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useHelloLogs } from "@/hooks/useHelloLogs";
import { useTimezone } from "@/hooks/useTimezone";
import { useGuestMode } from "@/hooks/useGuestMode";
import { LogHelloScreen } from "@/components/LogHelloScreen";
import { OnboardingChallengeCard } from "@/components/OnboardingChallengeCard";
import { ComeBackTomorrowDialog } from "@/components/ComeBackTomorrowDialog";
import { DailySuggestionCard } from "@/components/DailySuggestionCard";
import { ActiveChallengeCard } from "@/components/ActiveChallengeCard";
import { useChallengeCompletions } from "@/hooks/useChallengeCompletions";
import { getPackById } from "@/data/packs";
import { Challenge } from "@/types/challenge";
import { RecentHellosSection } from "@/components/RecentHellosSection";
import { HomeStatsBar } from "@/components/HomeStatsBar";
import { SaveHelloButton } from "@/components/SaveHelloButton";

import ViewHelloDialog from "@/components/ViewHelloDialog";
import { HelloLog } from "@/hooks/useHelloLogs";
import { DayChallengeRevealDialog } from "@/components/DayChallengeRevealDialog";
import { ChallengeCompletionCelebrationDialog } from "@/components/ChallengeCompletionCelebrationDialog";
import { OnboardingCompleteMilestoneDialog } from "@/components/OnboardingCompleteMilestoneDialog";
import { WeeklyChallengeCompleteDialog } from "@/components/WeeklyChallengeCompleteDialog";
import { SaveProgressDialog } from "@/components/SaveProgressDialog";
import { HomeScreenTutorial } from "@/components/HomeScreenTutorial";
import { SingleChallengeCompleteDialog } from "@/components/SingleChallengeCompleteDialog";
import { PackCompleteCelebrationDialog } from "@/components/PackCompleteCelebrationDialog";
import { MilestoneCelebrationDialog, HELLO_MILESTONES, NAME_MILESTONES, checkMilestoneReached, MilestoneType } from "@/components/MilestoneCelebrationDialog";
import { onboardingChallenges } from "@/data/onboardingChallenges";
import { getTodaysHello } from "@/data/dailyHellos";
import { getThisWeeksChallenge } from "@/data/weeklyChallenges";
import { toast } from "sonner";
import { format, startOfWeek, isBefore, parseISO, differenceInDays } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

import { normalizeTimezoneOffset, getDayKeyInOffset, getDayKeyDifference, getYesterdayKeyInOffset } from "@/lib/timezone";

const getWeekStartKeyInOffset = (date: Date, offset: string) => {
  const normalizedOffset = normalizeTimezoneOffset(offset);
  const zonedNow = toZonedTime(date, normalizedOffset);
  const weekStart = startOfWeek(zonedNow, { weekStartsOn: 1 });
  return formatInTimeZone(weekStart, normalizedOffset, "yyyy-MM-dd");
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress: cloudProgress, loading: progressLoading, updateProgress: updateCloudProgress, refetch } = useUserProgress();
  const { logs: cloudLogs, loading: logsLoading, addLog: addCloudLog, updateLog: updateCloudLog, deleteLog: deleteCloudLog, getLogsTodayCount, toggleFavorite } = useHelloLogs();
  const { timezoneOffset, loading: timezoneLoading } = useTimezone();
  const { completions, addCompletion, refetch: refetchCompletions } = useChallengeCompletions();
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
    has_seen_welcome_messages: guestProgress.has_seen_welcome_messages,
    total_hellos: guestProgress.total_hellos,
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
  const [selectedChallengeTag, setSelectedChallengeTag] = useState<string>('');
  const [username, setUsername] = useState("");
  
  // Dialog states
  const [showComeBackTomorrow, setShowComeBackTomorrow] = useState(false);
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [showDailyModeConfirm, setShowDailyModeConfirm] = useState(false);
  const [showChillModeConfirm, setShowChillModeConfirm] = useState(false);
  const [showDayReveal, setShowDayReveal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showWeeklyChallengeComplete, setShowWeeklyChallengeComplete] = useState(false);
  const [weeklyChallengeOrbAwarded, setWeeklyChallengeOrbAwarded] = useState(false);
  const [pendingMode, setPendingMode] = useState<'daily' | 'chill' | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [autoStartRecording, setAutoStartRecording] = useState(false);
  const [showHomeTutorial, setShowHomeTutorial] = useState(false);
  const [tutorialMode, setTutorialMode] = useState<'daily' | 'chill'>('daily');
  
  // Pack challenge celebration states
  const [showSingleChallengeComplete, setShowSingleChallengeComplete] = useState(false);
  const [showPackComplete, setShowPackComplete] = useState(false);
  const [completedChallengeTitle, setCompletedChallengeTitle] = useState('');
  
  // Milestone celebration states
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [milestoneValue, setMilestoneValue] = useState(0);
  const [milestoneType, setMilestoneType] = useState<MilestoneType>('hellos');
  
  // Edit hello dialog states
  const [editingLog, setEditingLog] = useState<HelloLog | null>(null);
  const [editingLogIndex, setEditingLogIndex] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUsername = async () => {
      let resolvedName: string | null = null;

      if (user) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();

        if (!error && profile?.username) {
          resolvedName = profile.username;
        }

        if (!resolvedName && user.user_metadata?.name) {
          resolvedName = user.user_metadata.name;
        }

        if (!resolvedName && (progress as any)?.username) {
          resolvedName = (progress as any).username;
        }
        if (!resolvedName && guestProgress?.username) {
          resolvedName = guestProgress.username;
        }
      } else {
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

  // Show walkthrough tutorial for users coming from onboarding
  const tutorialShownRef = useRef(false);
  const tutorialTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const loadingForTutorial = isAnonymous ? guestLoading : progressLoading;
    if (loadingForTutorial) return;
    if (showHomeTutorial) return;

    const hasCompletedOnboarding = Boolean(progress?.has_completed_onboarding);
    const hasSeenWelcome = progress?.has_seen_welcome_messages === true;
    const eligible = hasCompletedOnboarding && !hasSeenWelcome;

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
  }, [isAnonymous, guestLoading, progressLoading, showHomeTutorial, progress?.has_completed_onboarding, progress?.has_seen_welcome_messages]);

  // Mark tutorial as seen as soon as it opens
  const handleTutorialMarkSeen = async () => {
    if (user?.id) {
      await supabase
        .from('user_progress')
        .update({ has_seen_welcome_messages: true })
        .eq('user_id', user.id);

      if (isAnonymous) {
        updateGuestProgress({ has_seen_welcome_messages: true } as any);
      }
    }
    sessionStorage.removeItem('pending_home_tutorial');
  };

  const handleTutorialComplete = () => {
    setShowHomeTutorial(false);
    toast.success("🎉 You're all set!");
  };

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

  // Weekly reset logic
  const [weeklyResetDone, setWeeklyResetDone] = useState(false);
  
  useEffect(() => {
    if (!progress || progressLoading || weeklyResetDone || timezoneLoading) return;
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
          weekly_goal_achieved_this_week: false,
        });
      }
    } else {
      setWeeklyResetDone(true);
      updateProgress({
        week_start_date: weekStartStr,
        weekly_goal_achieved_this_week: false,
      });
    }
  }, [progress, progressLoading, weeklyResetDone, timezoneLoading, tzOffset]);

  const handleLogHello = async (data: { name?: string; location?: string; notes?: string; rating?: 'positive' | 'neutral' | 'negative'; difficulty_rating?: number; no_name_flag?: boolean; linked_to?: string }) => {
    const isFirstHelloEver = logs.length === 0;
    const isOnboardingChallenge = onboardingChallenges.some(c => c.title === selectedChallenge);
    const isPackChallenge = selectedHelloType === 'pack_challenge';

    const today = getDayKeyInOffset(new Date(), tzOffset);

    const result = await addLog({
      ...data
    });

    // Record pack challenge completion if applicable
    if (
      result &&
      isPackChallenge &&
      selectedDayNumber != null &&
      typeof selectedChallengeTag === 'string' &&
      selectedChallengeTag.length > 0
    ) {
      try {
        const completionRating = data.rating ?? 'neutral';
        await addCompletion({
          challenge_day: selectedDayNumber,
          challenge_tag: selectedChallengeTag,
          interaction_name: data.name || null,
          notes: data.notes || null,
          rating: completionRating,
          difficulty_rating: data.difficulty_rating || null,
        });
        await refetchCompletions();
        
        const selectedPackId = progress?.selected_pack_id || '';
        const pack = getPackById(selectedPackId);
        if (pack) {
          const completedAfter = completions.filter(c => 
            c.challenge_tag?.startsWith(`${selectedPackId}-`) || pack.challenges.some(ch => ch.tag === c.challenge_tag)
          ).length + 1;
          
          const totalChallenges = pack.challenges.length;
          const currentChallenge = pack.challenges.find(c => c.day === selectedDayNumber);
          
          if (completedAfter >= totalChallenges) {
            setTimeout(() => setShowPackComplete(true), 500);
          } else {
            setCompletedChallengeTitle(currentChallenge?.title || '');
            setTimeout(() => setShowSingleChallengeComplete(true), 300);
          }
        }
      } catch (error) {
        console.error('Failed to record challenge completion:', error);
      }
    }

    if (result) {
      const previousHellosThisWeek = progress?.hellos_this_week || 0;
      const newHellosThisWeek = previousHellosThisWeek + 1;
      const newTotalHellos = (progress?.total_hellos || logs.length) + 1;

      const isWeeklyChallenge = selectedHelloType === "remis_challenge";
      const lastChallengeDate = progress?.last_weekly_challenge_date;

      const thisWeekStartStr = progress?.week_start_date
        ? progress.week_start_date
        : getWeekStartKeyInOffset(new Date(), tzOffset);

      const alreadyEarnedThisWeek = !!(lastChallengeDate && lastChallengeDate >= thisWeekStartStr);

      const updates: Record<string, unknown> = {
        hellos_this_week: newHellosThisWeek,
        last_completed_date: today,
        total_hellos: newTotalHellos,
      };

      if (isWeeklyChallenge) {
        updates.last_weekly_challenge_date = today;
      }

      await updateProgress(updates);

      toast.success("Hello logged!");

      // Show celebration for onboarding challenges (only in 7-day-starter mode)
      if (isOnboardingChallenge && progress?.is_onboarding_week && progress?.mode === '7-day-starter') {
        if (!isFirstHelloEver) {
          setShowCelebration(true);
        }
      } else if (isWeeklyChallenge) {
        setWeeklyChallengeOrbAwarded(false);
        setShowWeeklyChallengeComplete(true);
      }
      
      // Check for hello/name milestones
      const previousTotalHellos = progress?.total_hellos || logs.length;
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
    }
    
    setSelectedChallenge(null);
  };

  const handleCelebrationContinue = () => {
    setShowCelebration(false);
    
    if (completedDaysCount >= 7) {
      setShowMilestone(true);
    }
  };

  const handleMilestoneContinue = () => {
    setShowMilestone(false);
    setShowModeSelection(true);
  };

  // Check if all 7 onboarding challenges are complete
  useEffect(() => {
    if (progress?.mode !== '7-day-starter') return;
    if (allOnboardingComplete && progress?.is_onboarding_week && !progress?.has_completed_onboarding) {
      setShowMilestone(true);
    }
  }, [allOnboardingComplete, progress?.is_onboarding_week, progress?.has_completed_onboarding, progress?.mode]);

  const handleModeSelect = async (mode: 'daily' | 'chill') => {
    setPendingMode(mode);
    setShowModeSelection(false);
    
    if (mode === 'daily') {
      setTutorialMode('daily');
      
      const target = 7;
      
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
      });
      
      setPendingMode(null);
      
      setTimeout(() => {
        if (progress?.has_seen_welcome_messages !== true) setShowHomeTutorial(true);
      }, 300);
    } else {
      const target = 3;
      
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
      });
      
      setTutorialMode('chill');
      setPendingMode(null);
      
      setTimeout(() => {
        if (progress?.has_seen_welcome_messages !== true) setShowHomeTutorial(true);
      }, 300);
    }
  };

  const handleModeConfirmContinue = async () => {
    if (!pendingMode) return;
    
    const target = pendingMode === 'daily' ? 7 : 3;
    const isDaily = pendingMode === 'daily';
    
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
    });
    
    setShowDailyModeConfirm(false);
    setShowChillModeConfirm(false);
    
    setTutorialMode(pendingMode);
    setPendingMode(null);
    
    setTimeout(() => {
      if (progress?.has_seen_welcome_messages !== true) setShowHomeTutorial(true);
    }, 300);
  };

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
        existingLogs={logs}
      />
    );
  }

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
          
            {/* Today's Hello/Challenge */}
            <div className="space-y-3">
              {/* Active Challenge Card or Daily Suggestion */}
              {progress?.selected_pack_id && getPackById(progress.selected_pack_id)?.challenges.length ? (
                <ActiveChallengeCard
                  packId={progress.selected_pack_id}
                  completedDays={completions.map(c => c.challenge_day)}
                  completedTags={completions.map(c => c.challenge_tag).filter((t): t is string => t !== null)}
                  packStartDate={progress.pack_start_date || null}
                  onLogHello={(challenge: Challenge) => {
                    setSelectedChallenge(challenge.title);
                    setSelectedDayNumber(challenge.day);
                    setSelectedChallengeTag(challenge.tag);
                    setSelectedHelloType('pack_challenge');
                    setShowLogDialog(true);
                  }}
                  onViewPack={() => navigate('/challenges')}
                  onEndChallenge={async () => {
                    await updateProgress({
                      selected_pack_id: '',
                      mode: 'daily',
                    });
                    toast.success("Challenge ended! You're back to Today's Hello.");
                  }}
                />
              ) : (
                <DailySuggestionCard />
              )}
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
              onViewLog={(log) => {
                const index = logs.findIndex(l => l.id === log.id);
                setEditingLog(log);
                setEditingLogIndex(index >= 0 ? index : 0);
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
        currentStreak={0}
        username={username}
        isFirstHelloEver={logs.length === 1}
        isPerfectWeek={false}
        totalChallengesCompleted={getCompletedDaysCount() + 1}
      />

      <OnboardingCompleteMilestoneDialog
        open={showMilestone}
        onContinue={handleMilestoneContinue}
      />

      <ComeBackTomorrowDialog
        open={showComeBackTomorrow}
        onContinue={() => setShowComeBackTomorrow(false)}
      />

      <WeeklyChallengeCompleteDialog
        open={showWeeklyChallengeComplete}
        onContinue={() => setShowWeeklyChallengeComplete(false)}
        orbsAwarded={weeklyChallengeOrbAwarded}
      />

      {/* Pack Challenge Celebrations */}
      <SingleChallengeCompleteDialog
        open={showSingleChallengeComplete}
        onContinue={() => setShowSingleChallengeComplete(false)}
        dayNumber={selectedDayNumber}
        totalDays={getPackById(progress?.selected_pack_id || '')?.challenges.length || 7}
        challengeTitle={completedChallengeTitle}
      />

      <PackCompleteCelebrationDialog
        open={showPackComplete}
        onContinue={() => setShowPackComplete(false)}
        packName={getPackById(progress?.selected_pack_id || '')?.name || 'Challenge Pack'}
      />

      {/* Milestone Celebrations */}
      <MilestoneCelebrationDialog
        open={showMilestoneCelebration}
        onContinue={() => setShowMilestoneCelebration(false)}
        milestoneValue={milestoneValue}
        milestoneType={milestoneType}
      />

      {/* Save Progress Dialog for Guests */}
      <SaveProgressDialog
        open={showSavePrompt}
        onOpenChange={setShowSavePrompt}
        onDismiss={dismissSavePrompt}
        totalHellos={guestState?.total_hellos_logged || 0}
      />

      {/* Home Screen Tutorial - shows after onboarding */}
      <HomeScreenTutorial
        open={showHomeTutorial}
        onComplete={handleTutorialComplete}
        onMarkSeen={handleTutorialMarkSeen}
      />

      {/* View Hello Dialog */}
      <ViewHelloDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        log={editingLog}
        logs={logs}
        currentIndex={editingLogIndex}
        onNavigate={(newIndex) => {
          if (newIndex >= 0 && newIndex < logs.length) {
            setEditingLog(logs[newIndex]);
            setEditingLogIndex(newIndex);
          }
        }}
        onSave={async (id, updates) => {
          const result = await updateCloudLog(id, updates);
          if (result) {
            toast.success("Hello updated!");
          } else {
            toast.error("Failed to update hello");
          }
          return result;
        }}
        onDelete={async (id) => {
          try {
            await deleteCloudLog(id);
            toast.success("Hello deleted");
          } catch {
            toast.error("Failed to delete hello");
          }
        }}
      />
    </div>
  );
}
