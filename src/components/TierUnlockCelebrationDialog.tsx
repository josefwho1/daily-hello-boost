import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect, useMemo } from "react";

// Import celebration images
import remiCelebrating1 from "@/assets/remi-celebrating-1.webp";
import remiCelebrating2 from "@/assets/remi-celebrating-2.webp";
import remiCelebrating3 from "@/assets/remi-celebrating-3.webp";
import remiCelebrating4 from "@/assets/remi-celebrating-4.webp";
import remiCelebrating5 from "@/assets/remi-celebrating-5.webp";
import remiCelebrating6 from "@/assets/remi-celebrating-6.webp";
import remiCelebrating7 from "@/assets/remi-celebrating-7.webp";
import remiCelebrating8 from "@/assets/remi-celebrating-8.webp";
import remiCelebrating9 from "@/assets/remi-celebrating-9.webp";
import remiCelebrating10 from "@/assets/remi-celebrating-10.webp";

const celebrationImages = [
  remiCelebrating1, remiCelebrating2, remiCelebrating3, remiCelebrating4, remiCelebrating5,
  remiCelebrating6, remiCelebrating7, remiCelebrating8, remiCelebrating9, remiCelebrating10
];

interface TierUnlockCelebrationDialogProps {
  open: boolean;
  onContinue: () => void;
  tier: 10 | 20;
}

export const TierUnlockCelebrationDialog = ({
  open,
  onContinue,
  tier,
}: TierUnlockCelebrationDialogProps) => {
  const remiImage = useMemo(() => 
    celebrationImages[Math.floor(Math.random() * celebrationImages.length)],
    []
  );

  // Trigger confetti on open
  useEffect(() => {
    if (open) {
      const duration = 2500;
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
        navigator.vibrate([100, 50, 100]);
      }
    }
  }, [open]);

  const tierTitle = tier === 10 
    ? "Tier 2 Unlocked! 🔓" 
    : "Tier 3 Unlocked! 🔓";

  const tierMessage = tier === 10
    ? "You've completed 10 challenges! The next 10 are now available."
    : "You've completed 20 challenges! The final 10 are now unlocked.";

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-sm rounded-2xl p-6 text-center border-2 border-primary/30"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Tier Unlocked</DialogTitle>
        
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
            {tierTitle}
          </motion.h2>

          {/* Message */}
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {tierMessage}
          </motion.p>

          {/* Continue button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="pt-2"
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
      </DialogContent>
    </Dialog>
  );
};
