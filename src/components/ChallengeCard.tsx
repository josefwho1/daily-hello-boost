import { Challenge } from "@/types/challenge";
import { Button } from "./ui/button";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChallengeCardProps {
  challenge: Challenge;
  isCompleted: boolean;
  isToday: boolean;
  isLocked: boolean;
  onComplete?: () => void;
  onClick?: () => void;
}

export const ChallengeCard = ({
  challenge,
  isCompleted,
  isToday,
  isLocked,
  onComplete,
  onClick
}: ChallengeCardProps) => {
  return (
    <div
      onClick={!isLocked ? onClick : undefined}
      className={cn(
        "bg-card rounded-2xl p-6 border-2 transition-all",
        isToday && !isCompleted && "border-primary shadow-lg",
        isCompleted && "border-success bg-success/5",
        !isToday && !isCompleted && !isLocked && "border-border hover:border-primary/50 cursor-pointer",
        isLocked && "border-border opacity-60"
      )}
    >
      <div className="flex flex-col items-center text-center">
        <div className={cn(
          "text-4xl mb-4",
          isLocked && "grayscale opacity-50"
        )}>
          {challenge.icon}
        </div>
        
        <div className="w-full">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xs font-semibold text-muted-foreground">DAY {challenge.day}</span>
            {isCompleted && (
              <div className="flex items-center gap-1 text-success">
                <Check size={16} />
                <span className="text-xs font-semibold">DONE</span>
              </div>
            )}
            {isLocked && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Lock size={14} />
              </div>
            )}
          </div>
          
          <h3 className={cn(
            "font-bold text-lg mb-2",
            isLocked ? "text-transparent bg-foreground/80 rounded select-none blur-sm" : "text-foreground"
          )}>
            {challenge.title}
          </h3>
          <p className={cn(
            "text-sm leading-relaxed",
            isLocked ? "text-transparent bg-muted-foreground/60 rounded select-none blur-sm" : "text-muted-foreground"
          )}>
            {challenge.description}
          </p>
          
          {!isLocked && challenge.tips && (
            <p className="text-sm leading-relaxed mt-2 text-muted-foreground/70 italic">
              {challenge.tips}
            </p>
          )}
          
          {isToday && !isCompleted && onComplete && (
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              className="mt-4 w-full rounded-full font-semibold"
            >
              Complete Challenge
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
