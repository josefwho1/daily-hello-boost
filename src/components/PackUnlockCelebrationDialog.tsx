import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import remiCelebrating from "@/assets/remi-celebrating.webp";

interface PackUnlockCelebrationDialogProps {
  open: boolean;
  onClose: () => void;
  packName: string;
  packDescription: string;
}

export const PackUnlockCelebrationDialog = ({
  open,
  onClose,
  packName,
  packDescription,
}: PackUnlockCelebrationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
        {/* Confetti/sparkle decoration */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <Sparkles className="absolute top-4 left-4 w-6 h-6 text-primary animate-pulse" />
          <Sparkles className="absolute top-8 right-6 w-4 h-4 text-yellow-500 animate-pulse delay-100" />
          <Sparkles className="absolute top-16 left-8 w-3 h-3 text-primary animate-pulse delay-200" />
        </div>

        <div className="p-6 pt-8 text-center">
          {/* Remi celebrating */}
          <div className="flex justify-center mb-4">
            <img 
              src={remiCelebrating} 
              alt="Remi celebrating" 
              className="w-28 h-auto object-contain drop-shadow-lg"
            />
          </div>

          {/* Unlock message */}
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              🎉 Pack Unlocked!
            </h2>
            <p className="text-lg font-semibold text-primary">
              {packName}
            </p>
            <p className="text-sm text-muted-foreground">
              {packDescription}
            </p>
          </div>

          {/* Remi's message */}
          <div className="bg-primary/10 rounded-2xl p-4 mb-6">
            <p className="text-sm text-foreground">
              "You've earned this! Keep leveling up to unlock more goodies from my vault!" 🦝
            </p>
          </div>

          <Button 
            onClick={onClose}
            className="w-full rounded-xl py-6 text-lg font-semibold"
          >
            Explore Pack
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
