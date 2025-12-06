import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useHelloLogs } from "@/hooks/useHelloLogs";
import { ProgressRing } from "@/components/ProgressRing";
import { WeeklyStreakCard } from "@/components/WeeklyStreakCard";
import { InspirationCard } from "@/components/InspirationCard";
import { LogHelloDialog } from "@/components/LogHelloDialog";
import { OnboardingChallengeCard } from "@/components/OnboardingChallengeCard";
import { OnboardingCompleteDialog } from "@/components/OnboardingCompleteDialog";
import { WeeklyChallengeIntroDialog } from "@/components/WeeklyChallengeIntroDialog";
import { onboardingChallenges } from "@/data/onboardingChallenges";
import { toast } from "sonner";
import { format, startOfWeek, isBefore } from "date-fns";
import logoSticker from "@/assets/one-hello-logo-sticker.png";
import remiMascot from "@/assets/remi-mascot.png";
import { Plus, Sparkles, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, loading: progressLoading, updateProgress } = useUserProgress();
  const { logs, loading: logsLoading, addLog, hellosThisWeek, getLogsTodayCount } = useHelloLogs();
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [showOnboardingComplete, setShowOnboardingComplete] = useState(false);
  const [showWeeklyChallengeIntro, setShowWeeklyChallengeIntro] = useState(false);
  const [hasShownCompletionPopup, setHasShownCompletionPopup] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.user_metadata?.name || 'Friend');
    }
  }, [user]);

  // Weekly reset logic
  useEffect(() => {
    if (!progress || progressLoading) return;

    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday

    if (progress.week_start_date) {
      const storedWeekStart = new Date(progress.week_start_date);
      
      // Check if we're in a new week
      if (isBefore(storedWeekStart, weekStart)) {
        // Week has ended - calculate if streak should continue or reset
        const targetMet = (progress.hellos_this_week || 0) >= (progress.target_hellos_per_week || 5);
        
        const newWeeklyStreak = targetMet ? (progress.weekly_streak || 0) + 1 : 0;
        const newLongestStreak = Math.max(newWeeklyStreak, progress.longest_streak || 0);

        updateProgress({
          hellos_this_week: 0,
          week_start_date: weekStart.toISOString().split('T')[0],
          weekly_streak: newWeeklyStreak,
          longest_streak: newLongestStreak,
          is_onboarding_week: false
        });

        if (targetMet) {
          toast.success(`🎉 Week completed! Your streak is now ${newWeeklyStreak} weeks!`);
        } else if ((progress.weekly_streak || 0) > 0) {
          toast.error("Your weekly streak was reset. Let's start fresh!");
        }
      }
    }
  }, [progress, progressLoading]);

  // Update daily streak based on logs
  useEffect(() => {
    if (!progress || progressLoading || logsLoading) return;
    
    const todayCount = getLogsTodayCount();
    if (todayCount > 0 && progress.last_completed_date) {
      const lastDate = new Date(progress.last_completed_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      lastDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day
        updateProgress({ daily_streak: (progress.daily_streak || 0) + 1 });
      } else if (diffDays > 1) {
        // Streak broken
        updateProgress({ daily_streak: 1 });
      }
    }
  }, [logs]);

  const handleLogHello = async (data: { name?: string; notes?: string; rating?: 'positive' | 'neutral' | 'negative' }) => {
    const result = await addLog({
      ...data,
      hello_type: selectedChallenge || undefined
    });
    
    if (result) {
      // Update hellos this week count
      const newHellosThisWeek = (progress?.hellos_this_week || 0) + 1;
      const targetMet = newHellosThisWeek >= (progress?.target_hellos_per_week || 5);

      await updateProgress({
        hellos_this_week: newHellosThisWeek,
        last_completed_date: new Date().toISOString()
      });

      toast.success("Hello logged! 🎉");

      if (targetMet && !((progress?.hellos_this_week || 0) >= (progress?.target_hellos_per_week || 5))) {
        toast.success("🏆 You've hit your weekly target! Amazing!");
      }
    }
    
    setSelectedChallenge(null);
  };

  // Get completed onboarding challenges from logs this week
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

  // Check if all 7 onboarding challenges are complete and show popup (only once ever)
  useEffect(() => {
    if (allOnboardingComplete && progress?.is_onboarding_week && !progress?.has_completed_onboarding && !hasShownCompletionPopup) {
      setShowOnboardingComplete(true);
      setHasShownCompletionPopup(true);
    }
  }, [allOnboardingComplete, progress?.is_onboarding_week, progress?.has_completed_onboarding, hasShownCompletionPopup]);

  const handleOnboardingCompleteContinue = () => {
    setShowOnboardingComplete(false);
    setShowWeeklyChallengeIntro(true);
    // Mark onboarding as complete
    updateProgress({ has_completed_onboarding: true });
  };

  // Check if weekly challenge is completed this week
  const isWeeklyChallengeComplete = logs.some(log => {
    if (log.hello_type !== "Weekly Challenge") return false;
    const logDate = new Date(log.created_at);
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    return logDate >= weekStart;
  });
  if (progressLoading || logsLoading) {
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

  const targetHellos = progress.target_hellos_per_week || 5;
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
              <h2 className="text-lg font-semibold text-foreground mb-1">This Week</h2>
              <p className="text-sm text-muted-foreground">
                {currentHellos >= targetHellos 
                  ? "🎉 Target reached!" 
                  : `${targetHellos - currentHellos} more to go`
                }
              </p>
              <Button 
                onClick={() => setShowLogDialog(true)}
                className="mt-4"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Log a Hello
              </Button>
            </div>
            <ProgressRing 
              progress={currentHellos} 
              max={targetHellos}
              size={140}
              strokeWidth={14}
            />
          </div>
        </Card>

        {/* Streak Card */}
        <WeeklyStreakCard 
          weeklyStreak={progress.weekly_streak || 0}
          dailyStreak={progress.daily_streak || 0}
          totalHellos={logs.length}
        />

        {/* Onboarding Week Challenges or Weekly Challenge */}
        {progress.is_onboarding_week && !allOnboardingComplete ? (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Your First Week Challenges</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Try all 7 types of hello! Complete them in any order.
            </p>
            <div className="space-y-3">
              {onboardingChallenges.map((challenge) => (
                <OnboardingChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  isCompleted={completedTypes.includes(challenge.title)}
                  isAvailable={true}
                  onComplete={() => {
                    setSelectedChallenge(challenge.title);
                    setShowLogDialog(true);
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <Card className={`p-6 border-primary/20 ${isWeeklyChallengeComplete ? 'bg-muted/50' : 'bg-gradient-to-br from-primary/10 to-primary/5'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Trophy className={`w-6 h-6 ${isWeeklyChallengeComplete ? 'text-muted-foreground' : 'text-primary'}`} />
                  <h2 className={`text-lg font-semibold ${isWeeklyChallengeComplete ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    Weekly Challenge
                  </h2>
                </div>
                {isWeeklyChallengeComplete && (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                    Done!
                  </Badge>
                )}
              </div>
              <p className={`text-sm mb-4 ${isWeeklyChallengeComplete ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                Every week you'll get a new bonus challenge. Complete it to earn a streak saver!
              </p>
              <div className={`rounded-lg p-4 ${isWeeklyChallengeComplete ? 'bg-muted' : 'bg-background/50'}`}>
                <p className={`text-sm font-medium mb-1 ${isWeeklyChallengeComplete ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  This Week's Challenge:
                </p>
                <p className={`text-sm ${isWeeklyChallengeComplete ? 'text-muted-foreground/70 line-through' : 'text-muted-foreground'}`}>
                  Ask someone what the best part of their day was!
                </p>
              </div>
              {!isWeeklyChallengeComplete && (
                <Button 
                  className="w-full mt-4"
                  onClick={() => {
                    setSelectedChallenge("Weekly Challenge");
                    setShowLogDialog(true);
                  }}
                >
                  Complete Challenge
                </Button>
              )}
            </Card>
          </div>
        )}

        {/* Inspiration Section */}
        <div className="mt-6">
          <InspirationCard />
        </div>

      </div>

      <LogHelloDialog 
        open={showLogDialog}
        onOpenChange={(open) => {
          setShowLogDialog(open);
          if (!open) setSelectedChallenge(null);
        }}
        onLog={handleLogHello}
        challengeTitle={selectedChallenge}
      />

      <OnboardingCompleteDialog
        open={showOnboardingComplete}
        onOpenChange={setShowOnboardingComplete}
        targetHellos={targetHellos}
        onContinue={handleOnboardingCompleteContinue}
      />

      <WeeklyChallengeIntroDialog
        open={showWeeklyChallengeIntro}
        onOpenChange={setShowWeeklyChallengeIntro}
      />
    </div>
  );
}
