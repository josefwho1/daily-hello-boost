import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiCelebration from "@/assets/remi-orb-celebration.webp";

interface WeeklyChallengeCompleteDialogProps {
  open: boolean;
  onContinue: () => void;
  orbsAwarded: boolean;
}

export const WeeklyChallengeCompleteDialog = ({ 
  open, 
  onContinue,
  orbsAwarded
}: WeeklyChallengeCompleteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onContinue()}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl text-center">
            🎉 Weekly Challenge Complete!
          </DialogTitle>
          <DialogDescription className="text-center pt-2 space-y-3">
            {orbsAwarded ? (
              <p className="text-base">
                Amazing work! You've earned <span className="font-semibold text-primary">+1 Orb</span> for completing this week's challenge.
              </p>
            ) : (
              <p className="text-base">
                Amazing work completing this week's challenge!
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Remember: Orbs can save your streak if you ever miss a day. Keep them safe for when you need them!
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center py-4">
          <img 
            src={remiCelebration} 
            alt="Remi celebrating with orb" 
            className="w-64 h-auto max-h-72 object-contain animate-fade-in"
          />
        </div>

        <DialogFooter>
          <Button onClick={onContinue} className="w-full" size="lg">
            Awesome!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
