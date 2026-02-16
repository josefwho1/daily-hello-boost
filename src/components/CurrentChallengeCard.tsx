import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, ChevronRight, ChevronLeft, Check, RotateCcw, Lock } from "lucide-react";
import { thirtyDayChallenge, ThirtyDayChallenge } from "@/data/thirtyDayChallenge";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CurrentChallengeCardProps {
  completedDays: number[];
  nextChallenge: ThirtyDayChallenge | null;
  totalCount: number;
  isComplete: boolean;
  onComplete: (day: number, challengeName: string) => void;
  onUncomplete: (day: number) => void;
  onViewAll: () => void;
  onRestart: () => void;
}

export const CurrentChallengeCard = ({
  completedDays,
  nextChallenge,
  totalCount,
  isComplete,
  onComplete,
  onUncomplete,
  onViewAll,
  onRestart
}: CurrentChallengeCardProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfirmRestart, setShowConfirmRestart] = useState(false);
  const completedCount = completedDays.length;

  // Sequential unlock logic
  const isUnlocked = (idx: number) => {
    if (idx === 0) return true;
    for (let i = 0; i < idx; i++) {
      if (!completedDays.includes(thirtyDayChallenge[i].day)) return false;
    }
    return true;
  };

  const isDayComplete = (day: number) => completedDays.includes(day);

  const getCurrentIndex = () => {
    if (!nextChallenge) return Math.min(thirtyDayChallenge.length - 1, 6);
    const idx = thirtyDayChallenge.findIndex(c => c.day === nextChallenge.day);
    return idx;
  };
  const [currentIndex, setCurrentIndex] = useState(getCurrentIndex);

  useEffect(() => {
    const selected = (location.state as any)?.selectedChallengeIndex;
    if (typeof selected !== "number") return;
    const clamped = Math.max(0, Math.min(selected, thirtyDayChallenge.length - 1));
    setCurrentIndex(clamped);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  const currentChallenge = thirtyDayChallenge[currentIndex];
  const isChallengeComplete = isDayComplete(currentChallenge?.day || 0);
  const challengeUnlocked = isUnlocked(currentIndex);
  const progressPercent = totalCount > 0 ? completedCount / totalCount * 100 : 0;

  // Visibility: is this the "next" locked challenge (name visible but desc hidden)?
  const isNextLocked = !challengeUnlocked && currentIndex > 0 && isUnlocked(currentIndex - 1);
  // Is this a future locked challenge (fully hidden)?
  const isLockedFuture = !challengeUnlocked && !isNextLocked;

  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < thirtyDayChallenge.length - 1;
  const goLeft = () => { if (canGoLeft) setCurrentIndex(currentIndex - 1); };
  const goRight = () => { if (canGoRight) setCurrentIndex(currentIndex + 1); };

  const handleCompleteClick = () => {
    if (currentChallenge && !isChallengeComplete && challengeUnlocked) {
      onComplete(currentChallenge.day, currentChallenge.name);
    }
  };

  const handleConfirmRestart = () => {
    onRestart();
    setShowConfirmRestart(false);
    setCurrentIndex(0);
  };

  // Find the name of the challenge that must be completed to unlock this one
  const getBlockingChallengeName = () => {
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (!completedDays.includes(thirtyDayChallenge[i].day)) {
        return thirtyDayChallenge[i].name;
      }
    }
    return null;
  };

  return <>
    <Card className="p-4 rounded-xl bg-card border-border/50 relative overflow-hidden flex flex-col min-h-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary flex-shrink-0" />
          <span className="font-bold text-foreground text-lg">7-Day Challenge</span>
        </div>
        
        {/* Navigation arrows */}
        <div className="flex items-center gap-1">
          <button onClick={goLeft} disabled={!canGoLeft} aria-label="Previous challenge" className={cn("h-10 w-12 flex items-center justify-center rounded-lg transition-colors", canGoLeft ? "text-muted-foreground hover:text-foreground hover:bg-muted" : "text-muted-foreground/30 pointer-events-none")}>
            <ChevronLeft size={22} />
          </button>
          <button onClick={goRight} disabled={!canGoRight} aria-label="Next challenge" className={cn("h-10 w-12 flex items-center justify-center rounded-lg transition-colors", canGoRight ? "text-muted-foreground hover:text-foreground hover:bg-muted" : "text-muted-foreground/30 pointer-events-none")}>
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-muted-foreground font-semibold text-sm">
            Day {currentChallenge?.day} of {totalCount} · {completedCount} completed
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Content */}
      {isComplete && currentIndex === thirtyDayChallenge.length - 1 ? (
        <div className="flex-1 flex flex-col justify-center space-y-3 mt-3">
          <div className="flex items-center gap-2 text-success">
            <Check className="w-5 h-5" />
            <span className="font-semibold">🎉 Challenge Complete!</span>
          </div>
          <p className="text-sm text-muted-foreground">
            You're officially a Conversation Starter!
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowConfirmRestart(true)} className="flex-1 rounded-full">
              <RotateCcw className="w-4 h-4 mr-1" />
              Restart
            </Button>
            <Button variant="ghost" size="sm" onClick={onViewAll} className="flex-1 rounded-full">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      ) : currentChallenge ? (
        <div className="flex-1 flex flex-col mt-3">
          {/* Challenge name - fixed height */}
          <div className="h-6 flex items-center">
            <h3 className={cn(
              "text-base font-bold line-clamp-1",
              isLockedFuture ? "text-muted-foreground/30" : 
              isNextLocked ? "text-muted-foreground" :
              isChallengeComplete ? "text-success" : "text-foreground"
            )}>
              {isLockedFuture ? `Day ${currentChallenge.day} · Locked` : currentChallenge.name}
            </h3>
          </div>
          
          {/* Description area - fixed height for 2 lines */}
          <div className="h-[2.75rem] mt-1">
            {isLockedFuture ? (
              <p className="text-xs text-muted-foreground/30 line-clamp-2">
                Complete previous challenges to unlock
              </p>
            ) : isNextLocked ? (
              <p className="text-xs text-muted-foreground/50 line-clamp-2">
                Complete "{getBlockingChallengeName()}" to unlock
              </p>
            ) : (
              <p className={cn(
                "text-sm text-muted-foreground line-clamp-2",
                isChallengeComplete && "line-through opacity-70"
              )}>
                {currentChallenge.description}
              </p>
            )}
          </div>

          {/* Suggestion area - fixed height for 2 lines */}
          <div className="h-[2.25rem] mt-1">
            {challengeUnlocked && !isChallengeComplete && currentChallenge.suggestion && (
              <p className="text-xs text-muted-foreground/70 italic line-clamp-2">
                💡 {currentChallenge.suggestion}
              </p>
            )}
          </div>

          {/* Buttons - pushed to bottom */}
          <div className="mt-auto pt-2 flex items-center justify-between gap-2">
            {challengeUnlocked && !isChallengeComplete ? (
              <button 
                onClick={handleCompleteClick}
                className="h-10 px-5 rounded-full font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors flex items-center justify-center gap-1.5 flex-1 text-sm shadow-md"
                data-compact
              >
                Complete Challenge
              </button>
            ) : isChallengeComplete ? (
              <div className="h-10 px-5 rounded-full text-sm font-medium bg-success/10 text-success border border-success/50 flex items-center justify-center gap-1.5 flex-1" data-compact>
                <Check size={16} />
                Completed
              </div>
            ) : (
              <div className="h-10 px-5 rounded-full text-sm font-medium bg-muted/30 text-muted-foreground border border-border/50 flex items-center justify-center gap-1.5 flex-1" data-compact>
                <Lock size={12} /> Locked
              </div>
            )}
            <button 
              onClick={onViewAll}
              className="h-10 px-4 rounded-full hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground text-xs text-center"
              data-compact
            >
              <span className="flex items-center justify-center gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      ) : null}
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
  </>;
};
