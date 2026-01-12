import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiMascot from "@/assets/remi-waving.webp";

interface DailyModeSelectedDialogProps {
  open: boolean;
  onContinue: () => void;
}

export const DailyModeSelectedDialog = ({ open, onContinue }: DailyModeSelectedDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onContinue()}>
      <DialogContent className="max-w-md mx-auto [&>button]:hidden flex flex-col">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <img 
              src={remiMascot} 
              alt="Remi" 
              className="w-20 h-auto max-h-20 object-contain"
            />
          </div>
          <DialogTitle className="text-xl font-bold">
            This is where legends are made.
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-left text-muted-foreground space-y-3 mt-4 bg-muted/30 rounded-lg p-4">
              <p>One Hello a day keeps your streak alive.</p>
              <p>Miss a day? Use an Orb to save it 🔮</p>
              <p>Everything else is just bonus XP.</p>
              <p>You'll be saying more than one hello before you know it.</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <Button onClick={onContinue} className="w-full mt-4 flex-shrink-0" size="lg">
          Let's do this 🚀
        </Button>
      </DialogContent>
    </Dialog>
  );
};
