import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Remi Curious images - rotate daily
import remiCurious1 from "@/assets/remi-curious-1.webp";
import remiCurious2 from "@/assets/remi-curious-2.webp";
import remiCurious3 from "@/assets/remi-curious-3.webp";
import remiCurious4 from "@/assets/remi-curious-4.webp";

const remiCuriousImages = [remiCurious1, remiCurious2, remiCurious3, remiCurious4];

// Get the Remi Curious image for today (rotates daily)
const getDailyRemiCurious = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return remiCuriousImages[dayOfYear % remiCuriousImages.length];
};

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
  const remiImage = getDailyRemiCurious();

  return (
    <Card 
      id="todays-hello-card"
      className={`p-5 border-primary/20 relative overflow-hidden ${
      isCompleted 
        ? 'bg-muted/50' 
        : 'bg-gradient-to-br from-primary/10 to-primary/5'
    }`}>
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">💡</span>
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
        <p className="text-xs text-muted-foreground mt-1 ml-7">
          A daily suggestion to help you connect
        </p>
      </div>
      
      <div className={`rounded-xl p-4 pr-20 ${isCompleted ? 'bg-muted' : 'bg-background/50'}`}>
        <p className={`text-sm font-medium mb-1 ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
          {title}
        </p>
        <p className={`text-sm ${isCompleted ? 'text-muted-foreground/70 line-through' : 'text-muted-foreground'}`}>
          {description}
        </p>
      </div>

      {/* Remi Curious - positioned bottom right of the card */}
      <img 
        src={remiImage} 
        alt="Remi the curious raccoon" 
        className="absolute bottom-2 right-2 w-16 h-auto object-contain opacity-90"
      />

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
