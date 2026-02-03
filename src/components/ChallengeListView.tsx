import { useState, useMemo } from "react";
import { ChevronLeft, Check, Circle, Lightbulb, Lock, CircleDot } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { thirtyDayChallenge, ThirtyDayChallenge } from "@/data/thirtyDayChallenge";
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

  const handleToggleComplete = (challenge: ThirtyDayChallenge) => {
    if (isDayLocked(challenge.day)) return;
    
    if (isDayComplete(challenge.day)) {
      onUncomplete(challenge.day);
    } else {
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

        {/* Challenge list */}
        <div className="space-y-3">
          {thirtyDayChallenge.map((challenge, index) => {
            const isComplete = isDayComplete(challenge.day);
            const isLocked = isDayLocked(challenge.day);
            const showTip = expandedTips.has(challenge.day);
            
            // Show unlock note after challenge 10 if tier 2 is locked
            const showTier2UnlockNote = challenge.day === 10 && unlockedTier < 2;
            // Show unlock note after challenge 20 if tier 3 is locked
            const showTier3UnlockNote = challenge.day === 20 && unlockedTier < 3 && unlockedTier >= 2;
            
            return (
              <div key={challenge.day}>
                <Card
                  className={cn(
                    "p-3 transition-colors",
                    isLocked 
                      ? "bg-muted/20 border-border/30 opacity-60"
                      : isComplete 
                        ? "bg-success/5 border-success/30" 
                        : "bg-card border-border hover:bg-muted/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Status icon / Complete button */}
                    <button
                      onClick={() => handleToggleComplete(challenge)}
                      disabled={isLocked}
                      className={cn(
                        "flex-shrink-0 transition-colors",
                        !isLocked && "cursor-pointer hover:text-success"
                      )}
                      aria-label={isComplete ? "Mark as incomplete" : isLocked ? "Locked" : "Mark as complete"}
                    >
                      {isLocked ? (
                        <Lock className="w-5 h-5 text-muted-foreground/30" />
                      ) : isComplete ? (
                        <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center hover:bg-success/30">
                          <Check className="w-3 h-3 text-success" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/50 hover:text-success" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Challenge number and name */}
                      <div 
                        className={cn(
                          "font-semibold text-sm",
                          isLocked ? "text-muted-foreground/50" : isComplete ? "text-success" : "text-foreground"
                        )}
                      >
                        {challenge.day}. {challenge.name}
                      </div>

                      {/* Show description/tip for non-locked challenges */}
                      {!isLocked && (
                        <div 
                          className={cn(
                            challenge.suggestion && "cursor-pointer"
                          )}
                          onClick={() => challenge.suggestion && toggleTip(challenge.day)}
                        >
                          <p className={cn(
                            "text-xs text-muted-foreground mt-0.5 line-clamp-2",
                            isComplete && "line-through opacity-70"
                          )}>
                            {showTip && challenge.suggestion 
                              ? challenge.suggestion
                              : challenge.description}
                          </p>
                          
                          {challenge.suggestion && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 mt-0.5">
                              <Lightbulb size={10} />
                              {showTip ? "Tap to show challenge" : "Tap to show tip"}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Select button - right side */}
                    {!isLocked && onSelectChallenge && (
                      <button
                        onClick={() => onSelectChallenge(challenge.day - 1)}
                        className="flex-shrink-0 p-2 rounded-full hover:bg-muted transition-colors"
                        aria-label="Select this challenge"
                      >
                        <CircleDot className="w-5 h-5 text-muted-foreground hover:text-primary" />
                      </button>
                    )}
                  </div>
                </Card>

                {/* Unlock note after tier boundaries */}
                {showTier2UnlockNote && (
                  <div className="mt-4 mb-2 p-3 bg-muted/50 rounded-xl text-center border border-dashed border-border">
                    <Lock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Complete {10 - completedCount} more challenge{10 - completedCount !== 1 ? 's' : ''} to unlock 11-20
                    </p>
                  </div>
                )}
                {showTier3UnlockNote && (
                  <div className="mt-4 mb-2 p-3 bg-muted/50 rounded-xl text-center border border-dashed border-border">
                    <Lock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Complete {20 - completedCount} more challenge{20 - completedCount !== 1 ? 's' : ''} to unlock 21-30
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};