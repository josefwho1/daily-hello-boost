import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useHelloLogs } from "@/hooks/useHelloLogs";
import { useTimezone } from "@/hooks/useTimezone";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useDailyMode } from "@/hooks/useDailyMode";
import { useChallengeProgress } from "@/hooks/useChallengeProgress";
import { CurrentChallengeCard } from "@/components/CurrentChallengeCard";
import { DailySuggestionCard } from "@/components/DailySuggestionCard";
import { ChallengeListView } from "@/components/ChallengeListView";
import { ThirtyChallengeCompleteDialog } from "@/components/ThirtyChallengeCompleteDialog";
import { LogHelloScreen } from "@/components/LogHelloScreen";

import { DailyModeReminderBanner } from "@/components/DailyModeReminderBanner";
import { RecentHellosSection } from "@/components/RecentHellosSection";
import { HomeStatsBar } from "@/components/HomeStatsBar";
import { SaveHelloButton } from "@/components/SaveHelloButton";
import ViewHelloDialog from "@/components/ViewHelloDialog";
import { HelloLog } from "@/hooks/useHelloLogs";
import { SaveProgressDialog } from "@/components/SaveProgressDialog";
import { HomeScreenTutorial } from "@/components/HomeScreenTutorial";
import { MilestoneCelebrationDialog, HELLO_MILESTONES, NAME_MILESTONES, checkMilestoneReached, MilestoneType } from "@/components/MilestoneCelebrationDialog";
import { StreakCelebrationDialog } from "@/components/StreakCelebrationDialog";
import { toast } from "sonner";
import { startOfWeek, isBefore, parseISO } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { normalizeTimezoneOffset, getDayKeyInOffset } from "@/lib/timezone";

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
  const { logs: cloudLogs, loading: logsLoading, addLog: addCloudLog, updateLog: updateCloudLog, deleteLog: deleteCloudLog, toggleFavorite } = useHelloLogs();
  const { timezoneOffset, loading: timezoneLoading } = useTimezone();
  const { 
    state: dailyModeState,
    recordHelloForDailyMode,
    checkAndResetStreak,
    shouldShowMorningReminder,
    shouldShowAfternoonReminder,
    dismissMorningReminder,
    dismissAfternoonReminder,
    loading: dailyModeLoading,
  } = useDailyMode();
  const {
    state: challengeState,
    markDayComplete,
    restartChallenge,
    loading: challengeLoading,
  } = useChallengeProgress();
  const { 
    guestProgress, 
    guestLogs, 
    loading: guestLoading, 
    updateProgress: updateGuestProgress, 
    addLog: addGuestLog,
    shouldShowSavePrompt,
    dismissSavePrompt,
    guestState,
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
  const [username, setUsername] = useState("");
  
  // Dialog states
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [autoStartRecording, setAutoStartRecording] = useState(false);
  const [showHomeTutorial, setShowHomeTutorial] = useState(false);
  const [showChallengeList, setShowChallengeList] = useState(false);
  const [showThirtyChallengeComplete, setShowThirtyChallengeComplete] = useState(false);
  const [pendingChallengeCompletion, setPendingChallengeCompletion] = useState<{day: number; name: string} | null>(null);
  
  // Milestone celebration states
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [milestoneValue, setMilestoneValue] = useState(0);
  const [milestoneType, setMilestoneType] = useState<MilestoneType>('hellos');
  
  // Streak celebration states
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  const [celebratedStreakValue, setCelebratedStreakValue] = useState(0);
  
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

  // Daily Mode streak reset check on mount
  useEffect(() => {
    if (!dailyModeLoading && dailyModeState.isActive) {
      checkAndResetStreak();
    }
  }, [dailyModeLoading, dailyModeState.isActive, checkAndResetStreak]);

  const handleLogHello = async (data: { name?: string; location?: string; notes?: string; rating?: 'positive' | 'neutral' | 'negative'; difficulty_rating?: number; no_name_flag?: boolean; linked_to?: string; hello_type?: string }) => {
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
        total_hellos: newTotalHellos,
      };

      await updateProgress(updates);

      toast.success("Hello logged!");
      
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

      // Record for Daily Mode if active and trigger streak celebration
      if (dailyModeState.isActive) {
        const todayKey = getDayKeyInOffset(new Date(), tzOffset);
        const hasAlreadyRecordedForDailyModeToday = dailyModeState.lastHelloDate === todayKey;
        const streakBeforeLog = dailyModeState.currentStreak;
        
        await recordHelloForDailyMode();
        
        // Trigger celebration only if this is the first daily mode hello of the day
        if (!hasAlreadyRecordedForDailyModeToday) {
          const newStreakValue = streakBeforeLog === 0 ? 1 : streakBeforeLog + 1;
          setCelebratedStreakValue(newStreakValue);
          setTimeout(() => setShowStreakCelebration(true), 500);
        }
      }
    }
  };

  const isLoading = isAnonymous ? (guestLoading || timezoneLoading) : (progressLoading || logsLoading || timezoneLoading || challengeLoading);
  
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

  // Full-screen Challenge List View
  if (showChallengeList) {
    return (
      <ChallengeListView
        completedDays={challengeState.completedDays}
        onComplete={(day, challengeName) => {
          setPendingChallengeCompletion({ day, name: challengeName });
          setShowChallengeList(false);
          setAutoStartRecording(false);
          setShowLogDialog(true);
        }}
        onBack={() => setShowChallengeList(false)}
      />
    );
  }

  // Full-screen Log Hello
  if (showLogDialog) {
    return (
      <LogHelloScreen
        onBack={() => {
          setShowLogDialog(false);
          setAutoStartRecording(false);
          setPendingChallengeCompletion(null);
        }}
        onLog={async (data) => {
          await handleLogHello({
            ...data,
            hello_type: pendingChallengeCompletion ? `Challenge: ${pendingChallengeCompletion.name}` : data.hello_type,
          });
          
          // If completing a challenge, mark it done
          if (pendingChallengeCompletion) {
            await markDayComplete(pendingChallengeCompletion.day);
            toast.success(`Day ${pendingChallengeCompletion.day} complete! ✅`);
            if (challengeState.completedDays.length === 29) {
              setTimeout(() => setShowThirtyChallengeComplete(true), 500);
            }
            setPendingChallengeCompletion(null);
          }
        }}
        challengeTitle={pendingChallengeCompletion?.name || null}
        autoStartRecording={autoStartRecording}
        existingLogs={logs}
        requireAtLeastOneField={!!pendingChallengeCompletion}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-8">

        {/* Daily Mode Reminder Banners */}
        {shouldShowMorningReminder && (
          <DailyModeReminderBanner type="morning" onDismiss={dismissMorningReminder} />
        )}
        {shouldShowAfternoonReminder && (
          <DailyModeReminderBanner type="afternoon" onDismiss={dismissAfternoonReminder} />
        )}

        {/* Friendly Header Greeting */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-wide" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            <span className="text-primary">Hello</span> {username} 👋
          </h1>
        </div>

        {/* Stats Dashboard */}
        <HomeStatsBar 
          logs={logs} 
          lifetimeHellos={logs.length} 
        />


        {/* Main Dashboard - Connection-focused layout */}
        <div className="space-y-6">
          
          {/* Show Today's Hello when quest is paused, otherwise 30-Day Challenge Card */}
          <div className="space-y-3" id="tutorial-todays-hello-card">
            {progress?.selected_pack_id === 'daily' ? (
              <DailySuggestionCard />
            ) : (
              <CurrentChallengeCard
                completedDays={challengeState.completedDays}
                nextChallenge={challengeState.nextChallenge}
                totalCount={challengeState.totalCount}
                isComplete={challengeState.isComplete}
                onComplete={(day, challengeName) => {
                  setPendingChallengeCompletion({ day, name: challengeName });
                  setAutoStartRecording(false);
                  setShowLogDialog(true);
                }}
                onViewAll={() => setShowChallengeList(true)}
                onRestart={async () => {
                  await restartChallenge();
                  toast.success("Challenge restarted! Day 1 ready.");
                }}
              />
            )}
          </div>

          {/* Log a Hello Button */}
          <div className="py-2">
            <SaveHelloButton
              onClick={() => {
                setAutoStartRecording(false);
                setShowLogDialog(true);
              }}
              onDictateClick={() => {
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

      {/* 30-Day Challenge Complete Celebration */}
      <ThirtyChallengeCompleteDialog
        open={showThirtyChallengeComplete}
        onContinue={() => setShowThirtyChallengeComplete(false)}
        timesCompleted={challengeState.timesCompleted}
      />

      {/* Milestone Celebrations */}
      <MilestoneCelebrationDialog
        open={showMilestoneCelebration}
        onContinue={() => setShowMilestoneCelebration(false)}
        milestoneValue={milestoneValue}
        milestoneType={milestoneType}
      />

      {/* Daily Mode Streak Celebration */}
      <StreakCelebrationDialog
        open={showStreakCelebration}
        onContinue={() => setShowStreakCelebration(false)}
        streakCount={celebratedStreakValue}
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
        onToggleFavorite={async (id, isFavorite) => {
          const result = await toggleFavorite(id, isFavorite);
          if (result) {
            toast.success(isFavorite ? "Added to favorites" : "Removed from favorites");
          } else {
            toast.error("Failed to update favorite");
          }
        }}
      />
    </div>
  );
}
