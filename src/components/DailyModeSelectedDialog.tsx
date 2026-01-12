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
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-auto [&>button]:hidden">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <img
              src={remiMascot}
              alt="Remi"
              className="w-20 h-auto max-h-20 object-contain"
            />
          </div>
          <DialogTitle className="text-xl font-bold text-center">
            This is where legends are made.
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-center text-muted-foreground space-y-3 mt-4 bg-muted/30 rounded-lg p-4">
              <p>One Hello a day keeps your streak alive.</p>
              <p>Miss a day? Use an Orb to save it 🔮</p>
              <p>Everything else is just bonus XP.</p>
              <p>You'll be saying more than one hello before you know it.</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Button onClick={onContinue} className="w-full" size="lg">
            Let's do this 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
