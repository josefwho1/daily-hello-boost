import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useHelloLogs } from "@/hooks/useHelloLogs";
import { useWeeklyChallenges } from "@/hooks/useWeeklyChallenges";
import { useDailyChallenges } from "@/hooks/useDailyChallenges";
import { ProgressRing } from "@/components/ProgressRing";
import { StreakCard } from "@/components/StreakCard";
import { LogHelloDialog } from "@/components/LogHelloDialog";
import { OnboardingChallengeCard } from "@/components/OnboardingChallengeCard";
import { FirstOrbGiftDialog } from "@/components/FirstOrbGiftDialog";
import { ComeBackTomorrowDialog } from "@/components/ComeBackTomorrowDialog";
import { ModeSelectionDialog } from "@/components/ModeSelectionDialog";
import { UseOrbDialog } from "@/components/UseOrbDialog";
import { TodaysHelloCard } from "@/components/TodaysHelloCard";
import { AnyHelloCard } from "@/components/AnyHelloCard";
import { RemisWeeklyChallengeCard } from "@/components/RemisWeeklyChallengeCard";
import { onboardingChallenges } from "@/data/onboardingChallenges";
import { toast } from "sonner";
import { format, startOfWeek, isBefore, parseISO, differenceInDays } from "date-fns";
import logoSticker from "@/assets/one-hello-logo-sticker.png";
import remiMascot from "@/assets/remi-mascot.png";
import { Sparkles } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, loading: progressLoading, updateProgress, refetch } = useUserProgress();
  const { logs, loading: logsLoading, addLog, getLogsTodayCount } = useHelloLogs();
  const { challenges: weeklyChallenges, getCurrentChallenge } = useWeeklyChallenges();
  const { getTodaysChallenge, loading: dailyChallengesLoading } = useDailyChallenges();
  
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  
  // Dialog states
  const [showFirstOrbGift, setShowFirstOrbGift] = useState(false);
  const [showComeBackTomorrow, setShowComeBackTomorrow] = useState(false);
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [showDailyOrbDialog, setShowDailyOrbDialog] = useState(false);
  const [showWeeklyOrbDialog, setShowWeeklyOrbDialog] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.user_metadata?.name || 'Friend');
    }
  }, [user]);

  // Weekly reset logic - check for missed weekly goal (Connect Mode)
  useEffect(() => {
    if (!progress || progressLoading) return;
    if (progress.is_onboarding_week) return; // Skip during onboarding

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday

    if (progress.week_start_date) {
      const storedWeekStart = new Date(progress.week_start_date);
      
      // Check if we're in a new week
      if (isBefore(storedWeekStart, weekStart)) {
        const mode = progress.mode || 'daily';
        const target = mode === 'connect' ? 5 : (progress.target_hellos_per_week || 7);
        const targetMet = (progress.hellos_this_week || 0) >= target;
        
        if (mode === 'connect' && !targetMet && (progress.weekly_streak || 0) > 0) {
          // Connect mode: missed weekly goal with active streak - offer orb
          setShowWeeklyOrbDialog(true);
        } else {
          // Target met or no streak to protect - proceed normally
          const newWeeklyStreak = targetMet ? (progress.weekly_streak || 0) + 1 : 0;
          const newLongestStreak = Math.max(newWeeklyStreak, progress.longest_streak || 0);

          updateProgress({
            hellos_this_week: 0,
            week_start_date: weekStart.toISOString().split('T')[0],
            weekly_streak: newWeeklyStreak,
            longest_streak: newLongestStreak,
          });

          if (targetMet) {
            toast.success(`🎉 Week completed! Your streak is now ${newWeeklyStreak} weeks!`);
          }
        }
      }
    }
  }, [progress, progressLoading]);

  // Check for missed daily streak (Daily Mode)
  useEffect(() => {
    if (!progress || progressLoading || logsLoading) return;
    if (progress.is_onboarding_week) return; // Skip during onboarding
    if (progress.mode !== 'daily') return; // Only for daily mode
    
    const dailyStreak = progress.daily_streak || 0;
    const lastCompletedDate = progress.last_completed_date;
    const saveOfferedForDate = progress.save_offered_for_date;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Only check if user has a streak to protect
    if (dailyStreak > 0 && lastCompletedDate) {
      const lastDate = parseISO(lastCompletedDate);
      const todayCount = getLogsTodayCount();
      
      // If they haven't logged today
      if (todayCount === 0) {
        const daysSinceLastHello = differenceInDays(new Date(), lastDate);
        
        // If more than 1 day gap and we haven't offered orb today
        if (daysSinceLastHello > 1 && saveOfferedForDate !== today) {
          setShowDailyOrbDialog(true);
          updateProgress({ save_offered_for_date: today });
        }
      }
    }
  }, [progress, progressLoading, logsLoading, logs]);

  // Handle using orb for daily streak
  const handleUseDailyOrb = async () => {
    const currentOrbs = progress?.orbs || 0;
    if (currentOrbs > 0) {
      await updateProgress({
        orbs: currentOrbs - 1,
        last_completed_date: format(new Date(), 'yyyy-MM-dd')
      });
      toast.success("✨ Orb used! Your daily streak is protected.");
    }
    setShowDailyOrbDialog(false);
  };

  // Handle declining orb for daily streak
  const handleDeclineDailyOrb = async () => {
    await updateProgress({ daily_streak: 0 });
    toast.info("Your daily streak has been reset to 0.");
    setShowDailyOrbDialog(false);
  };

  // Handle using orb for weekly streak
  const handleUseWeeklyOrb = async () => {
    const currentOrbs = progress?.orbs || 0;
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    
    if (currentOrbs > 0) {
      await updateProgress({
        orbs: currentOrbs - 1,
        hellos_this_week: 0,
        week_start_date: weekStart.toISOString().split('T')[0],
      });
      toast.success("✨ Orb used! Your weekly streak is protected.");
    }
    setShowWeeklyOrbDialog(false);
  };

  // Handle declining orb for weekly streak
  const handleDeclineWeeklyOrb = async () => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    
    await updateProgress({
      weekly_streak: 0,
      hellos_this_week: 0,
      week_start_date: weekStart.toISOString().split('T')[0],
    });
    toast.info("Your weekly streak has been reset to 0.");
    setShowWeeklyOrbDialog(false);
  };

  // Update daily streak based on logs
  useEffect(() => {
    if (!progress || progressLoading || logsLoading) return;
    
    const todayCount = getLogsTodayCount();
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (todayCount > 0 && progress.last_completed_date && progress.last_completed_date !== today) {
      const lastDate = new Date(progress.last_completed_date);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      lastDate.setHours(0, 0, 0, 0);
      
      const diffDays = differenceInDays(todayDate, lastDate);
      
      if (diffDays === 1) {
        // Consecutive day - increment streak
        const newDailyStreak = (progress.daily_streak || 0) + 1;
        updateProgress({ 
          daily_streak: newDailyStreak,
          last_completed_date: today
        });
      } else if (diffDays > 1) {
        // Streak broken (unless orb was used)
        updateProgress({ 
          daily_streak: 1,
          last_completed_date: today
        });
      }
    }
  }, [logs]);

  const handleLogHello = async (data: { name?: string; notes?: string; rating?: 'positive' | 'neutral' | 'negative' }) => {
    const isFirstHelloEver = logs.length === 0 && !progress?.has_received_first_orb;
    
    const result = await addLog({
      ...data,
      hello_type: selectedChallenge || 'Standard Hello'
    });
    
    if (result) {
      const newHellosThisWeek = (progress?.hellos_this_week || 0) + 1;
      const newTotalHellos = (progress?.total_hellos || logs.length) + 1;
      const today = format(new Date(), 'yyyy-MM-dd');

      // Check if this is a weekly challenge completion - award orb (max 3)
      const isWeeklyChallenge = selectedChallenge === "Weekly Challenge";
      const currentOrbs = progress?.orbs || 0;
      const lastChallengeDate = progress?.last_weekly_challenge_date;
      const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const alreadyEarnedThisWeek = lastChallengeDate && new Date(lastChallengeDate) >= thisWeekStart;
      
      const updates: Record<string, unknown> = {
        hellos_this_week: newHellosThisWeek,
        last_completed_date: today,
        total_hellos: newTotalHellos,
        daily_streak: Math.max(progress?.daily_streak || 0, 1)
      };

      // Award orb for weekly challenge (max 3, once per week)
      if (isWeeklyChallenge && !alreadyEarnedThisWeek && currentOrbs < 3) {
        updates.orbs = currentOrbs + 1;
        updates.last_weekly_challenge_date = today;
        toast.success("✨ Orb earned!");
      } else if (isWeeklyChallenge && currentOrbs >= 3) {
        toast.info("Orbs are full (3/3). Challenge completed!");
      }

      await updateProgress(updates);

      toast.success("Hello logged! 🎉");

      // Show first orb gift dialog for very first hello
      if (isFirstHelloEver) {
        setShowFirstOrbGift(true);
      }
    }
    
    setSelectedChallenge(null);
  };

  // Handle claiming first orb
  const handleClaimFirstOrb = async () => {
    const currentOrbs = progress?.orbs || 0;
    await updateProgress({ 
      orbs: Math.min(currentOrbs + 1, 3),
      has_received_first_orb: true 
    });
    setShowFirstOrbGift(false);
    setShowComeBackTomorrow(true);
  };

  // Get completed onboarding challenges from logs
  const getCompletedOnboardingChallenges = () => {
    if (!progress?.is_onboarding_week) return [];
    
    const weekLogs = logs.filter(log => {
      const logDate = new Date(log.created_at);
      const onboardingStart = new Date(progress.onboarding_week_start || new Date());
      return logDate >= onboardingStart;
    });

    return weekLogs.map(log => log.hello_type).filter(Boolean);
  };

  const completedTypes = getCompletedOnboardingChallenges();
  const allOnboardingComplete = completedTypes.length >= 7;

  // Determine which day of onboarding the user is on
  const getOnboardingDay = () => {
    if (!progress?.onboarding_week_start) return 1;
    const start = new Date(progress.onboarding_week_start);
    const now = new Date();
    const dayDiff = differenceInDays(now, start) + 1;
    return Math.min(Math.max(dayDiff, 1), 7);
  };

  const currentOnboardingDay = getOnboardingDay();

  // Check if all 7 onboarding challenges are complete - show mode selection
  useEffect(() => {
    if (allOnboardingComplete && progress?.is_onboarding_week && !progress?.has_completed_onboarding) {
      setShowModeSelection(true);
    }
  }, [allOnboardingComplete, progress?.is_onboarding_week, progress?.has_completed_onboarding]);

  // Handle mode selection after completing 7-day challenge
  const handleModeSelect = async (mode: 'daily' | 'connect') => {
    const target = mode === 'daily' ? 7 : 5;
    await updateProgress({ 
      mode,
      target_hellos_per_week: target,
      has_completed_onboarding: true,
      is_onboarding_week: false,
      hellos_this_week: 0,
      week_start_date: startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString().split('T')[0]
    });
    setShowModeSelection(false);
    toast.success(`🎉 You're now in ${mode === 'daily' ? 'Daily' : 'Connect'} Mode!`);
  };

  // Check if today's hello is completed
  const isTodaysHelloComplete = () => {
    const todaysChallenge = getTodaysChallenge();
    if (!todaysChallenge) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return logs.some(log => {
      const logDate = new Date(log.created_at);
      logDate.setHours(0, 0, 0, 0);
      return logDate.getTime() === today.getTime() && log.hello_type === todaysChallenge.title;
    });
  };

  // Check if weekly challenge is completed this week
  const isWeeklyChallengeComplete = logs.some(log => {
    if (log.hello_type !== "Weekly Challenge") return false;
    const logDate = new Date(log.created_at);
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return logDate >= weekStart;
  });

  // Calculate weeks since user started to get rotating challenge
  const getWeeksSinceStart = () => {
    if (!progress?.onboarding_week_start) return 0;
    const start = new Date(progress.onboarding_week_start);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
  };

  const currentWeeklyChallenge = getCurrentChallenge(getWeeksSinceStart());
  const todaysChallenge = getTodaysChallenge();

  if (progressLoading || logsLoading || dailyChallengesLoading) {
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

  const mode = (progress.mode || 'daily') as 'daily' | 'connect';
  const targetHellos = mode === 'connect' ? 5 : 7;
  const currentHellos = progress.hellos_this_week || 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logoSticker} alt="One Hello" className="h-32" />
        </div>

        {/* Greeting with Remi */}
        <div className="flex items-center gap-3 mb-6">
          <img src={remiMascot} alt="Remi" className="w-12 h-12" />
          <p className="text-lg font-medium text-foreground">
            Hello, <span className="text-primary">{username}</span>! 👋
          </p>
        </div>

        {/* Progress Ring Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                {progress.is_onboarding_week ? 'Your 7-Day Challenge' : 'This Week'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {progress.is_onboarding_week 
                  ? `Day ${currentOnboardingDay} of 7`
                  : currentHellos >= targetHellos 
                    ? "🎉 Target reached!" 
                    : `${targetHellos - currentHellos} more to go`
                }
              </p>
            </div>
            <ProgressRing 
              progress={progress.is_onboarding_week ? completedTypes.length : currentHellos} 
              max={progress.is_onboarding_week ? 7 : targetHellos}
              size={140}
              strokeWidth={14}
            />
          </div>
        </Card>

        {/* Streak Card - only show after onboarding */}
        {!progress.is_onboarding_week && (
          <StreakCard 
            weeklyStreak={progress.weekly_streak || 0}
            dailyStreak={progress.daily_streak || 0}
            totalHellos={progress.total_hellos || logs.length}
            orbs={progress.orbs || 0}
            mode={mode}
          />
        )}

        {/* Onboarding Week Challenges */}
        {progress.is_onboarding_week ? (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Your 7-Day Challenges</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Challenges unlock daily at midnight. Complete each one!
            </p>
            <div className="space-y-3">
              {onboardingChallenges.map((challenge, index) => {
                const dayNumber = index + 1;
                const isUnlocked = dayNumber <= currentOnboardingDay;
                const isCompleted = completedTypes.includes(challenge.title);
                
                return (
                  <OnboardingChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                    isCompleted={isCompleted}
                    isAvailable={isUnlocked && !isCompleted}
                    onComplete={() => {
                      setSelectedChallenge(challenge.title);
                      setShowLogDialog(true);
                    }}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {/* Today's Hello */}
            {todaysChallenge && (
              <TodaysHelloCard
                title={todaysChallenge.title}
                description={todaysChallenge.description}
                isCompleted={isTodaysHelloComplete()}
                onComplete={() => {
                  setSelectedChallenge(todaysChallenge.title);
                  setShowLogDialog(true);
                }}
              />
            )}

            {/* Any Hello */}
            <AnyHelloCard 
              onLog={() => {
                setSelectedChallenge('Standard Hello');
                setShowLogDialog(true);
              }}
            />

            {/* Remi's Weekly Challenge */}
            {currentWeeklyChallenge && (
              <RemisWeeklyChallengeCard
                title={currentWeeklyChallenge.title}
                description={currentWeeklyChallenge.description}
                isCompleted={isWeeklyChallengeComplete}
                orbsFull={(progress.orbs || 0) >= 3}
                onComplete={() => {
                  setSelectedChallenge("Weekly Challenge");
                  setShowLogDialog(true);
                }}
              />
            )}
          </div>
        )}

      </div>

      {/* Dialogs */}
      <LogHelloDialog 
        open={showLogDialog}
        onOpenChange={(open) => {
          setShowLogDialog(open);
          if (!open) setSelectedChallenge(null);
        }}
        onLog={handleLogHello}
        challengeTitle={selectedChallenge}
      />

      <FirstOrbGiftDialog
        open={showFirstOrbGift}
        onClaim={handleClaimFirstOrb}
      />

      <ComeBackTomorrowDialog
        open={showComeBackTomorrow}
        onContinue={() => setShowComeBackTomorrow(false)}
      />

      <ModeSelectionDialog
        open={showModeSelection}
        onSelectMode={handleModeSelect}
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
    </div>
  );
}
