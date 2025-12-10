import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiMascot from "@/assets/remi-waving.webp";

interface DailyModeSelectedDialogProps {
  open: boolean;
  onContinue: () => void;
}

export const DailyModeSelectedDialog = ({ open, onContinue }: DailyModeSelectedDialogProps) => {
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
            This is where legends are made.
          </h2>
          
          <p className="text-lg font-medium text-primary mb-4">
            One Hello a day.
          </p>
          
          <div className="text-left text-sm text-muted-foreground space-y-4 mb-6 bg-muted/30 rounded-lg p-4">
            <p>
              To maintain your streak <span className="font-medium text-foreground">"Log any Hello"</span> once per day
            </p>
            
            <p className="text-xs italic">
              (Bonus points for logging more Hellos, you'll find you might make more than one friend a day.)
            </p>
            
            <p>
              If you miss a day, you can maintain your streak using an <span className="font-medium">Orb 🔮</span>
            </p>
            
            <p>
              For extra XP & inspiration - try <span className="font-medium text-foreground">"Today's Hello"</span>
            </p>
            
            <p>
              For a real challenge (& an extra orb) try <span className="font-medium text-foreground">Remi's Weekly Challenge 🦝</span>
            </p>
          </div>
          
          <p className="text-sm font-medium text-foreground mb-4">
            Good luck & happy Hello's 👋
          </p>
          
          <Button onClick={onContinue} className="w-full" size="lg">
            Let's Go! 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
