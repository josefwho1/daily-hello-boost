import { Card } from "@/components/ui/card";
import { Flame, Trophy, Hand, Sparkles, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
  onboardingCompleted
}: StatsBarProps) => {
  const isDaily = mode === 'daily';
  const showDailyStreak = isOnboardingWeek || isDaily;
  const showWeeklyStreak = !isOnboardingWeek;
  
  // During onboarding, show progress out of 7
  const progressValue = isOnboardingWeek ? onboardingCompleted : hellosThisWeek;
  const progressMax = isOnboardingWeek ? 7 : targetHellos;
  const progressPercent = Math.min((progressValue / progressMax) * 100, 100);

  return (
    <Card className="p-4 space-y-4">
      {/* Hellos this week / Onboarding progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {isOnboardingWeek ? 'Your 7-Day Challenge' : 'Hellos This Week'}
          </span>
          <span className="text-sm font-bold text-primary">
            {progressValue} / {progressMax}
          </span>
        </div>
        <Progress value={progressPercent} className="h-3" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Daily Streak - visible during onboarding & daily mode */}
        {showDailyStreak && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10">
            <Flame className="w-5 h-5 text-primary flex-shrink-0" />
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
        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary/30">
          <Hand className="w-5 h-5 text-secondary-foreground flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Lifetime Hellos</p>
            <p className="font-bold text-foreground">{lifetimeHellos}</p>
          </div>
        </div>

        {/* Orbs - ALWAYS visible */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Orbs</p>
            <p className="font-bold text-foreground">{orbs} / 3</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
