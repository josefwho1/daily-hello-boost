import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";

// Import celebration images
import remiCelebrating1 from "@/assets/remi-celebrating-1.webp";
import remiCelebrating2 from "@/assets/remi-celebrating-2.webp";
import remiCelebrating3 from "@/assets/remi-celebrating-3.webp";
import remiCelebrating4 from "@/assets/remi-celebrating-4.webp";
import remiCelebrating5 from "@/assets/remi-celebrating-5.webp";

const celebrationImages = [
  remiCelebrating1,
  remiCelebrating2,
  remiCelebrating3,
  remiCelebrating4,
  remiCelebrating5,
];

interface ThirtyChallengeCompleteDialogProps {
  open: boolean;
  onContinue: () => void;
  timesCompleted?: number;
}

export const ThirtyChallengeCompleteDialog = ({
  open,
  onContinue,
  timesCompleted = 1,
}: ThirtyChallengeCompleteDialogProps) => {
  const [remiImage] = useState(() => 
    celebrationImages[Math.floor(Math.random() * celebrationImages.length)]
  );

  // Trigger confetti on open
  useEffect(() => {
    if (open) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-sm rounded-2xl p-6 text-center border-2 border-primary/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">30-Day Challenge Complete</DialogTitle>
        
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            delay: 0.1 
          }}
          className="space-y-4"
        >
          {/* Remi celebrating */}
          <div className="flex justify-center">
            <motion.img 
              src={remiImage}
              alt="Remi celebrating"
              className="w-32 h-32 object-contain"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.2
              }}
            />
          </div>

          {/* Title */}
          <motion.h2
            className="text-2xl font-bold text-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            🎉 30-Day Challenge Complete! 🎉
          </motion.h2>

          {/* Message */}
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            You've completed all 30 challenges!
          </motion.p>

          <motion.p
            className="text-lg font-semibold text-primary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            You're officially a Conversation Starter! 🏆
          </motion.p>

          {timesCompleted > 1 && (
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Times completed: {timesCompleted}
            </motion.p>
          )}

          {/* Continue button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="pt-2"
          >
            <Button 
              onClick={onContinue}
              className="w-full rounded-full font-semibold"
              size="lg"
            >
              Continue
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};