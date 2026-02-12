import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { thirtyHellosChallenge, ThirtyHelloChallenge } from "@/data/thirtyHellosChallenge";
import { cn } from "@/lib/utils";

interface ThirtyHellosCardProps {
  completedDays: number[];
  onComplete: (day: number, challengeName: string) => void;
  onViewAll: () => void;
}

export const ThirtyHellosCard = ({
  completedDays,
  onComplete,
  onViewAll,
}: ThirtyHellosCardProps) => {
  // completedDays now contains clean 1-30 day numbers (offset handled by parent)
  const totalCount = 30;

  // Find first incomplete challenge
  const getNextIncompleteIndex = () => {
    for (let i = 0; i < thirtyHellosChallenge.length; i++) {
      if (!completedDays.includes(thirtyHellosChallenge[i].day)) return i;
    }
    return thirtyHellosChallenge.length - 1;
  };

  const [currentIndex, setCurrentIndex] = useState(getNextIncompleteIndex);
  const currentChallenge = thirtyHellosChallenge[currentIndex];
  const isDayComplete = completedDays.includes(currentChallenge?.day || 0);
  const actualCompleted = thirtyHellosChallenge.filter(c => completedDays.includes(c.day)).length;
  const progressPercent = totalCount > 0 ? (actualCompleted / totalCount) * 100 : 0;
  const isAllComplete = actualCompleted >= totalCount;

  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < thirtyHellosChallenge.length - 1;
  const goLeft = () => { if (canGoLeft) setCurrentIndex(currentIndex - 1); };
  const goRight = () => { if (canGoRight) setCurrentIndex(currentIndex + 1); };

  const handleCompleteClick = () => {
    if (currentChallenge && !isDayComplete) {
      onComplete(currentChallenge.day, currentChallenge.name);
    }
  };

  return (
    <Card className="p-4 rounded-xl bg-card border-border/50 relative overflow-hidden flex flex-col min-h-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="font-bold text-foreground text-lg">30 Hellos</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={goLeft} disabled={!canGoLeft} aria-label="Previous challenge"
            className={cn("h-10 w-12 flex items-center justify-center rounded-lg transition-colors",
              canGoLeft ? "text-muted-foreground hover:text-foreground hover:bg-muted" : "text-muted-foreground/30 pointer-events-none")}>
            <ChevronLeft size={22} />
          </button>
          <button onClick={goRight} disabled={!canGoRight} aria-label="Next challenge"
            className={cn("h-10 w-12 flex items-center justify-center rounded-lg transition-colors",
              canGoRight ? "text-muted-foreground hover:text-foreground hover:bg-muted" : "text-muted-foreground/30 pointer-events-none")}>
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground font-semibold text-sm">
            Day {currentChallenge?.day} of {totalCount} · {actualCompleted} completed
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Content */}
      {isAllComplete && currentIndex === thirtyHellosChallenge.length - 1 ? (
        <div className="flex-1 flex flex-col justify-center space-y-3 mt-3">
          <div className="flex items-center gap-2 text-success">
            <Check className="w-5 h-5" />
            <span className="font-semibold">🎉 All 30 Hellos Complete!</span>
          </div>
          <p className="text-sm text-muted-foreground">
            You're a social champion!
          </p>
          <button onClick={onViewAll} className="h-10 px-4 rounded-full hover:bg-muted transition-colors flex items-center justify-center gap-1 text-muted-foreground text-xs">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : currentChallenge ? (
        <div className="flex-1 flex flex-col mt-3">
          {/* Challenge name - fixed height */}
          <div className="h-6 flex items-center">
            <h3 className={cn(
              "text-base font-bold line-clamp-1",
              isDayComplete ? "text-success" : "text-foreground"
            )}>
              {currentChallenge.name}
            </h3>
          </div>

          {/* Description area - fixed height for 2 lines */}
          <div className="h-[2.75rem] mt-1">
            <p className={cn(
              "text-sm text-muted-foreground line-clamp-2",
              isDayComplete && "line-through opacity-70"
            )}>
              {currentChallenge.description}
            </p>
          </div>

          {/* Suggestion area - fixed height for 2 lines */}
          <div className="h-[2.25rem] mt-1">
            {!isDayComplete && currentChallenge.suggestion && (
              <p className="text-xs text-muted-foreground/70 italic line-clamp-2">
                💡 {currentChallenge.suggestion}
              </p>
            )}
          </div>

          {/* Buttons - pushed to bottom */}
          <div className="mt-auto pt-2 flex items-center justify-between gap-2">
            {!isDayComplete ? (
              <button
                onClick={handleCompleteClick}
                className="h-10 px-5 rounded-full font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center justify-center gap-1.5 flex-1 text-sm shadow-md"
                data-compact
              >
                Complete Challenge
              </button>
            ) : (
              <div className="h-10 px-5 rounded-full text-sm font-medium bg-success/10 text-success border border-success/50 flex items-center justify-center gap-1.5 flex-1" data-compact>
                <Check size={16} />
                Completed
              </div>
            )}
            <button
              onClick={onViewAll}
              className="h-10 px-4 rounded-full hover:bg-muted transition-colors flex items-center justify-center gap-1 text-muted-foreground text-xs"
              data-compact
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}
    </Card>
  );
};
