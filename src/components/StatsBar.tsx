import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import orbImage from "@/assets/orb.webp";
import remiWaving from "@/assets/remi-waving.webp";
import remiSuper1 from "@/assets/remi-super-1.webp";
import remiSuper2 from "@/assets/remi-super-2.webp";
import { getRankFromLevel, getXpProgress } from "@/lib/xpSystem";

const withCacheBuster = (src: string) => {
  const v = "super2_2026-01-22";
  return `${src}${src.includes("?") ? "&" : "?"}v=${encodeURIComponent(v)}`;
};

// Helper to get the appropriate streak image
const getStreakImage = (streak: number) => {
  // Cache-bust Super Remi 2 specifically to avoid stale placeholder assets
  // lingering in PWA/browser caches.
  return streak >= 10 ? withCacheBuster(remiSuper2) : remiSuper1;
};

interface StatsBarProps {
  hellosToday: number;
  hellosThisWeek: number;
  dailyStreak: number;
  weeklyStreak: number;
  lifetimeHellos: number;
  orbs: number;
  mode: 'daily' | 'chill' | 'first_hellos';
  isOnboardingWeek: boolean;
  onboardingCompleted: number;
  hasCompletedOnboarding?: boolean;
  currentLevel?: number;
  totalXp?: number;
  firstHellosCompleted?: number;
}

// Circular progress component for level
const LevelCircle = ({ level, progress }: { level: number; progress: number }) => {
  const size = 56;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-primary/20"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-primary"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'all 0.5s' }}
        />
      </svg>
      {/* Level number in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-primary">{level}</span>
      </div>
    </div>
  );
};

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
  hasCompletedOnboarding = false,
  currentLevel = 1,
  totalXp = 0,
  firstHellosCompleted = 0
}: StatsBarProps) => {
  const isDaily = mode === 'daily';
  const isFirstHellos = mode === 'first_hellos';
  const isChill = mode === 'chill';
  
  // If onboarding is completed, treat as post-onboarding even if flag is stale
  const effectivelyOnboarding = (isOnboardingWeek && !hasCompletedOnboarding) || isFirstHellos;
  
  // Determine progress values based on mode
  let progressValue: number;
  let progressMax: number;
  
  if (isFirstHellos || (!hasCompletedOnboarding && isOnboardingWeek)) {
    // First Hellos mode or any onboarding user
    progressValue = firstHellosCompleted;
    progressMax = 5;
  } else if (isDaily) {
    progressValue = hellosToday;
    progressMax = 1;
  } else {
    progressValue = hellosThisWeek;
    progressMax = 3; // Chill mode target is 3 hellos per week
  }
  
  const progressPercent = Math.min((progressValue / progressMax) * 100, 100);

  // Get XP progress for level circle
  const xpProgress = getXpProgress(totalXp, currentLevel);

  // Labels based on mode
  const getProgressLabel = () => {
    if (isFirstHellos || (!hasCompletedOnboarding && isOnboardingWeek)) return "First Hello's";
    if (isDaily) return 'Today';
    return "Hello's This Week";
  };

  return (
    <Card className="p-4 space-y-4 border-primary/10">
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
        <Progress value={progressPercent} className="h-3 [&>div]:bg-primary" />
      </div>

      {/* Primary Streak with Level - Emphasized */}
      {/* Daily Streak - visible during onboarding AND in Daily mode only */}
      {(effectivelyOnboarding || isDaily) && (
        <div className="flex items-center gap-4 p-5 rounded-xl bg-muted">
          <img src={getStreakImage(dailyStreak)} alt="Streak" className="w-12 h-12 flex-shrink-0 object-contain" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Daily Streak</p>
            <p className="text-2xl font-bold text-foreground">{dailyStreak} day{dailyStreak !== 1 ? 's' : ''}</p>
          </div>
          {/* Level Circle */}
          <div className="flex flex-col items-center">
            <LevelCircle level={currentLevel} progress={xpProgress.percent} />
            <p className="text-xs text-muted-foreground mt-1">Level</p>
          </div>
        </div>
      )}

      {/* Weekly Streak - shown in Chill mode only (not during onboarding) */}
      {!effectivelyOnboarding && !isDaily && (
        <div className="flex items-center gap-4 p-5 rounded-xl bg-muted">
          <img src={getStreakImage(weeklyStreak)} alt="Streak" className="w-12 h-12 flex-shrink-0 object-contain" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Weekly Streak</p>
            <p className="text-2xl font-bold text-foreground">{weeklyStreak} week{weeklyStreak !== 1 ? 's' : ''}</p>
          </div>
          {/* Level Circle */}
          <div className="flex flex-col items-center">
            <LevelCircle level={currentLevel} progress={xpProgress.percent} />
            <p className="text-xs text-muted-foreground mt-1">Level</p>
          </div>
        </div>
      )}

      {/* Stats Grid - Smaller items */}
      <div className="grid grid-cols-2 gap-3">
        {/* Lifetime Hellos - ALWAYS visible */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
          <img src={remiWaving} alt="Lifetime Hellos" className="w-8 h-8 flex-shrink-0 object-contain" />
          <div>
            <p className="text-xs text-muted-foreground">Lifetime Hellos</p>
            <p className="font-bold text-foreground">{lifetimeHellos}</p>
          </div>
        </div>

        {/* Orbs - ALWAYS visible */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted border border-primary/20">
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
