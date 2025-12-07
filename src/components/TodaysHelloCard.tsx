import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TodaysHelloCardProps {
  title: string;
  description: string;
  isCompleted: boolean;
  onComplete: () => void;
}

export const TodaysHelloCard = ({ 
  title, 
  description, 
  isCompleted, 
  onComplete 
}: TodaysHelloCardProps) => {
  return (
    <Card className={`p-5 border-primary/20 ${
      isCompleted 
        ? 'bg-muted/50' 
        : 'bg-gradient-to-br from-primary/10 to-primary/5'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Sparkles className={`w-6 h-6 ${isCompleted ? 'text-muted-foreground' : 'text-primary'}`} />
          <h2 className={`text-lg font-semibold ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>
            Today's Hello
          </h2>
        </div>
        {isCompleted && (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <Check className="w-3 h-3 mr-1" />
            Done!
          </Badge>
        )}
      </div>
      
      <div className={`rounded-xl p-4 ${isCompleted ? 'bg-muted' : 'bg-background/50'}`}>
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
          onClick={onComplete}
        >
          Complete Challenge
        </Button>
      )}
    </Card>
  );
};
