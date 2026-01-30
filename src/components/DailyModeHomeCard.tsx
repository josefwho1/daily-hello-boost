import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface DailyModeHomeCardProps {
  todaysHelloCount: number;
  currentStreak: number;
  hasLoggedToday: boolean;
}

export const DailyModeHomeCard = ({
  todaysHelloCount,
  currentStreak,
  hasLoggedToday,
}: DailyModeHomeCardProps) => {
  return (
    <Card className="p-3 rounded-xl bg-card border-border/50 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <span className="font-semibold text-foreground text-sm">Daily Mode</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Today:</span>
            {hasLoggedToday ? (
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <Check className="w-3 h-3" />
                {todaysHelloCount}
              </span>
            ) : (
              <span className="text-xs font-medium text-destructive">0</span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Streak:</span>
            <span className="text-xs font-bold text-foreground">
              {currentStreak} 🔥
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
