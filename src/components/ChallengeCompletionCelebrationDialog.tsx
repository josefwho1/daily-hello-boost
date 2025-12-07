import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiMascot from "@/assets/remi-waving.png";

interface ChallengeCompletionCelebrationDialogProps {
  open: boolean;
  onContinue: () => void;
  dayNumber: number;
  isFirstHelloEver?: boolean;
}

export const ChallengeCompletionCelebrationDialog = ({
  open,
  onContinue,
  dayNumber,
  isFirstHelloEver = false,
}: ChallengeCompletionCelebrationDialogProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const celebrationMessage = dayNumber === 1 || isFirstHelloEver
    ? "Congrats on your first hello! 🎉"
    : "Nice work — that took courage! 💪";

  const subMessage = dayNumber === 7
    ? "You've completed all 7 days! Time to choose your journey..."
    : `Day ${dayNumber} complete! Come back tomorrow for the next challenge.`;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md overflow-hidden" 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  backgroundColor: ['#ff6f3b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b6b'][Math.floor(Math.random() * 5)],
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  borderRadius: Math.random() > 0.5 ? '50%' : '0',
                }}
              />
            ))}
          </div>
        )}

        <DialogHeader className="text-center relative z-10">
          <div className="flex justify-center mb-4">
            <img 
              src={remiMascot} 
              alt="Remi celebrating" 
              className="w-28 h-auto max-h-28 animate-bounce-soft object-contain" 
            />
          </div>
          <DialogTitle className="text-2xl">
            {celebrationMessage}
          </DialogTitle>
          <DialogDescription className="text-center pt-2 text-base">
            {subMessage}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-2 my-4">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < dayNumber
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < dayNumber ? '✓' : i + 1}
            </div>
          ))}
        </div>

        <Button onClick={onContinue} className="w-full" size="lg">
          {dayNumber === 7 ? "Choose My Journey 🚀" : "Continue ✨"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
