import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyModeTileProps {
  isActive: boolean;
  bestStreak: number;
  onClick: () => void;
}

export const DailyModeTile = ({
  isActive,
  bestStreak,
  onClick,
}: DailyModeTileProps) => {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isActive && "border-primary border-2"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center text-2xl",
            isActive ? "bg-primary/20" : "bg-muted"
          )}>
            🔥
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">Daily Mode</h3>
              {isActive && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Challenge yourself - one hello every day
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {bestStreak > 0 
                ? `Best Streak: ${bestStreak} days 🏆`
                : "Not Active"
              }
            </p>
          </div>
          
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};
