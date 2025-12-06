import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Lock } from "lucide-react";
import { OnboardingChallenge } from "@/data/onboardingChallenges";
import { cn } from "@/lib/utils";

interface OnboardingChallengeCardProps {
  challenge: OnboardingChallenge;
  isCompleted: boolean;
  isAvailable: boolean;
  onComplete: () => void;
}

export const OnboardingChallengeCard = ({
  challenge,
  isCompleted,
  isAvailable,
  onComplete
}: OnboardingChallengeCardProps) => {
  return (
    <Card className={cn(
      "p-4 transition-all",
      isCompleted && "bg-success/10 border-success/30",
      !isAvailable && !isCompleted && "opacity-60"
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
          isCompleted 
            ? "bg-success text-success-foreground" 
            : "bg-primary/20 text-primary"
        )}>
          {isCompleted ? <Check className="w-5 h-5" /> : challenge.id}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{challenge.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
          
          {isAvailable && !isCompleted && (
            <p className="text-xs text-primary mt-2 italic">💡 {challenge.tip}</p>
          )}
        </div>

        {!isCompleted && (
          <Button
            size="sm"
            disabled={!isAvailable}
            onClick={onComplete}
            className={cn(!isAvailable && "opacity-50")}
          >
            {isAvailable ? "Complete" : <Lock className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </Card>
  );
};
