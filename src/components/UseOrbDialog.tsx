import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertTriangle } from "lucide-react";
import remiMascot from "@/assets/remi-waving.png";

interface UseOrbDialogProps {
  open: boolean;
  onUseOrb: () => void;
  onDecline: () => void;
  type: 'daily' | 'weekly';
  orbsAvailable: number;
}

export const UseOrbDialog = ({ 
  open, 
  onUseOrb, 
  onDecline, 
  type,
  orbsAvailable 
}: UseOrbDialogProps) => {
  const isDaily = type === 'daily';
  
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={remiMascot} alt="Remi" className="w-20 h-auto max-h-20 object-contain" />
          </div>
          <DialogTitle className="text-xl flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Use an Orb to keep your streak alive?
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {isDaily 
              ? "You missed yesterday's hello. Use 1 Orb to protect your daily streak."
              : "You didn't reach your weekly hello goal. Would you like to use 1 Orb to keep your weekly streak going?"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-medium">Orbs available: {orbsAvailable} / 3</span>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onDecline}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Don't use
          </Button>
          <Button
            className="flex-1"
            onClick={onUseOrb}
            disabled={orbsAvailable < 1}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Use Orb
          </Button>
        </DialogFooter>
        
        {orbsAvailable < 1 && (
          <p className="text-sm text-destructive text-center">
            You don't have any orbs available. Your streak will be reset.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
