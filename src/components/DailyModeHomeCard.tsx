import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Daily Mode Active</span>
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">Today:</span>
            {hasLoggedToday ? (
              <span className="flex items-center gap-1 text-sm font-medium text-success">
                <Check className="w-4 h-4" />
                {todaysHelloCount} hello{todaysHelloCount !== 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-sm font-medium text-destructive">
                0 hellos
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">Current Streak:</span>
            <span className="text-sm font-bold text-foreground">
              {currentStreak} days 🔥
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
