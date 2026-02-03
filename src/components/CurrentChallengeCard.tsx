import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, ChevronRight, ChevronLeft, Check, RotateCcw, Lightbulb, Lock } from "lucide-react";
import { thirtyDayChallenge, ThirtyDayChallenge } from "@/data/thirtyDayChallenge";
import { cn } from "@/lib/utils";
import remiProud from "@/assets/remi-proud.webp";
import remiHoldingOrb from "@/assets/remi-holding-orb.webp";
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
  const [showTip, setShowTip] = useState(false);

  // Find current challenge index and allow navigation
  const completedCount = completedDays.length;

  // Progressive unlock logic - same as ChallengeListView
  const isDayLocked = (day: number) => {
    if (day <= 10) return false;
    if (day <= 20) return completedCount < 10;
    return completedCount < 20;
  };

  // Get unlock message for locked challenges
  const getUnlockMessage = (day: number) => {
    if (day <= 10) return null;
    if (day <= 20) return `Complete ${10 - completedCount} more to unlock`;
    return `Complete ${20 - completedCount} more to unlock`;
  };
  const getCurrentIndex = () => {
    if (!nextChallenge) return Math.min(thirtyDayChallenge.length - 1, 29);
    const idx = thirtyDayChallenge.findIndex(c => c.day === nextChallenge.day);
    return idx;
  };
  const [currentIndex, setCurrentIndex] = useState(getCurrentIndex);

  // If user selected a challenge from the "View all" list, jump to it once.
  useEffect(() => {
    const selected = (location.state as any)?.selectedChallengeIndex;
    if (typeof selected !== "number") return;
    const clamped = Math.max(0, Math.min(selected, thirtyDayChallenge.length - 1));
    setCurrentIndex(clamped);
    setShowTip(false);

    // When returning from View All → Select, ensure the Home screen is positioned
    // so the challenge card is visible/centered for the user.
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
    requestAnimationFrame(() => window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    }));

    // Clear the navigation state so it doesn't keep re-applying.
    navigate(location.pathname, {
      replace: true,
      state: {}
    });
  }, [location.state, location.pathname, navigate]);
  const currentChallenge = thirtyDayChallenge[currentIndex];
  const isChallengeComplete = completedDays.includes(currentChallenge?.day || 0);
  const isLocked = isDayLocked(currentChallenge?.day || 0);
  const unlockMessage = getUnlockMessage(currentChallenge?.day || 0);
  const progressPercent = totalCount > 0 ? completedCount / totalCount * 100 : 0;

  // Allow navigation through all 30 challenges
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
    if (currentChallenge && !isChallengeComplete) {
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
  return <>
      <Card className="p-4 rounded-xl bg-card border-border/50 relative overflow-hidden h-[250px] flex flex-col py-[8px]">
        {/* Header */}
        <div className="flex items-center justify-between mx-0 py-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="font-bold text-foreground text-base">The 30 Hellos</span>
            </div>
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
            <span className="text-muted-foreground">
              {currentChallenge?.day} of {totalCount} • {completedCount} completed
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Content */}
        {isComplete && currentIndex === thirtyDayChallenge.length - 1 ? <div className="flex-1 flex flex-col justify-center space-y-3 pr-14">
            <div className="flex items-center gap-2 text-success">
              <Check className="w-5 h-5" />
              <span className="font-semibold">🎉 Challenge Complete!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You're officially a Conversation Starter!
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRestartClick} className="flex-1 rounded-full">
                <RotateCcw className="w-4 h-4 mr-1" />
                Restart
              </Button>
              <Button variant="ghost" size="sm" onClick={onViewAll} className="flex-1 rounded-full">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div> : currentChallenge ? <div className={cn("flex-1 flex flex-col pr-14 mt-2", !isLocked && currentChallenge.suggestion && "cursor-pointer")} onClick={() => {
        if (!isLocked && currentChallenge.suggestion) {
          setShowTip(!showTip);
        }
      }}>
            {/* Challenge name */}
            <h3 className={cn("text-base font-bold line-clamp-1", isLocked ? "text-muted-foreground/50" : "text-foreground")}>
              {currentChallenge.name}
            </h3>
            
            {/* Fixed height content area - always same height regardless of content */}
            <div className="h-[68px] mt-1 overflow-hidden">
              {isLocked ? <div className="flex items-center gap-2 text-muted-foreground/50">
                  <Lock size={14} />
                  <span className="text-xs">{unlockMessage}</span>
                </div> : <>
                  <p className={cn("text-xs text-muted-foreground line-clamp-3", showTip && "italic text-muted-foreground/70")}>
                    {showTip && currentChallenge.suggestion ? `"${currentChallenge.suggestion}"` : currentChallenge.description}
                  </p>
                  {/* Tip toggle hint - always reserve space */}
                  <div className="h-4 flex items-center">
                    {currentChallenge.suggestion && <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                        <Lightbulb size={10} />
                        {showTip ? "Tap to show challenge" : "Tap to show tip"}
                      </div>}
                  </div>
                </>}
            </div>

            {/* Buttons - fixed layout with justify-between to prevent movement */}
            <div className="flex items-center justify-between mt-auto pt-2">
              {isLocked ? <button disabled className="h-9 px-4 rounded-full text-sm font-medium border border-border/30 text-muted-foreground/40 flex items-center justify-center gap-1 min-w-[140px] cursor-not-allowed">
                  <Lock size={14} />
                  Locked
                </button> : isChallengeComplete ?
          // Already completed
          <div className="h-9 px-4 rounded-full text-sm font-medium bg-success/10 text-success border border-success/50 flex items-center justify-center gap-1 min-w-[140px]">
                  <Check size={14} />
                  Completed
                </div> :
          // Not completed - show mark as complete button
          <button onClick={e => {
            e.stopPropagation();
            handleCompleteClick();
          }} className="h-9 px-4 rounded-full text-sm font-medium border border-border/50 text-muted-foreground hover:bg-success/10 hover:text-success hover:border-success/50 transition-colors flex items-center justify-center gap-1 min-w-[140px]">
                  Mark as complete
                </button>}
              <Button variant="ghost" size="sm" onClick={e => {
            e.stopPropagation();
            onViewAll();
          }} className="rounded-full">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div> : null}

        {/* Remi image - changes based on completion state */}
        <img src={isChallengeComplete ? remiProud : remiHoldingOrb} alt="Remi" className="absolute bottom-2 right-2 w-12 h-auto object-contain opacity-90 pointer-events-none" />
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