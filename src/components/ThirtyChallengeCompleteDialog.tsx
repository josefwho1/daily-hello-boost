import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect, useMemo } from "react";

// Import Remi Congrats image
import remiCongrats1 from "@/assets/remi-congrats-1.webp";

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
  const remiImage = useMemo(() => remiCongrats1, []);

  // Trigger confetti on open
  useEffect(() => {
    if (open) {
      const duration = 4000;
      const end = Date.now() + duration;

      // Big celebration burst
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
      });

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'],
        });
        confetti({
          particleCount: 4,
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

      // Haptic feedback - big celebration pattern
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200, 100, 300]);
      }
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.1 
            }}
            className="flex flex-col items-center text-center max-w-sm space-y-5"
          >
            {/* Remi congrats */}
            <motion.img 
              src={remiImage}
              alt="Remi congratulating"
              className="w-44 h-44 object-contain"
              initial={{ y: -20, scale: 0.8 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.2
              }}
            />

            {/* Title */}
            <motion.h2
              className="text-3xl font-bold text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              🎉 You did it!
            </motion.h2>

            {/* Message */}
            <motion.div
              className="text-muted-foreground space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-lg font-medium text-foreground">
                You've completed The 30 Hellos.
              </p>
              <p>
                This doesn't end here.<br />
                One hello a day still counts.
              </p>
              <p className="text-sm">
                You'll now see a Today's Hello for suggestions.<br />
                If you want new ideas later, you can explore Quests anytime.
              </p>
            </motion.div>

            {timesCompleted > 1 && (
              <motion.p
                className="text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Times completed: {timesCompleted}
              </motion.p>
            )}

            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pt-4 w-full"
            >
              <Button 
                onClick={onContinue}
                className="w-full rounded-full font-semibold"
                size="lg"
              >
                Keep Going
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};