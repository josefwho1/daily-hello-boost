import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import remiMascot from "@/assets/remi-waving.webp";

interface RemisWeeklyChallengeCardProps {
  title: string;
  description: string;
  isCompleted: boolean;
  orbsFull: boolean;
  onComplete: () => void;
}

export const RemisWeeklyChallengeCard = ({ 
  title, 
  description, 
  isCompleted,
  orbsFull,
  onComplete 
}: RemisWeeklyChallengeCardProps) => {
  return (
    <Card className={`p-5 border-accent/20 relative overflow-hidden ${
      isCompleted 
        ? 'bg-muted/50' 
        : 'bg-gradient-to-br from-accent/10 to-accent/5'
    }`}>
      {/* Remi mascot in the corner */}
      <img 
        src={remiMascot} 
        alt="Remi the raccoon" 
        className="absolute bottom-2 right-2 w-16 h-auto max-h-16 object-contain opacity-80"
      />
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Trophy className={`w-6 h-6 ${isCompleted ? 'text-muted-foreground' : 'text-accent'}`} />
          <h2 className={`text-lg font-semibold ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>
            Remi's Weekly Challenge
          </h2>
        </div>
        {isCompleted && (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <Check className="w-3 h-3 mr-1" />
            Done!
          </Badge>
        )}
      </div>
      
      {!isCompleted && !orbsFull && (
        <p className="text-sm text-muted-foreground mb-3">
          Complete this challenge to earn{' '}
          <span className="inline-flex items-center gap-1 text-primary font-medium">
            <Sparkles className="w-4 h-4" /> +1 Orb
          </span>
        </p>
      )}
      
      {!isCompleted && orbsFull && (
        <p className="text-sm text-muted-foreground mb-3">
          Complete this challenge for fun! <span className="text-xs">(Orbs maxed at 3/3)</span>
        </p>
      )}
      
      <div className={`rounded-xl p-4 pr-20 ${isCompleted ? 'bg-muted' : 'bg-background/50'}`}>
        <p className={`text-sm font-medium mb-1 ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
          {title}
        </p>
        <p className={`text-sm ${isCompleted ? 'text-muted-foreground/70 line-through' : 'text-muted-foreground'}`}>
          {description}
        </p>
      </div>
      
      {!isCompleted && (
        <Button 
          className="w-full mt-4"
          variant="secondary"
          onClick={onComplete}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Complete Challenge
        </Button>
      )}
    </Card>
  );
};
