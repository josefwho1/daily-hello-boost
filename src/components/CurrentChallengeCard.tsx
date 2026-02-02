import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, ChevronRight, ChevronLeft, Check, RotateCcw, Lightbulb } from "lucide-react";
import { thirtyDayChallenge, ThirtyDayChallenge } from "@/data/thirtyDayChallenge";
import { cn } from "@/lib/utils";
import remiProud from "@/assets/remi-proud.webp";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CurrentChallengeCardProps {
  completedDays: number[];
  nextChallenge: ThirtyDayChallenge | null;
  totalCount: number;
  isComplete: boolean;
  onComplete: (day: number, challengeName: string) => void;
  onViewAll: () => void;
  onRestart: () => void;
}

export const CurrentChallengeCard = ({
  completedDays,
  nextChallenge,
  totalCount,
  isComplete,
  onComplete,
  onViewAll,
  onRestart,
}: CurrentChallengeCardProps) => {
  const [showConfirmRestart, setShowConfirmRestart] = useState(false);
  const [showTip, setShowTip] = useState(false);
  
  // Find current challenge index and allow navigation
  const getCurrentIndex = () => {
    if (!nextChallenge) return thirtyDayChallenge.length - 1;
    return thirtyDayChallenge.findIndex(c => c.day === nextChallenge.day);
  };
  
  const [currentIndex, setCurrentIndex] = useState(getCurrentIndex);
  const currentChallenge = thirtyDayChallenge[currentIndex];
  const isChallengeComplete = completedDays.includes(currentChallenge?.day || 0);

  const completedCount = completedDays.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < thirtyDayChallenge.length - 1;

  const goLeft = () => {
    if (canGoLeft) {
      setCurrentIndex(currentIndex - 1);
      setShowTip(false);
    }
  };

  const goRight = () => {
    if (canGoRight) {
      setCurrentIndex(currentIndex + 1);
      setShowTip(false);
    }
  };

  const handleCompleteClick = () => {
    if (currentChallenge) {
      onComplete(currentChallenge.day, currentChallenge.name);
    }
  };

  const handleRestartClick = () => {
    setShowConfirmRestart(true);
  };

  const handleConfirmRestart = () => {
    onRestart();
    setShowConfirmRestart(false);
    setCurrentIndex(0);
  };

  return (
    <>
      <Card className="p-4 rounded-xl bg-card border-border/50 relative overflow-hidden h-[240px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="font-bold text-foreground text-base">The One Hello Challenge</span>
            </div>
          </div>
          
          {/* Navigation arrows */}
          <div className="flex items-center gap-1">
            <button
              onClick={goLeft}
              disabled={!canGoLeft}
              aria-label="Previous challenge"
              className={cn(
                "h-7 w-7 flex items-center justify-center rounded-lg transition-colors",
                canGoLeft ? "text-muted-foreground hover:text-foreground hover:bg-muted" : "text-muted-foreground/30 pointer-events-none"
              )}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goRight}
              disabled={!canGoRight}
              aria-label="Next challenge"
              className={cn(
                "h-7 w-7 flex items-center justify-center rounded-lg transition-colors",
                canGoRight ? "text-muted-foreground hover:text-foreground hover:bg-muted" : "text-muted-foreground/30 pointer-events-none"
              )}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">
              Day {currentChallenge?.day} of {totalCount} • {completedCount} completed
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Content */}
        {isComplete && currentIndex === thirtyDayChallenge.length - 1 ? (
          <div className="flex-1 flex flex-col justify-center space-y-3 pr-14">
            <div className="flex items-center gap-2 text-success">
              <Check className="w-5 h-5" />
              <span className="font-semibold">🎉 Challenge Complete!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You're officially a Conversation Starter!
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRestartClick}
                className="flex-1 rounded-full"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Restart
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onViewAll}
                className="flex-1 rounded-full"
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : currentChallenge ? (
          <div 
            className={cn(
              "flex-1 flex flex-col pr-14 mt-2",
              currentChallenge.suggestion && !isChallengeComplete && "cursor-pointer"
            )}
            onClick={() => {
              if (currentChallenge.suggestion && !isChallengeComplete) {
                setShowTip(!showTip);
              }
            }}
          >
            {/* Challenge name - prominent */}
            <h3 className="text-base font-bold text-foreground line-clamp-1">
              {currentChallenge.name}
            </h3>
            
            {/* Description or Tip - swap on tap - fixed height for ~3 lines of small text */}
            <div className="h-12 mt-1 overflow-hidden">
              <p className={cn(
                "text-xs text-muted-foreground line-clamp-3",
                showTip && "italic text-muted-foreground/70"
              )}>
                {showTip && currentChallenge.suggestion 
                  ? `"${currentChallenge.suggestion}"` 
                  : currentChallenge.description}
              </p>
            </div>

            {/* Tip toggle hint */}
            {currentChallenge.suggestion && !isChallengeComplete && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 mt-1">
                <Lightbulb size={10} />
                {showTip ? "Tap to show challenge" : "Tap to show tip"}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2 mt-auto pt-2">
              {isChallengeComplete ? (
                <div className="flex items-center justify-center gap-1 text-success text-sm font-medium h-9 flex-1">
                  <Check size={14} /> Completed
                </div>
              ) : (
                <Button 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompleteClick();
                  }}
                  className="flex-1 rounded-full"
                >
                  Complete
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAll();
                }}
                className="flex-1 rounded-full"
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : null}

        {/* Remi image */}
        <img 
          src={remiProud} 
          alt="Remi" 
          className="absolute bottom-2 right-2 w-12 h-auto object-contain opacity-90 pointer-events-none"
        />
      </Card>

      {/* Confirm Restart Dialog */}
      <AlertDialog open={showConfirmRestart} onOpenChange={setShowConfirmRestart}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Restart the challenge?</AlertDialogTitle>
            <AlertDialogDescription>
              Your challenge progress will be reset to Day 1. Your logged hellos in the Hellobook will be kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRestart} className="rounded-xl">
              Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
