import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
            Chill Mode activated.
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-center text-muted-foreground space-y-3 mt-4 bg-muted/30 rounded-lg p-4">
              <p>5 Hellos per week - any day, any time.</p>
              <p>Hit your 5 to keep your weekly streak going.</p>
              <p>Miss a week? Use an Orb to save it 🔮</p>
              <p>No pressure. Just connection at your pace.</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Button onClick={onContinue} className="w-full" size="lg">
            I'm ready ✨
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
