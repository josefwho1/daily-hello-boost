import { useState } from "react";
import { ChevronLeft, Check, Circle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { thirtyDayChallenge, ThirtyDayChallenge } from "@/data/thirtyDayChallenge";
import { cn } from "@/lib/utils";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChallengeListViewProps {
  completedDays: number[];
  onMarkComplete: (day: number) => void;
  onBack: () => void;
}

export const ChallengeListView = ({
  completedDays,
  onMarkComplete,
  onBack,
}: ChallengeListViewProps) => {
  const [confirmDay, setConfirmDay] = useState<number | null>(null);
  const [detailChallenge, setDetailChallenge] = useState<ThirtyDayChallenge | null>(null);

  const completedCount = completedDays.length;
  const totalCount = thirtyDayChallenge.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const isDayComplete = (day: number) => completedDays.includes(day);

  const handleMarkComplete = (day: number) => {
    setConfirmDay(day);
  };

  const handleConfirm = () => {
    if (confirmDay !== null) {
      onMarkComplete(confirmDay);
      setConfirmDay(null);
    }
  };

  const confirmChallenge = thirtyDayChallenge.find(c => c.day === confirmDay);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">30-Day Hello Challenge</h1>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Progress: {completedCount}/{totalCount}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Challenge list */}
        <div className="space-y-3">
          {thirtyDayChallenge.map((challenge) => {
            const isComplete = isDayComplete(challenge.day);
            
            return (
              <div
                key={challenge.day}
                className={cn(
                  "border rounded-xl p-4 transition-colors",
                  isComplete 
                    ? "bg-muted/30 border-border/50" 
                    : "bg-card border-border hover:bg-muted/20"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Status icon */}
                  <div className="mt-0.5">
                    {isComplete ? (
                      <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-success" />
                      </div>
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div 
                      className={cn(
                        "font-medium",
                        isComplete ? "text-muted-foreground" : "text-foreground"
                      )}
                    >
                      Day {challenge.day}: {challenge.name}
                    </div>

                    {/* Show description for incomplete challenges */}
                    {!isComplete && (
                      <>
                        <p className="text-sm text-muted-foreground mt-1">
                          {challenge.description}
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleMarkComplete(challenge.day)}
                            className="rounded-full"
                          >
                            Mark Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailChallenge(challenge)}
                            className="rounded-full text-muted-foreground"
                          >
                            <Lightbulb className="w-4 h-4 mr-1" />
                            Tip
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm Complete Dialog */}
      <AlertDialog open={confirmDay !== null} onOpenChange={(open) => !open && setConfirmDay(null)}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Complete this challenge?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="font-medium text-foreground block">
                Day {confirmChallenge?.day}: {confirmChallenge?.name}
              </span>
              <span className="block">{confirmChallenge?.description}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="rounded-xl">
              Yes, I Did It!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Challenge Detail Dialog */}
      <Dialog open={detailChallenge !== null} onOpenChange={(open) => !open && setDetailChallenge(null)}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm text-muted-foreground">
              Day {detailChallenge?.day} of 30
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">{detailChallenge?.name}</h2>
            <p className="text-foreground">{detailChallenge?.description}</p>
            
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                <Lightbulb className="w-4 h-4" />
                <span>Suggestion:</span>
              </div>
              <p className="text-sm text-foreground italic">
                {detailChallenge?.suggestion}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => {
                  if (detailChallenge) {
                    handleMarkComplete(detailChallenge.day);
                    setDetailChallenge(null);
                  }
                }}
                className="flex-1 rounded-full"
              >
                Mark Complete
              </Button>
              <Button
                variant="outline"
                onClick={() => setDetailChallenge(null)}
                className="rounded-full"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
