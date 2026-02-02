import { useState, useMemo } from "react";
import { ChevronLeft, Check, Circle, Lightbulb, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { thirtyDayChallenge, ThirtyDayChallenge } from "@/data/thirtyDayChallenge";
import { cn } from "@/lib/utils";

interface ChallengeListViewProps {
  completedDays: number[];
  onComplete: (day: number, challengeName: string) => void;
  onBack: () => void;
}

export const ChallengeListView = ({
  completedDays,
  onComplete,
  onBack,
}: ChallengeListViewProps) => {
  const [expandedTips, setExpandedTips] = useState<Set<number>>(new Set());

  const completedCount = completedDays.length;
  const totalCount = thirtyDayChallenge.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const isDayComplete = (day: number) => completedDays.includes(day);

  // Progressive unlock logic
  const unlockedTier = useMemo(() => {
    if (completedCount >= 20) return 3; // All 30 unlocked
    if (completedCount >= 10) return 2; // 1-20 unlocked
    return 1; // 1-10 unlocked
  }, [completedCount]);

  const isDayLocked = (day: number) => {
    if (day <= 10) return false;
    if (day <= 20) return unlockedTier < 2;
    return unlockedTier < 3;
  };

  const toggleTip = (day: number) => {
    const newExpanded = new Set(expandedTips);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedTips(newExpanded);
  };

  const handleMarkComplete = (challenge: ThirtyDayChallenge) => {
    if (!isDayComplete(challenge.day) && !isDayLocked(challenge.day)) {
      onComplete(challenge.day, challenge.name);
    }
  };

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
          <div>
            <h1 className="text-xl font-bold text-foreground">The 30 Hellos</h1>
            <p className="text-xs text-muted-foreground">30 simple ways to start a conversation.</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Progress: {completedCount}/{totalCount}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Tier unlock messages */}
        {unlockedTier < 3 && (
          <div className="mb-4 p-3 bg-muted/50 rounded-xl text-center">
            <p className="text-xs text-muted-foreground">
              {unlockedTier === 1 
                ? `Complete ${10 - completedCount} more to unlock challenges 11-20`
                : `Complete ${20 - completedCount} more to unlock challenges 21-30`
              }
            </p>
          </div>
        )}

        {/* Challenge list */}
        <div className="space-y-3">
          {thirtyDayChallenge.map((challenge) => {
            const isComplete = isDayComplete(challenge.day);
            const isLocked = isDayLocked(challenge.day);
            const showTip = expandedTips.has(challenge.day);
            
            return (
              <Card
                key={challenge.day}
                className={cn(
                  "p-4 transition-colors",
                  isLocked 
                    ? "bg-muted/20 border-border/30 opacity-60"
                    : isComplete 
                      ? "bg-success/5 border-success/30" 
                      : "bg-card border-border hover:bg-muted/20"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Status icon / Complete button */}
                  <button
                    onClick={() => handleMarkComplete(challenge)}
                    disabled={isComplete || isLocked}
                    className={cn(
                      "mt-0.5 flex-shrink-0 transition-colors",
                      !isComplete && !isLocked && "cursor-pointer hover:text-success"
                    )}
                    aria-label={isComplete ? "Completed" : isLocked ? "Locked" : "Mark as complete"}
                  >
                    {isLocked ? (
                      <Lock className="w-6 h-6 text-muted-foreground/30" />
                    ) : isComplete ? (
                      <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-success" />
                      </div>
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground/50 hover:text-success" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Challenge number and name */}
                    <div 
                      className={cn(
                        "font-bold text-base",
                        isLocked ? "text-muted-foreground/50" : isComplete ? "text-success" : "text-foreground"
                      )}
                    >
                      {challenge.day}. {challenge.name}
                    </div>

                    {/* Show description/tip for non-locked challenges */}
                    {!isLocked && (
                      <div 
                        className={cn(
                          challenge.suggestion && !isComplete && "cursor-pointer"
                        )}
                        onClick={() => challenge.suggestion && !isComplete && toggleTip(challenge.day)}
                      >
                        <p className={cn(
                          "text-sm text-muted-foreground mt-1",
                          isComplete && "line-through opacity-70"
                        )}>
                          {showTip && challenge.suggestion 
                            ? challenge.suggestion
                            : challenge.description}
                        </p>
                        
                        {challenge.suggestion && !isComplete && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 mt-1">
                            <Lightbulb size={10} />
                            {showTip ? "Tap to show challenge" : "Tap to show tip"}
                          </div>
                        )}
                      </div>
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
