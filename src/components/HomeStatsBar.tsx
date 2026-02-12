import { memo, useState } from "react";
import { useDailyMode } from "@/hooks/useDailyMode";
import { useHelloLogs } from "@/hooks/useHelloLogs";
import { Flame, Eye } from "lucide-react";
import { startOfMonth, startOfWeek, isAfter } from "date-fns";

interface HelloLog {
  id: string;
  created_at: string;
}

type CountMode = 'total' | 'month' | 'week';

interface HomeStatsBarProps {
  logs: HelloLog[];
  lifetimeHellos: number;
}

const CircleProgress = ({ count }: { count: number }) => {
  const completed = count >= 1;
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = completed ? 0 : circumference;

  return (
    <div className="relative w-9 h-9 flex items-center justify-center">
      <svg className="w-9 h-9 -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20" cy="20" r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="2.5"
          opacity={0.4}
        />
        <circle
          cx="20" cy="20" r={radius}
          fill="none"
          stroke={completed ? "hsl(var(--success))" : "hsl(var(--muted))"}
          strokeWidth="2.5"
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

const LABELS: Record<CountMode, string> = {
  total: 'Total',
  month: 'Month',
  week: 'Week',
};

const HomeStatsBarComponent = ({ logs, lifetimeHellos }: HomeStatsBarProps) => {
  const { state: dailyModeState } = useDailyMode();
  const [countMode, setCountMode] = useState<CountMode>('total');
  const [showStreak, setShowStreak] = useState(true);

  const todayCount = dailyModeState.todaysHelloCount;
  const currentStreak = dailyModeState.currentStreak;

  const cycleCountMode = () => {
    setCountMode(prev => {
      if (prev === 'total') return 'month';
      if (prev === 'month') return 'week';
      return 'total';
    });
  };

  const getCount = () => {
    if (countMode === 'total') return lifetimeHellos;
    const now = new Date();
    const boundary = countMode === 'month'
      ? startOfMonth(now)
      : startOfWeek(now, { weekStartsOn: 1 });
    return logs.filter(l => isAfter(new Date(l.created_at), boundary)).length;
  };

  return (
    <div className="grid grid-cols-[1fr_1px_1fr_1px_1fr] items-center rounded-2xl bg-card border border-border/40 shadow-sm px-2 py-3 mb-6">
      {/* Today */}
      <div className="flex items-center justify-center gap-2.5">
        <CircleProgress count={todayCount} />
        <span className="text-xs font-medium text-muted-foreground">Today</span>
      </div>

      <div className="h-8 bg-border/40" />

      {/* Streak - tappable to hide/show */}
      <button
        onClick={() => setShowStreak(prev => !prev)}
        className="flex items-center justify-center gap-1.5 focus:outline-none active:scale-95 transition-transform min-h-[36px]"
      >
        {showStreak ? (
          <>
            <span className="text-lg font-bold text-foreground leading-none">{currentStreak}</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </>
        ) : (
          <Eye className="w-4 h-4 text-muted-foreground/50" />
        )}
      </button>

      <div className="h-8 bg-border/40" />

      {/* Lifetime / Month / Week - tappable to cycle */}
      <button
        onClick={cycleCountMode}
        className="flex items-center justify-center gap-1.5 focus:outline-none active:scale-95 transition-transform min-h-[36px]"
      >
        <span className="text-lg font-bold text-foreground leading-none">{getCount()}</span>
        <span className="text-xs font-medium text-muted-foreground">{LABELS[countMode]}</span>
      </button>
    </div>
  );
};

export const HomeStatsBar = memo(HomeStatsBarComponent);
