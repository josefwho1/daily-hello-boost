import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiCelebrating from "@/assets/remi-celebrating-3.webp";

interface OnboardingCompleteMilestoneDialogProps {
  open: boolean;
  onContinue: () => void;
}

export const OnboardingCompleteMilestoneDialog = ({
  open,
  onContinue,
}: OnboardingCompleteMilestoneDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md" 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={remiCelebrating} 
              alt="Remi celebrating" 
              className="w-32 h-auto max-h-32 animate-bounce-soft object-contain" 
            />
          </div>
          <DialogTitle className="text-2xl">
            🎉 Congratulations 🎉
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-base space-y-2">
            <p className="font-semibold text-foreground">Initiation complete.</p>
            <p>You can officially turn a stranger into a friend.</p>
            <p>Welcome to the Gaze</p>
            <p className="text-sm">(that's what a group of raccoons is called 🦝)</p>
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 my-4 text-center">
          <p className="text-sm text-muted-foreground">
            Now it's time to choose how you want to continue your journey...
          </p>
        </div>

        <Button onClick={onContinue} className="w-full" size="lg">
          Choose My Mode 🚀
        </Button>
      </DialogContent>
    </Dialog>
  );
};
