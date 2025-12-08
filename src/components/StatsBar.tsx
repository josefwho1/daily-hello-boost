import { Card } from "@/components/ui/card";
import { Trophy, Hand } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import orbImage from "@/assets/orb.webp";
import dailyStreakIcon from "@/assets/daily-streak-icon.webp";

interface StatsBarProps {
  hellosThisWeek: number;
  targetHellos: number;
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
  hellosThisWeek,
  targetHellos,
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
  
  // Daily streak visible during onboarding OR in Daily mode (not Connect mode)
  const showDailyStreak = effectivelyOnboarding || isDaily;
  
  // Weekly streak visible AFTER onboarding in BOTH modes
  const showWeeklyStreak = !effectivelyOnboarding;
  
  // During onboarding, show progress out of 7
  const progressValue = effectivelyOnboarding ? onboardingCompleted : hellosThisWeek;
  const progressMax = effectivelyOnboarding ? 7 : targetHellos;
  const progressPercent = Math.min((progressValue / progressMax) * 100, 100);

  return (
    <Card className="p-4 space-y-4">
      {/* Hellos this week / Onboarding progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {effectivelyOnboarding ? 'Your 7-Day Challenge' : "Hello's This Week"}
          </span>
          <span className="text-sm font-bold text-primary">
            {progressValue} / {progressMax}
          </span>
        </div>
        <Progress value={progressPercent} className="h-3 [&>div]:bg-[#ff6f3b]" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Daily Streak - visible during onboarding & daily mode */}
        {showDailyStreak && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10">
            <img src={dailyStreakIcon} alt="Daily Streak" className="w-6 h-6 flex-shrink-0 object-contain" />
            <div>
              <p className="text-xs text-muted-foreground">Daily Streak</p>
              <p className="font-bold text-foreground">{dailyStreak} day{dailyStreak !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {/* Weekly Streak - shown after onboarding in BOTH modes */}
        {showWeeklyStreak && (
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
