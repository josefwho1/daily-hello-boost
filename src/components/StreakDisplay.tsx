import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  streak: number;
  className?: string;
}

export const StreakDisplay = ({ streak, className }: StreakDisplayProps) => {
  return (
    <div className={cn(
      "bg-gradient-to-br from-accent to-primary rounded-2xl p-6 text-primary-foreground shadow-lg",
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90 mb-1">Your Streak</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{streak}</span>
            <span className="text-lg font-medium opacity-90">day{streak !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-primary-foreground/20 rounded-full blur-xl"></div>
          <Flame size={56} className="relative" />
        </div>
      </div>
      
      {streak > 0 && (
        <div className="mt-4 pt-4 border-t border-primary-foreground/20">
          <p className="text-sm opacity-90">
            {streak === 7 ? "🎉 Amazing! You completed all 7 days!" : "Keep it going! You're doing great!"}
          </p>
        </div>
      )}
    </div>
  );
};
