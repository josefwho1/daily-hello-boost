import { useState } from "react";
import { ChevronLeft, Check, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { thirtyHellosChallenge, thirtyHellosSections } from "@/data/thirtyHellosChallenge";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface ThirtyHellosListViewProps {
  completedDays: number[];
  onComplete: (day: number, challengeName: string) => void;
  onBack: () => void;
}

export const ThirtyHellosListView = ({
  completedDays,
  onComplete,
  onBack,
}: ThirtyHellosListViewProps) => {
  const completedCount = completedDays.length;
  const totalCount = thirtyHellosChallenge.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const isDayComplete = (day: number) => completedDays.includes(day);

  // All challenges visible from day one - no sequential locking
  const [openSections, setOpenSections] = useState<string[]>(
    thirtyHellosSections.map(s => s.section)
  );

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
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
            <h1 className="text-xl font-bold text-foreground">30 Hellos</h1>
            <p className="text-xs text-muted-foreground">30 unique ways to connect</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Progress: {completedCount}/{totalCount}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {thirtyHellosSections.map((section) => {
            const sectionChallenges = thirtyHellosChallenge.filter(
              c => c.day >= section.range[0] && c.day <= section.range[1]
            );
            const sectionCompleted = sectionChallenges.filter(c => isDayComplete(c.day)).length;
            const isOpen = openSections.includes(section.section);

            return (
              <Collapsible
                key={section.section}
                open={isOpen}
                onOpenChange={() => toggleSection(section.section)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/40">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{section.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {sectionCompleted}/{sectionChallenges.length}
                      </span>
                    </div>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180"
                    )} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2 mt-2">
                    {sectionChallenges.map((challenge) => {
                      const isComplete = isDayComplete(challenge.day);

                      return (
                        <Card
                          key={challenge.day}
                          className={cn(
                            "p-3 transition-colors",
                            isComplete
                              ? "bg-success/5 border-success/30"
                              : "bg-card border-border hover:bg-muted/20"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => {
                                if (!isComplete) onComplete(challenge.day, challenge.name);
                              }}
                              disabled={isComplete}
                              className={cn(
                                "flex-shrink-0 mt-0.5 transition-colors",
                                !isComplete && "cursor-pointer hover:text-success"
                              )}
                              aria-label={isComplete ? "Completed" : "Complete challenge"}
                            >
                              {isComplete ? (
                                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                                  <Check className="w-3 h-3 text-success" />
                                </div>
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground/50 hover:text-success" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
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
                                <p className="text-xs text-muted-foreground/60 italic mt-1 line-clamp-2">
                                  💡 {challenge.suggestion}
                                </p>
                              )}
                            </div>
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
