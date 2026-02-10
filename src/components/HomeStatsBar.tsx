import { memo } from "react";
import { useDailyMode } from "@/hooks/useDailyMode";

interface HelloLog {
  id: string;
  created_at: string;
}

interface HomeStatsBarProps {
  logs: HelloLog[];
  lifetimeHellos: number;
}

const CircleProgress = ({ count }: { count: number }) => {
  const completed = count >= 1;
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = completed ? 0 : circumference;

  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18" cy="18" r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="2.5"
          opacity={0.4}
        />
        <circle
          cx="18" cy="18" r={radius}
          fill="none"
          stroke={completed ? "hsl(var(--success))" : "hsl(var(--muted))"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className={`absolute text-xs font-bold ${completed ? 'text-success' : 'text-foreground'}`}>
        {count}
      </span>
    </div>
  );
};

const HomeStatsBarComponent = ({ logs, lifetimeHellos }: HomeStatsBarProps) => {
  const { state: dailyModeState } = useDailyMode();

  const todayCount = dailyModeState.todaysHelloCount;
  const currentStreak = dailyModeState.currentStreak;

  return (
    <div className="flex items-center justify-between rounded-2xl bg-card border border-border/40 shadow-sm px-4 py-2.5 mb-6">
      {/* Today */}
      <div className="flex items-center gap-2">
        <CircleProgress count={todayCount} />
        <span className="text-xs font-medium text-muted-foreground">Today</span>
      </div>

      <div className="w-px h-7 bg-border/40" />

      {/* Streak */}
      <div className="flex items-center gap-1.5">
        <span className="text-base font-bold text-foreground leading-none">{currentStreak}</span>
        <span className="text-sm">🔥</span>
      </div>

      <div className="w-px h-7 bg-border/40" />

      {/* Lifetime */}
      <div className="flex items-center gap-1.5">
        <span className="text-base font-bold text-foreground leading-none">{lifetimeHellos}</span>
        <span className="text-xs font-medium text-muted-foreground">Total</span>
      </div>
    </div>
  );
};

export const HomeStatsBar = memo(HomeStatsBarComponent);
