import { Card } from "@/components/ui/card";
import { Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyModeHomeCardProps {
  todaysHelloCount: number;
  currentStreak: number;
  hasLoggedToday: boolean;
  onClick?: () => void;
}

export const DailyModeHomeCard = ({
  todaysHelloCount,
  currentStreak,
  hasLoggedToday,
  onClick,
}: DailyModeHomeCardProps) => {
  return (
    <Card 
      className={cn(
        "p-4 rounded-xl bg-card border-border/50 cursor-pointer hover:bg-muted/50 transition-colors",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground text-base">Daily Mode Active</span>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Today:</span>
            {hasLoggedToday ? (
              <span className="flex items-center gap-1 text-base font-bold text-success">
                <Check className="w-4 h-4" />
                {todaysHelloCount} hello{todaysHelloCount !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-base font-bold text-destructive">0 hellos</span>
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
