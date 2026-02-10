import { useMemo, memo } from "react";
import { Card } from "@/components/ui/card";
import { startOfWeek, startOfMonth, isAfter } from "date-fns";
import { useDailyMode } from "@/hooks/useDailyMode";
import { Flame } from "lucide-react";

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
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = completed ? 0 : circumference;

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 52 52">
        {/* Background circle */}
        <circle
          cx="26" cy="26" r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="4"
        />
        {/* Progress circle */}
        <circle
          cx="26" cy="26" r={radius}
          fill="none"
          stroke={completed ? "hsl(var(--success))" : "hsl(var(--muted))"}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute text-lg font-bold text-foreground">{count}</span>
    </div>
  );
};

const HomeStatsBarComponent = ({ logs, lifetimeHellos }: HomeStatsBarProps) => {
  const { state: dailyModeState } = useDailyMode();

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);

    const hellosThisWeek = logs.filter(log => 
      isAfter(new Date(log.created_at), weekStart)
    ).length;

    const hellosThisMonth = logs.filter(log => 
      isAfter(new Date(log.created_at), monthStart)
    ).length;

    return { hellosThisWeek, hellosThisMonth, lifetimeHellos };
  }, [logs, lifetimeHellos]);

  const todayCount = dailyModeState.todaysHelloCount;
  const currentStreak = dailyModeState.currentStreak;

  return (
    <div className="grid grid-cols-3 gap-2 mb-6">
      {/* Today's Hello - Circle Progress */}
      <Card className="p-3 rounded-xl bg-card border-border/50">
        <div className="flex flex-col items-center text-center">
          <CircleProgress count={todayCount} />
          <span className="text-[10px] text-muted-foreground mt-1">Today</span>
        </div>
      </Card>
      
      {/* Streak */}
      <Card className="p-3 rounded-xl bg-card border-border/50">
        <div className="flex flex-col items-center text-center justify-center h-full">
          <div className="flex items-center gap-1">
            <p className="text-xl font-bold text-foreground leading-none">{currentStreak}</p>
            {currentStreak >= 1 && <Flame className="w-4 h-4 text-orange-500" />}
          </div>
          <span className="text-[10px] text-muted-foreground mt-1">Streak</span>
        </div>
      </Card>
      
      {/* Lifetime */}
      <Card className="p-3 rounded-xl bg-card border-border/50">
        <div className="flex flex-col items-center text-center justify-center h-full">
          <p className="text-xl font-bold text-foreground leading-none">{stats.lifetimeHellos}</p>
          <span className="text-[10px] text-muted-foreground mt-1">Lifetime</span>
        </div>
      </Card>
    </div>
  );
};

export const HomeStatsBar = memo(HomeStatsBarComponent);
