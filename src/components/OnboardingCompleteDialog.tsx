import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiMascot from "@/assets/remi-waving.png";

interface OnboardingCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetHellos: number;
  onContinue: () => void;
}

export const OnboardingCompleteDialog = ({ 
  open, 
  onOpenChange, 
  targetHellos,
  onContinue 
}: OnboardingCompleteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto bg-background border-primary/20">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <img src={remiMascot} alt="Remi" className="w-24 h-24" />
          
          <h2 className="text-2xl font-bold text-primary">
            Congratulations! 🎉
          </h2>
          
          <p className="text-lg font-medium text-foreground">
            You completed all 7 types of Hello!
          </p>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            Hope you had as much fun as I did. To keep this momentum going, you can complete any type of Hello to reach your goal. Just make sure you log <span className="font-bold text-primary">{targetHellos} hellos</span> before the week ends to build your streak!
          </p>
          
          <Button 
            onClick={onContinue}
            className="w-full mt-4"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
