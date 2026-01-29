import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";
import remiMascot from "@/assets/remi-waving.webp";

interface UseSaveDialogProps {
  open: boolean;
  onUseSave: () => void;
  onDecline: () => void;
  type: 'daily' | 'weekly';
  savesAvailable: number;
}

export const UseSaveDialog = ({ 
  open, 
  onUseSave, 
  onDecline, 
  type,
  savesAvailable 
}: UseSaveDialogProps) => {
  const isDaily = type === 'daily';
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={remiMascot} alt="Remi" className="w-20 h-auto max-h-20 object-contain" />
          </div>
          <DialogTitle className="text-xl flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Use a Save to keep your streak alive?
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {isDaily 
              ? "You missed yesterday's hello. Use 1 Save to protect your daily streak."
              : "You didn't reach your weekly hello goal. Would you like to use 1 Save to keep your weekly streak going?"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center justify-center gap-2 py-3 bg-muted rounded-lg">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-medium">Saves available: {savesAvailable} / 3</span>
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
            onClick={onUseSave}
            disabled={savesAvailable < 1}
          >
            <Shield className="w-4 h-4 mr-2" />
            Use Save
          </Button>
        </DialogFooter>
        
        {savesAvailable < 1 && (
          <p className="text-sm text-destructive text-center">
            You don't have any saves available. Your streak will be reset.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
