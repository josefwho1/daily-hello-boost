import { useMemo, memo } from "react";
import { Card } from "@/components/ui/card";
import { startOfWeek, startOfMonth, isAfter } from "date-fns";
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
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = completed ? 0 : circumference;

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 60 60">
        {/* Background circle */}
        <circle
          cx="30" cy="30" r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="3.5"
          opacity={0.5}
        />
        {/* Progress circle */}
        <circle
          cx="30" cy="30" r={radius}
          fill="none"
          stroke={completed ? "hsl(var(--success))" : "hsl(var(--muted))"}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className={`absolute text-xl font-bold ${completed ? 'text-success' : 'text-foreground'}`}>
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
    <div className="grid grid-cols-3 gap-3 mb-6">
      {/* Today's Hello - Circle Progress */}
      <Card className="p-3 rounded-2xl bg-card border-border/40 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <CircleProgress count={todayCount} />
          <span className="text-[11px] font-medium text-muted-foreground mt-1.5">Today</span>
        </div>
      </Card>
      
      {/* Streak */}
      <Card className="p-3 rounded-2xl bg-card border-border/40 shadow-sm">
        <div className="flex flex-col items-center text-center justify-center h-full">
          <div className="flex items-center gap-1.5">
            <p className="text-2xl font-bold text-foreground leading-none">{currentStreak}</p>
            {currentStreak >= 1 && <Flame className="w-5 h-5 text-orange-500" />}
          </div>
          <span className="text-[11px] font-medium text-muted-foreground mt-1.5">Streak</span>
        </div>
      </Card>
      
      {/* Lifetime */}
      <Card className="p-3 rounded-2xl bg-card border-border/40 shadow-sm">
        <div className="flex flex-col items-center text-center justify-center h-full">
          <div className="flex items-center gap-1.5">
            <p className="text-2xl font-bold text-foreground leading-none">{lifetimeHellos}</p>
            <Award className="w-5 h-5 text-primary/60" />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground mt-1.5">Lifetime</span>
        </div>
      </Card>
    </div>
  );
};

export const HomeStatsBar = memo(HomeStatsBarComponent);
