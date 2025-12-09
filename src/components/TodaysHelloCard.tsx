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
      <div className="mb-3">
        <div className="flex items-center justify-between">
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
        <p className="text-xs text-muted-foreground mt-1 ml-9">
          Any Hello counts, but this one gives you extra XP 🦝
        </p>
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
          onClick={onComplete}
          className="w-full mt-4"
          variant="default"
        >
          Complete Today's Hello
        </Button>
      )}
    </Card>
  );
};