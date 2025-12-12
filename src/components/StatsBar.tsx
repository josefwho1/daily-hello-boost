import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import orbImage from "@/assets/orb.webp";
import remiWaving from "@/assets/remi-waving.webp";
import remiSuper1 from "@/assets/remi-super-1.webp";
import { getRankFromLevel, getXpProgress } from "@/lib/xpSystem";

interface StatsBarProps {
  hellosToday: number;
  hellosThisWeek: number;
  dailyStreak: number;
  weeklyStreak: number;
  lifetimeHellos: number;
  orbs: number;
  mode: 'daily' | 'chill';
  isOnboardingWeek: boolean;
  onboardingCompleted: number;
  hasCompletedOnboarding?: boolean;
  currentLevel?: number;
  totalXp?: number;
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
          stroke="#FFE4D6"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FF6B35"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500"
        />
      </svg>
      {/* Level number in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-[#FF6B35]">{level}</span>
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
  totalXp = 0
}: StatsBarProps) => {
  const isDaily = mode === 'daily';
  
  // If onboarding is completed, treat as post-onboarding even if flag is stale
  const effectivelyOnboarding = isOnboardingWeek && !hasCompletedOnboarding;
  
  // During onboarding (7-day starter), show progress out of 7
  const progressValue = effectivelyOnboarding 
    ? onboardingCompleted 
    : isDaily 
      ? hellosToday // Daily mode: show actual count (can exceed 1)
      : hellosThisWeek; // Chill mode: show X/5
  
  const progressMax = effectivelyOnboarding ? 7 : isDaily ? 1 : 5;
  const progressPercent = Math.min((progressValue / progressMax) * 100, 100);

  // Get XP progress for level circle
  const xpProgress = getXpProgress(totalXp, currentLevel);
  const rank = getRankFromLevel(currentLevel);

  // Labels based on mode
  const getProgressLabel = () => {
    if (effectivelyOnboarding) return 'Your 7-Day Challenge';
    if (isDaily) return 'Today';
    return "Hello's This Week";
  };

  return (
    <Card className="p-4 space-y-4 bg-white border-[#FF6B35]/10">
      {/* Progress bar section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#502a13]">
            {getProgressLabel()}
          </span>
          <span className="text-sm font-bold text-[#FF6B35]">
            {progressValue} / {progressMax}
          </span>
        </div>
        <Progress value={progressPercent} className="h-3 [&>div]:bg-[#FF6B35]" />
      </div>

      {/* Primary Streak with Level - Emphasized */}
      {/* Daily Streak - visible during onboarding AND in Daily mode only */}
      {(effectivelyOnboarding || isDaily) && (
        <div className="flex items-center gap-4 p-5 rounded-xl bg-[#FFF4F5]">
          <img src={remiSuper1} alt="Streak" className="w-12 h-12 flex-shrink-0 object-contain" />
          <div className="flex-1">
            <p className="text-sm text-[#502a13]/70">Daily Streak</p>
            <p className="text-2xl font-bold text-[#502a13]">{dailyStreak} day{dailyStreak !== 1 ? 's' : ''}</p>
          </div>
          {/* Level Circle */}
          <div className="flex flex-col items-center">
            <LevelCircle level={currentLevel} progress={xpProgress.percent} />
            <p className="text-xs text-[#502a13]/60 mt-1">Level</p>
          </div>
        </div>
      )}

      {/* Weekly Streak - shown in Chill mode only (not during onboarding) */}
      {!effectivelyOnboarding && !isDaily && (
        <div className="flex items-center gap-4 p-5 rounded-xl bg-[#FFF4F5]">
          <img src={remiSuper1} alt="Streak" className="w-12 h-12 flex-shrink-0 object-contain" />
          <div className="flex-1">
            <p className="text-sm text-[#502a13]/70">Weekly Streak</p>
            <p className="text-2xl font-bold text-[#502a13]">{weeklyStreak} week{weeklyStreak !== 1 ? 's' : ''}</p>
          </div>
          {/* Level Circle */}
          <div className="flex flex-col items-center">
            <LevelCircle level={currentLevel} progress={xpProgress.percent} />
            <p className="text-xs text-[#502a13]/60 mt-1">Level</p>
          </div>
        </div>
      )}

      {/* Stats Grid - Smaller items */}
      <div className="grid grid-cols-2 gap-3">
        {/* Lifetime Hellos - ALWAYS visible */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FFF4F5]">
          <img src={remiWaving} alt="Lifetime Hellos" className="w-8 h-8 flex-shrink-0 object-contain" />
          <div>
            <p className="text-xs text-[#502a13]/70">Lifetime Hellos</p>
            <p className="font-bold text-[#502a13]">{lifetimeHellos}</p>
          </div>
        </div>

        {/* Orbs - ALWAYS visible */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FFF4F5] border border-[#FF6B35]/20">
          <img src={orbImage} alt="Orb" className="w-5 h-5 flex-shrink-0 object-contain" />
          <div>
            <p className="text-xs text-[#502a13]/70">Orbs</p>
            <p className="font-bold text-[#502a13]">{orbs} / 3</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
