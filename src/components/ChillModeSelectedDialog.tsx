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
          
          <h2 className="text-xl font-bold text-foreground mb-4">
            Chill Mode activated.
          </h2>
          
          <div className="text-left text-muted-foreground space-y-3 mb-6 bg-muted/30 rounded-lg p-4">
            <p>5 Hellos per week - any day, any time.</p>
            <p>Hit your 5 to keep your weekly streak going.</p>
            <p>Miss a week? Use an Orb to save it 🔮</p>
            <p>No pressure. Just connection at your pace.</p>
          </div>
          
          <Button onClick={onContinue} className="w-full" size="lg">
            I'm ready ✨
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
