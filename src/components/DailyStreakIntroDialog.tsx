import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiMascot from "@/assets/remi-mascot.png";

interface DailyStreakIntroDialogProps {
  open: boolean;
  onContinue: () => void;
}

export const DailyStreakIntroDialog = ({ open, onContinue }: DailyStreakIntroDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm mx-auto [&>button]:hidden">
        <div className="text-center py-4">
          <img 
            src={remiMascot} 
            alt="Remi" 
            className="w-24 h-24 mx-auto mb-4"
          />
          
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Your First Hello! 🎉
          </h2>
          
          <p className="text-muted-foreground mb-4">
            You just started your <span className="font-semibold text-primary">Daily Streak</span>!
          </p>
          
          <p className="text-sm text-muted-foreground mb-6">
            Log at least one Hello every day to keep your streak going. 
            The longer your streak, the stronger your social muscle becomes!
          </p>
          
          <Button onClick={onContinue} className="w-full" size="lg">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
