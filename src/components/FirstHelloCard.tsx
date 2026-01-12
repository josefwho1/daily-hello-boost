import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { FirstHello } from "@/data/firstHellos";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface FirstHelloCardProps {
  challenge: FirstHello;
  isCompleted: boolean;
  isAvailable: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  onComplete: () => void;
}

export const FirstHelloCard = ({
  challenge,
  isCompleted,
  isAvailable,
  isLocked,
  isCurrent,
  onComplete
}: FirstHelloCardProps) => {
  const [isOpen, setIsOpen] = useState(isCurrent && !isCompleted);

  return (
    <Card className={cn(
      "p-4 transition-all",
      isCompleted && "bg-success/10 border-success/30",
      isLocked && "opacity-50 bg-muted/30",
      isCurrent && !isCompleted && "border-primary border-2 shadow-md"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
          isCompleted 
            ? "bg-success text-success-foreground" 
            : isLocked
            ? "bg-muted text-muted-foreground"
            : "bg-primary/20 text-primary"
        )}>
          {isCompleted ? (
            <Check className="w-5 h-5" />
          ) : isLocked ? (
            <Lock className="w-4 h-4" />
          ) : (
            challenge.id
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-bold text-lg text-foreground",
            isCompleted && "line-through text-muted-foreground",
            isLocked && "text-muted-foreground"
          )}>
            {challenge.title}
          </h3>
          {isCurrent && !isCompleted && (
            <p className="text-xs text-primary font-medium">
              Current challenge
            </p>
          )}
          {isLocked && (
            <p className="text-xs text-muted-foreground">
              Complete the previous challenge to unlock
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <span className="text-sm font-medium text-success flex items-center gap-1">
              <Check className="w-4 h-4" />
              Done!
            </span>
          ) : isLocked ? (
            <Lock className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Button
              size="sm"
              disabled={!isAvailable}
              onClick={onComplete}
            >
              Complete
            </Button>
          )}
          
          {!isLocked && (
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

      {!isLocked && (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent className="mt-3">
            <div className="ml-13 pl-1 border-l-2 border-muted pl-4 space-y-2">
              <p className="text-sm text-muted-foreground">{challenge.description}</p>
              {isAvailable && !isCompleted && (
                <>
                  <p className="text-xs italic text-suggestion">💡 {challenge.examples.join(' • ')}</p>
                  {challenge.tip && (
                    <p className="text-xs text-muted-foreground/80">📝 {challenge.tip}</p>
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
