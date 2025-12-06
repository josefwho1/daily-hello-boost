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
import { onboardingChallenges } from "@/data/onboardingChallenges";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek, isAfter, isBefore } from "date-fns";
import logoSticker from "@/assets/one-hello-logo-sticker.png";
import remiMascot from "@/assets/remi-mascot.png";
import { Hand, Plus, Sparkles } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, loading: progressLoading, updateProgress } = useUserProgress();
  const { logs, loading: logsLoading, addLog, hellosThisWeek, getLogsTodayCount } = useHelloLogs();
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [username, setUsername] = useState("");

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

  const handleLogHello = async (data: { name?: string; notes?: string; hello_type?: string }) => {
    const result = await addLog(data);
    
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
          <img src={logoSticker} alt="One Hello" className="h-24" />
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

        {/* Onboarding Week Challenges */}
        {progress.is_onboarding_week && (
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
                    setShowLogDialog(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Inspiration Section */}
        <div className="mt-6">
          <InspirationCard />
        </div>

        {/* Recent Hellos */}
        {logs.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Hellos</h2>
            <div className="space-y-3">
              {logs.slice(0, 5).map((log) => (
                <Card key={log.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Hand className="w-4 h-4 text-primary" />
                        {log.hello_type && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {log.hello_type}
                          </span>
                        )}
                      </div>
                      {log.name && (
                        <p className="font-medium text-foreground mt-1">{log.name}</p>
                      )}
                      {log.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{log.notes}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), 'MMM d')}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/notes')}
            >
              View All Notes
            </Button>
          </div>
        )}
      </div>

      <LogHelloDialog 
        open={showLogDialog}
        onOpenChange={setShowLogDialog}
        onLog={handleLogHello}
      />
    </div>
  );
}
