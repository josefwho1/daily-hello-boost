import { useMemo } from "react";
import { ChevronLeft, Check, Circle, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { thirtyDayChallenge } from "@/data/thirtyDayChallenge";
import { cn } from "@/lib/utils";

interface ChallengeListViewProps {
  completedDays: number[];
  onComplete: (day: number, challengeName: string) => void;
  onUncomplete: (day: number) => void;
  onBack: () => void;
  onSelectChallenge?: (index: number) => void;
}

export const ChallengeListView = ({
  completedDays,
  onComplete,
  onUncomplete,
  onBack,
  onSelectChallenge,
}: ChallengeListViewProps) => {
  const completedCount = completedDays.length;
  const totalCount = thirtyDayChallenge.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const isDayComplete = (day: number) => completedDays.includes(day);

  // Sequential unlock: a challenge is unlocked if all previous ones are done
  const isUnlocked = (idx: number) => {
    if (idx === 0) return true;
    for (let i = 0; i < idx; i++) {
      if (!completedDays.includes(thirtyDayChallenge[i].day)) return false;
    }
    return true;
  };

  // "Next" challenge = first incomplete & unlocked
  const nextUnlockedIndex = useMemo(() => {
    for (let i = 0; i < thirtyDayChallenge.length; i++) {
      if (!completedDays.includes(thirtyDayChallenge[i].day) && isUnlocked(i)) return i;
    }
    return -1;
  }, [completedDays]);

  const handleComplete = (idx: number) => {
    const challenge = thirtyDayChallenge[idx];
    if (!isUnlocked(idx) || isDayComplete(challenge.day)) return;
    onComplete(challenge.day, challenge.name);
  };

  return (
    <div className="min-h-screen bg-background page-container">
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
          <div>
            <h1 className="text-xl font-bold text-foreground">7-Day Challenge</h1>
            <p className="text-xs text-muted-foreground">7 Days. 7 Strangers. 7 Hellos.</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Progress: {completedCount}/{totalCount}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Challenge list - always visible, no collapsible */}
        <div className="space-y-2">
          {thirtyDayChallenge.map((challenge, idx) => {
            const isComplete = isDayComplete(challenge.day);
            const unlocked = isUnlocked(idx);
            const isNext = idx === nextUnlockedIndex;
            // "Next" = show name, grey description with hint
            // Locked (not next, not unlocked) = hide name & description
            const isLockedFuture = !unlocked && !isNext;

            return (
              <Card
                key={challenge.day}
                className={cn(
                  "p-3 transition-colors",
                  isLockedFuture
                    ? "bg-muted/10 border-border/20 opacity-40"
                    : !unlocked  // isNext but not unlocked
                      ? "bg-muted/20 border-border/30 opacity-70"
                      : isComplete
                        ? "bg-success/5 border-success/30"
                        : "bg-card border-border hover:bg-muted/20"
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Status icon */}
                  <button
                    onClick={() => handleComplete(idx)}
                    disabled={!unlocked || isComplete}
                    className={cn(
                      "flex-shrink-0 transition-colors",
                      unlocked && !isComplete && "cursor-pointer hover:text-success"
                    )}
                    aria-label={isComplete ? "Completed" : !unlocked ? "Locked" : "Complete challenge"}
                  >
                    {isLockedFuture ? (
                      <Lock className="w-5 h-5 text-muted-foreground/20" />
                    ) : !unlocked ? (
                      <Lock className="w-5 h-5 text-muted-foreground/40" />
                    ) : isComplete ? (
                      <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-success" />
                      </div>
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground/50 hover:text-success" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {isLockedFuture ? (
                      // Fully locked: hide name and description
                      <div className="text-sm text-muted-foreground/30 font-medium">
                        Day {challenge.day} • Locked
                      </div>
                    ) : !unlocked ? (
                      // Next (locked but visible name): show name, grey description
                      <>
                        <div className="font-semibold text-sm text-muted-foreground">
                          {challenge.day}. {challenge.name}
                        </div>
                        <p className="text-xs text-muted-foreground/40 mt-0.5">
                          Complete the current challenge to unlock
                        </p>
                      </>
                    ) : (
                      // Unlocked or completed
                      <>
                        <div className={cn(
                          "font-semibold text-sm",
                          isComplete ? "text-success" : "text-foreground"
                        )}>
                          {challenge.day}. {challenge.name}
                        </div>
                        <p className={cn(
                          "text-xs text-muted-foreground mt-0.5 line-clamp-2",
                          isComplete && "line-through opacity-70"
                        )}>
                          {challenge.description}
                        </p>
                        {challenge.suggestion && !isComplete && (
                          <p className="text-xs text-muted-foreground/60 italic mt-1">
                            💡 {challenge.suggestion}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
