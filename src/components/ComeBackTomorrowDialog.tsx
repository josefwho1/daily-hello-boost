import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiMascot from "@/assets/remi-waving.webp";

interface ComeBackTomorrowDialogProps {
  open: boolean;
  onContinue: () => void;
}

export const ComeBackTomorrowDialog = ({ open, onContinue }: ComeBackTomorrowDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm mx-auto [&>button]:hidden">
        <div className="text-center py-4">
          <img 
            src={remiMascot} 
            alt="Remi" 
            className="w-24 h-auto max-h-24 mx-auto mb-4 object-contain"
          />
          
          <p className="text-lg text-muted-foreground mb-4">
            Come back tomorrow to reveal the next challenge…
          </p>
          
          <p className="text-lg text-foreground font-medium mb-6">
            I'm wishing you do 😉
          </p>
          
          <p className="text-xs text-muted-foreground italic mb-4">
            (Because Day 2 is Well Wishes!)
          </p>
          
          <Button onClick={onContinue} className="w-full" size="lg">
            See you tomorrow!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
