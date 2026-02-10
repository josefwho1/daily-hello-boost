import { memo } from "react";
import { useDailyMode } from "@/hooks/useDailyMode";
import { Flame, Award } from "lucide-react";

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
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = completed ? 0 : circumference;

  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22" cy="22" r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="3"
          opacity={0.4}
        />
        <circle
          cx="22" cy="22" r={radius}
          fill="none"
          stroke={completed ? "hsl(var(--success))" : "hsl(var(--muted))"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className={`absolute text-sm font-bold ${completed ? 'text-success' : 'text-foreground'}`}>
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
    <div className="flex items-center justify-between rounded-2xl bg-card border border-border/40 shadow-sm px-5 py-3 mb-6">
      {/* Today */}
      <div className="flex items-center gap-2.5">
        <CircleProgress count={todayCount} />
        <span className="text-xs font-medium text-muted-foreground">Today</span>
      </div>

      <div className="w-px h-8 bg-border/40" />

      {/* Streak */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-foreground leading-none">{currentStreak}</span>
          {currentStreak >= 1 && <Flame className="w-4 h-4 text-orange-500" />}
        </div>
        <span className="text-xs font-medium text-muted-foreground">Streak</span>
      </div>

      <div className="w-px h-8 bg-border/40" />

      {/* Lifetime */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-foreground leading-none">{lifetimeHellos}</span>
          <Award className="w-4 h-4 text-primary/60" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">Total</span>
      </div>
    </div>
  );
};

export const HomeStatsBar = memo(HomeStatsBarComponent);
