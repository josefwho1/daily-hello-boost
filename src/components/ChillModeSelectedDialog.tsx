import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiMascot from "@/assets/remi-waving.webp";

interface ChillModeSelectedDialogProps {
  open: boolean;
  onContinue: () => void;
}

export const ChillModeSelectedDialog = ({ open, onContinue }: ChillModeSelectedDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-auto [&>button]:hidden max-h-[90vh] overflow-y-auto">
        <div className="text-center py-4">
          <img 
            src={remiMascot} 
            alt="Remi" 
            className="w-20 h-auto max-h-20 mx-auto mb-4 object-contain"
          />
          
          <h2 className="text-xl font-bold text-foreground mb-2">
            Chill Mode 🌱
          </h2>
          
          <p className="text-lg font-medium text-primary mb-4">
            5 Hellos per week, any time.
          </p>
          
          <div className="text-left text-sm text-muted-foreground space-y-4 mb-6 bg-muted/30 rounded-lg p-4">
            <p>
              Log <span className="font-medium text-foreground">5 Hellos</span> throughout the week (Mon to Sun) to keep your weekly streak alive.
            </p>
            
            <p>
              Say Hello whenever you like, 5 on one day or 1 a day — it's up to you.
            </p>
            
            <p>
              <span className="font-medium text-foreground">"Log any Hello"</span> when they happen
            </p>
            
            <p>
              <span className="font-medium text-foreground">"Today's Hello"</span> provides daily inspiration & an opportunity for extra XP
            </p>
            
            <p>
              For a real challenge (& an extra orb) try <span className="font-medium text-foreground">Remi's Weekly Challenge 🦝</span>
            </p>
            
            <p>
              Remember if you miss a week you can use an <span className="font-medium">Orb</span> to maintain your streak 🔥
            </p>
          </div>
          
          <p className="text-sm font-medium text-foreground mb-4">
            Good luck & happy Hello's 👋
          </p>
          
          <Button onClick={onContinue} className="w-full" size="lg">
            Let's Go! 🌱
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
