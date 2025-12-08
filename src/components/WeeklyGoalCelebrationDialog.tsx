import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiCelebrating from "@/assets/remi-celebrating.webp";

interface WeeklyGoalCelebrationDialogProps {
  open: boolean;
  onContinue: () => void;
  newStreak: number;
}

export const WeeklyGoalCelebrationDialog = ({ 
  open, 
  onContinue,
  newStreak
}: WeeklyGoalCelebrationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl text-center">
            🎉 Weekly Goal Smashed!
          </DialogTitle>
          <DialogDescription className="text-center pt-2 space-y-3">
            <p className="text-base">
              Amazing! You hit your 5 hellos for the week!
            </p>
            <p className="text-lg font-semibold text-primary">
              Weekly Streak: {newStreak} {newStreak === 1 ? 'week' : 'weeks'} 🔥
            </p>
            <p className="text-sm text-muted-foreground">
              Feel like logging more hellos? Go for it! You'll still get daily challenges to keep the momentum going.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center py-4">
          <img 
            src={remiCelebrating} 
            alt="Remi celebrating" 
            className="w-48 h-auto max-h-56 object-contain animate-fade-in"
          />
        </div>

        <DialogFooter>
          <Button onClick={onContinue} className="w-full" size="lg">
            Keep Going!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
