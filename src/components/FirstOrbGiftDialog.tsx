import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiHoldingOrb from "@/assets/remi-holding-orb.webp";

interface FirstOrbGiftDialogProps {
  open: boolean;
  onClaim: () => void;
  username?: string;
}

export const FirstOrbGiftDialog = ({ open, onClaim, username = "" }: FirstOrbGiftDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm mx-auto [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Congrats Friend on your First Hello!
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-center">
          <img 
            src={remiHoldingOrb} 
            alt="Remi with Orb" 
            className="w-32 h-auto max-h-32 object-contain"
          />
        </div>

        <DialogDescription asChild>
          <div className="space-y-3 text-muted-foreground text-center">
            <p>
              As a reward, here's an Orb.
            </p>
            <p>
              These can be used to save your streak incase you miss a day!
            </p>
          </div>
        </DialogDescription>
        
        <Button onClick={onClaim} className="w-full" size="lg">
          I love Orbs
        </Button>
      </DialogContent>
    </Dialog>
  );
};
