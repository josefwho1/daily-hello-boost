import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getRankFromLevel, formatXp, getXpProgress } from "@/lib/xpSystem";
import { Trophy } from "lucide-react";

// Remi Celebrating images
import remiCelebrating1 from "@/assets/remi-celebrating-1.webp";
import remiCelebrating2 from "@/assets/remi-celebrating-2.webp";
import remiCelebrating3 from "@/assets/remi-celebrating-3.webp";
import remiCelebrating4 from "@/assets/remi-celebrating-4.webp";

const remiCelebratingImages = [remiCelebrating1, remiCelebrating2, remiCelebrating3, remiCelebrating4];

const getRandomImage = (images: string[]) => {
  return images[Math.floor(Math.random() * images.length)];
};

interface LevelUpCelebrationDialogProps {
  open: boolean;
  onClose: () => void;
  newLevel: number;
  totalXp: number;
}

export const LevelUpCelebrationDialog = ({ 
  open, 
  onClose, 
  newLevel, 
  totalXp 
}: LevelUpCelebrationDialogProps) => {
  const [celebratingImage] = useState(() => getRandomImage(remiCelebratingImages));
  const rank = getRankFromLevel(newLevel);
  const progress = getXpProgress(totalXp, newLevel);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto bg-background border-2 border-primary/20 overflow-hidden">
        <div className="text-center py-6 relative z-10">
          {/* Remi celebrating */}
          <div className="relative inline-block mb-4">
            <img 
              src={celebratingImage} 
              alt="Remi celebrating" 
              className="w-28 h-auto max-h-28 mx-auto object-contain"
            />
            <div 
              className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg"
              style={{ backgroundColor: rank.color }}
            >
              {newLevel}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            🎉 Level Up!
          </h2>

          <p className="text-lg font-semibold mb-1" style={{ color: rank.color }}>
            {rank.emoji} {rank.name}
          </p>

          <p className="text-foreground/70 text-sm mb-4">
            You've reached Level {newLevel}!
          </p>

          {/* XP Badge */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/20 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground">{formatXp(totalXp)} XP</span>
            </div>
            
            {/* Progress to next level */}
            {newLevel < 100 && (
              <div className="space-y-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${progress.percent}%`,
                      backgroundColor: rank.color
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatXp(progress.current)} / {formatXp(progress.needed)} to Level {newLevel + 1}
                </p>
              </div>
            )}
          </div>

          <Button 
            onClick={onClose}
            className="w-full"
            size="lg"
          >
            Keep Going! 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
