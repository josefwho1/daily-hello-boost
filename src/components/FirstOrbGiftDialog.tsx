import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiHoldingOrb from "@/assets/remi-holding-orb.webp";

interface FirstOrbGiftDialogProps {
  open: boolean;
  onClaim: () => void;
  username?: string;
}

export const FirstOrbGiftDialog = ({ open, onClaim, username = "" }: FirstOrbGiftDialogProps) => {
  const displayName = username || "friend";
  
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm mx-auto [&>button]:hidden">
        <div className="text-center py-4">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Congrats Friend on your First Hello!
          </h2>
          
          <img 
            src={remiHoldingOrb} 
            alt="Remi with Orb" 
            className="w-32 h-auto max-h-32 mx-auto mb-4 object-contain"
          />

          <div className="space-y-3 text-muted-foreground mb-6">
            <p>
              As a reward, here's an Orb.
            </p>
            <p>
              These can be used to save your streak incase you miss a day!
            </p>
          </div>
          
          <Button onClick={onClaim} className="w-full" size="lg">
            I love Orbs
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
