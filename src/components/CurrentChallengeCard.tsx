import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, ChevronRight, Check, RotateCcw } from "lucide-react";
import { ThirtyDayChallenge } from "@/data/thirtyDayChallenge";
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
  onMarkComplete: (day: number) => void;
  onViewAll: () => void;
  onRestart: () => void;
}

export const CurrentChallengeCard = ({
  completedDays,
  nextChallenge,
  totalCount,
  isComplete,
  onMarkComplete,
  onViewAll,
  onRestart,
}: CurrentChallengeCardProps) => {
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const [showConfirmRestart, setShowConfirmRestart] = useState(false);
  const [pendingDay, setPendingDay] = useState<number | null>(null);

  const completedCount = completedDays.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleMarkCompleteClick = () => {
    if (nextChallenge) {
      setPendingDay(nextChallenge.day);
      setShowConfirmComplete(true);
    }
  };

  const handleConfirmComplete = () => {
    if (pendingDay !== null) {
      onMarkComplete(pendingDay);
      setPendingDay(null);
    }
    setShowConfirmComplete(false);
  };

  const handleRestartClick = () => {
    setShowConfirmRestart(true);
  };

  const handleConfirmRestart = () => {
    onRestart();
    setShowConfirmRestart(false);
  };

  return (
    <>
      <Card className="p-4 rounded-xl bg-card border-border/50 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground text-base">30-Day Hello Challenge</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Progress: {completedCount}/{totalCount}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Content */}
        {isComplete ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-success">
              <Check className="w-5 h-5" />
              <span className="font-semibold">🎉 Challenge Complete!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You've completed all 30 challenges. You're officially a Conversation Starter!
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
        ) : nextChallenge ? (
          <div className="space-y-3 pr-14">
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <span>→</span>
                <span>Next: Day {nextChallenge.day} - {nextChallenge.name}</span>
              </div>
              <p className="text-sm text-foreground">
                {nextChallenge.description}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleMarkCompleteClick}
                className="flex-1 rounded-full"
              >
                Mark Complete
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
        ) : null}

        {/* Remi image */}
        <img 
          src={remiProud} 
          alt="Remi" 
          className="absolute bottom-2 right-2 w-12 h-auto object-contain opacity-90 pointer-events-none"
        />
      </Card>

      {/* Confirm Complete Dialog */}
      <AlertDialog open={showConfirmComplete} onOpenChange={setShowConfirmComplete}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Complete this challenge?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="font-medium text-foreground block">
                Day {nextChallenge?.day}: {nextChallenge?.name}
              </span>
              <span className="block">{nextChallenge?.description}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmComplete} className="rounded-xl">
              Yes, I Did It!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
