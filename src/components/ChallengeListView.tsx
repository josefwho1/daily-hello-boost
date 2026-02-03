import { useState, useMemo } from "react";
import { ChevronLeft, Check, Circle, Lightbulb, Lock, CircleDot, ChevronDown, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { thirtyDayChallenge, ThirtyDayChallenge, challengeSections } from "@/data/thirtyDayChallenge";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["Initiating", "Conversations", "Names & Plans"]));

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

  const toggleSection = (title: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(title)) {
      newOpen.delete(title);
    } else {
      newOpen.add(title);
    }
    setOpenSections(newOpen);
  };

  const handleToggleComplete = (challenge: ThirtyDayChallenge) => {
    if (isDayLocked(challenge.day)) return;

    // View All list should only allow completing (not un-completing).
    if (isDayComplete(challenge.day)) return;
    onComplete(challenge.day, challenge.name);
  };

  const getChallengesInRange = (range: [number, number]) => {
    return thirtyDayChallenge.filter(c => c.day >= range[0] && c.day <= range[1]);
  };

  const getSectionCompletedCount = (range: [number, number]) => {
    return completedDays.filter(d => d >= range[0] && d <= range[1]).length;
  };

  const isSectionLocked = (range: [number, number]) => {
    return isDayLocked(range[0]);
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
            <p className="text-xs text-muted-foreground">30 ways to connect</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Progress: {completedCount}/{totalCount}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Challenge sections */}
        <div className="space-y-4">
          {challengeSections.map((section) => {
            const challenges = getChallengesInRange(section.range);
            const sectionCompleted = getSectionCompletedCount(section.range);
            const sectionTotal = section.range[1] - section.range[0] + 1;
            const isLocked = isSectionLocked(section.range);
            const isOpen = openSections.has(section.title);

            return (
              <Collapsible
                key={section.title}
                open={isOpen}
                onOpenChange={() => toggleSection(section.title)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className={cn(
                    "flex items-center justify-between p-3 rounded-lg transition-colors",
                    isLocked ? "bg-muted/30" : "bg-muted/50 hover:bg-muted/70"
                  )}>
                    <div className="flex items-center gap-2">
                      {isLocked ? (
                        <Lock className="w-4 h-4 text-muted-foreground/50" />
                      ) : isOpen ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={cn(
                        "font-semibold text-sm",
                        isLocked ? "text-muted-foreground/50" : "text-foreground"
                      )}>
                        {section.range[0]}-{section.range[1]}: {section.title}
                      </span>
                    </div>
                    <span className={cn(
                      "text-xs",
                      isLocked ? "text-muted-foreground/50" : "text-muted-foreground"
                    )}>
                      {sectionCompleted}/{sectionTotal}
                    </span>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="space-y-2 mt-2">
                    {challenges.map((challenge) => {
                      const isComplete = isDayComplete(challenge.day);
                      const challengeLocked = isDayLocked(challenge.day);
                      const showTip = expandedTips.has(challenge.day);

                      return (
                        <Card
                          key={challenge.day}
                          className={cn(
                            "p-3 transition-colors",
                            challengeLocked 
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
                      disabled={challengeLocked || isComplete}
                              className={cn(
                                "flex-shrink-0 transition-colors",
                        !challengeLocked && !isComplete && "cursor-pointer hover:text-success"
                              )}
                      aria-label={isComplete ? "Completed" : challengeLocked ? "Locked" : "Mark as complete"}
                            >
                              {challengeLocked ? (
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
                                  challengeLocked ? "text-muted-foreground/50" : isComplete ? "text-success" : "text-foreground"
                                )}
                              >
                                {challenge.day}. {challenge.name}
                              </div>

                              {/* Show description/tip for non-locked challenges */}
                              {!challengeLocked && (
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
                            {!challengeLocked && onSelectChallenge && (
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
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>
    </div>
  );
};
