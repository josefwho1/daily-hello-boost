import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { startOfWeek, startOfMonth, isAfter } from "date-fns";

interface HelloLog {
  id: string;
  created_at: string;
}

interface HomeStatsBarProps {
  logs: HelloLog[];
  lifetimeHellos: number;
}

export const HomeStatsBar = ({ logs, lifetimeHellos }: HomeStatsBarProps) => {
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

    return {
      hellosThisWeek,
      hellosThisMonth,
      lifetimeHellos
    };
  }, [logs, lifetimeHellos]);

  return (
    <div className="grid grid-cols-3 gap-2 mb-6">
      <Card className="p-3 rounded-xl bg-card border-border/50">
        <div className="flex flex-col items-center text-center">
          <p className="text-xl font-bold text-foreground leading-none">{stats.hellosThisWeek}</p>
          <span className="text-[10px] text-muted-foreground mt-1">This Week</span>
        </div>
      </Card>
      
      <Card className="p-3 rounded-xl bg-card border-border/50">
        <div className="flex flex-col items-center text-center">
          <p className="text-xl font-bold text-foreground leading-none">{stats.hellosThisMonth}</p>
          <span className="text-[10px] text-muted-foreground mt-1">This Month</span>
        </div>
      </Card>
      
      <Card className="p-3 rounded-xl bg-card border-border/50">
        <div className="flex flex-col items-center text-center">
          <p className="text-xl font-bold text-foreground leading-none">{stats.lifetimeHellos}</p>
          <span className="text-[10px] text-muted-foreground mt-1">Lifetime</span>
        </div>
      </Card>
    </div>
  );
};
