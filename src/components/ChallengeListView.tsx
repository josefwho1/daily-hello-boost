import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Circle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const toggleTip = (day: number) => {
    const newExpanded = new Set(expandedTips);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedTips(newExpanded);
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
            const showTip = expandedTips.has(challenge.day);
            
            return (
              <Card
                key={challenge.day}
                className={cn(
                  "p-4 transition-colors",
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
                    {/* Challenge name - prominent */}
                    <div 
                      className={cn(
                        "font-bold text-base",
                        isComplete ? "text-muted-foreground" : "text-foreground"
                      )}
                    >
                      Day {challenge.day}: {challenge.name}
                    </div>

                    {/* Show description/tip for incomplete challenges */}
                    {!isComplete && (
                      <div 
                        className={cn(
                          "cursor-pointer",
                          challenge.suggestion && "cursor-pointer"
                        )}
                        onClick={() => challenge.suggestion && toggleTip(challenge.day)}
                      >
                        <p className={cn(
                          "text-sm text-muted-foreground mt-1",
                          showTip && "italic text-muted-foreground/70"
                        )}>
                          {showTip && challenge.suggestion 
                            ? `"${challenge.suggestion}"` 
                            : challenge.description}
                        </p>
                        
                        {challenge.suggestion && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 mt-1">
                            <Lightbulb size={10} />
                            {showTip ? "Tap to show challenge" : "Tap to show tip"}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Complete button for incomplete challenges */}
                    {!isComplete && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onComplete(challenge.day, challenge.name);
                          }}
                          className="rounded-full"
                        >
                          Complete
                        </Button>
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
