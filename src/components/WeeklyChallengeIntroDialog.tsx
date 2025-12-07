import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiMascot from "@/assets/remi-waving.png";

interface WeeklyChallengeIntroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WeeklyChallengeIntroDialog = ({ 
  open, 
  onOpenChange 
}: WeeklyChallengeIntroDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto bg-background border-primary/20">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <img src={remiMascot} alt="Remi" className="w-24 h-24" />
          
          <h2 className="text-2xl font-bold text-primary">
            Weekly Challenge 🏆
          </h2>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            Who doesn't love a challenge?
          </p>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            Every week you'll be given a new bonus challenge. Completion is optional, but these are designed to get you out of your comfort zone and get a little creative.
          </p>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            Have fun! Every bonus challenge you complete gives you a <span className="font-bold text-primary">streak saver</span> in case you miss a Hello.
          </p>
          
          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full mt-4"
          >
            Let's Go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
