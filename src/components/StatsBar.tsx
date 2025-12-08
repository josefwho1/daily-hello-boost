import { Card } from "@/components/ui/card";
import { Flame, Trophy, Hand } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import orbImage from "@/assets/orb.webp";

interface StatsBarProps {
  hellosToday: number;
  hellosThisWeek: number;
  dailyStreak: number;
  weeklyStreak: number;
  lifetimeHellos: number;
  orbs: number;
  mode: 'daily' | 'connect';
  isOnboardingWeek: boolean;
  onboardingCompleted: number;
  hasCompletedOnboarding?: boolean;
}

export const StatsBar = ({
  hellosToday,
  hellosThisWeek,
  dailyStreak,
  weeklyStreak,
  lifetimeHellos,
  orbs,
  mode,
  isOnboardingWeek,
  onboardingCompleted,
  hasCompletedOnboarding = false
}: StatsBarProps) => {
  const isDaily = mode === 'daily';
  
  // If onboarding is completed, treat as post-onboarding even if flag is stale
  const effectivelyOnboarding = isOnboardingWeek && !hasCompletedOnboarding;
  
  // During onboarding (7-day starter), show progress out of 7
  const progressValue = effectivelyOnboarding 
    ? onboardingCompleted 
    : isDaily 
      ? Math.min(hellosToday, 1) // Daily mode: show 0/1 or 1/1
      : hellosThisWeek; // Connect mode: show X/5
  
  const progressMax = effectivelyOnboarding ? 7 : isDaily ? 1 : 5;
  const progressPercent = Math.min((progressValue / progressMax) * 100, 100);

  // Labels based on mode
  const getProgressLabel = () => {
    if (effectivelyOnboarding) return 'Your 7-Day Challenge';
    if (isDaily) return 'Today';
    return "Hello's This Week";
  };

  return (
    <Card className="p-4 space-y-4">
      {/* Progress bar section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {getProgressLabel()}
          </span>
          <span className="text-sm font-bold text-primary">
            {progressValue} / {progressMax}
          </span>
        </div>
        <Progress value={progressPercent} className="h-3 [&>div]:bg-[#ff6f3b]" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Daily Streak - visible during onboarding AND in Daily mode only */}
        {(effectivelyOnboarding || isDaily) && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10">
            <Flame className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Daily Streak</p>
              <p className="font-bold text-foreground">{dailyStreak} day{dailyStreak !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {/* Weekly Streak - shown in Connect mode only (not during onboarding) */}
        {!effectivelyOnboarding && !isDaily && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/10">
            <Trophy className="w-5 h-5 text-accent flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Weekly Streak</p>
              <p className="font-bold text-foreground">{weeklyStreak} week{weeklyStreak !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {/* Lifetime Hellos - ALWAYS visible */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10">
          <Hand className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Lifetime Hellos</p>
            <p className="font-bold text-foreground">{lifetimeHellos}</p>
          </div>
        </div>

        {/* Orbs - ALWAYS visible */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <img src={orbImage} alt="Orb" className="w-5 h-5 flex-shrink-0 object-contain" />
          <div>
            <p className="text-xs text-muted-foreground">Orbs</p>
            <p className="font-bold text-foreground">{orbs} / 3</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
