import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { OnboardingChallenge } from "@/data/onboardingChallenges";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface OnboardingChallengeCardProps {
  challenge: OnboardingChallenge;
  isCompleted: boolean;
  isAvailable: boolean;
  isLocked: boolean;
  isTodaysChallenge: boolean;
  isNextDay?: boolean;
  hasCompletedToday?: boolean;
  onComplete: () => void;
}

export const OnboardingChallengeCard = ({
  challenge,
  isCompleted,
  isAvailable,
  isLocked,
  isTodaysChallenge,
  isNextDay = false,
  hasCompletedToday = false,
  onComplete
}: OnboardingChallengeCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const isFutureDay = isLocked && !isNextDay;
  const showNextDayTeaser = isNextDay && isLocked;

  return (
    <Card className={cn(
      "p-4 transition-all",
      isCompleted && "bg-success/10 border-success/30",
      isLocked && !showNextDayTeaser && "opacity-50 bg-muted/30",
      showNextDayTeaser && "bg-muted/20 border-muted",
      isTodaysChallenge && !isCompleted && "border-primary border-2 shadow-md"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
          isCompleted 
            ? "bg-success text-success-foreground" 
            : isFutureDay
            ? "bg-muted/50 text-muted-foreground/50"
            : isLocked
            ? "bg-muted text-muted-foreground"
            : "bg-primary/20 text-primary"
        )}>
          {isCompleted ? (
            <Check className="w-5 h-5" />
          ) : isFutureDay ? (
            <span className="text-muted-foreground/50">{challenge.id}</span>
          ) : isLocked ? (
            <Lock className="w-4 h-4" />
          ) : (
            challenge.id
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {isFutureDay ? (
            <>
              <h3 className="font-bold text-lg text-muted-foreground/30 blur-[3px] select-none">
                {challenge.title}
              </h3>
              <p className="text-sm text-muted-foreground/20 blur-[3px] select-none">
                {challenge.description}
              </p>
            </>
          ) : showNextDayTeaser ? (
            <>
              <h3 className="font-bold text-lg text-muted-foreground">
                {challenge.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {hasCompletedToday 
                  ? "Unlocks at midnight" 
                  : "Complete today's challenge to unlock"}
              </p>
            </>
          ) : (
            <>
              <h3 className={cn(
                "font-bold text-lg text-foreground",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {challenge.title}
              </h3>
              {isLocked && (
                <p className="text-xs text-muted-foreground">
                  Unlocks tomorrow at midnight
                </p>
              )}
              {isTodaysChallenge && !isCompleted && !isLocked && (
                <p className="text-xs text-primary font-medium">
                  Today's challenge!
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <span className="text-sm font-medium text-success flex items-center gap-1">
              <Check className="w-4 h-4" />
              Done!
            </span>
          ) : isFutureDay ? (
            <span className="text-muted-foreground/30">{challenge.id}</span>
          ) : isLocked ? (
            <Lock className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Button
              size="sm"
              disabled={!isAvailable}
              onClick={onComplete}
              className={cn(!isAvailable && "opacity-50")}
            >
              Complete
            </Button>
          )}
          
          {!isLocked && !isFutureDay && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
        </div>
      </div>

      {!isLocked && !isFutureDay && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent className="mt-3 ml-13 pl-13">
            <div className="ml-13 pl-1 border-l-2 border-muted pl-4 space-y-2">
              <p className="text-sm text-muted-foreground">{challenge.description}</p>
              {isAvailable && !isCompleted && (
                <>
                  <p className="text-xs italic text-suggestion">💡 {challenge.suggestion}</p>
                  {challenge.tips && (
                    <p className="text-xs text-muted-foreground/80">📝 {challenge.tips}</p>
                  )}
                </>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </Card>
  );
};
