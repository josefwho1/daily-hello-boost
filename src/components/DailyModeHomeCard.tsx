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
    <Card className="p-4 rounded-xl bg-card border-border/50 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <span className="font-bold text-foreground text-base">Daily Mode</span>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Today:</span>
            {hasLoggedToday ? (
              <span className="flex items-center gap-1 text-base font-bold text-success">
                <Check className="w-4 h-4" />
                {todaysHelloCount}
              </span>
            ) : (
              <span className="text-base font-bold text-destructive">0</span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Streak:</span>
            <span className="text-lg font-bold text-foreground">
              {currentStreak} 🔥
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
