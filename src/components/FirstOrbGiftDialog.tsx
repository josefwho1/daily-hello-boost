import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiMascot from "@/assets/remi-waving.webp";
import orbImage from "@/assets/orb.webp";

interface FirstOrbGiftDialogProps {
  open: boolean;
  onClaim: () => void;
}

export const FirstOrbGiftDialog = ({ open, onClaim }: FirstOrbGiftDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm mx-auto [&>button]:hidden">
        <div className="text-center py-4">
          <img 
            src={remiMascot} 
            alt="Remi" 
            className="w-24 h-auto max-h-24 mx-auto mb-4 object-contain"
          />
          
          <h2 className="text-2xl font-bold text-foreground mb-3">
            🎉 Congrats on your first Hello!
          </h2>
          
          <p className="text-muted-foreground mb-4">
            I'm so proud of you.
          </p>

          <p className="text-muted-foreground mb-4">
            I have a gift for you — your very first <span className="font-semibold text-primary">Orb</span>!
          </p>
          
          <div className="flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg mb-4">
            <img src={orbImage} alt="Orb" className="w-10 h-10 object-contain" />
            <span className="text-lg font-semibold text-primary">+1 Orb</span>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            Orbs can be used to save your streak if you miss a day.
          </p>
          
          <Button onClick={onClaim} className="w-full" size="lg">
            <img src={orbImage} alt="Orb" className="w-5 h-5 mr-2 object-contain" />
            Claim Orb
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
