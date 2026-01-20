import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import remiCelebrating1 from "@/assets/remi-celebrating-1.webp";
import remiCelebrating2 from "@/assets/remi-celebrating-2.webp";
import remiCelebrating3 from "@/assets/remi-celebrating-3.webp";
import remiCelebrating4 from "@/assets/remi-celebrating-4.webp";

interface WeeklyGoalCelebrationDialogProps {
  open: boolean;
  onContinue: () => void;
  newStreak: number;
}

const celebratingImages = [
  remiCelebrating1,
  remiCelebrating2,
  remiCelebrating3,
  remiCelebrating4,
];

export const WeeklyGoalCelebrationDialog = ({ 
  open, 
  onContinue,
  newStreak
}: WeeklyGoalCelebrationDialogProps) => {
  const [showNewStreak, setShowNewStreak] = useState(false);
  const previousStreak = newStreak - 1;

  // Select a random Remi image when dialog opens
  const remiImage = useMemo(() => {
    return celebratingImages[Math.floor(Math.random() * celebratingImages.length)];
  }, [open]);

  useEffect(() => {
    if (open) {
      setShowNewStreak(false);
      // Animate to new streak after a delay
      const timer = setTimeout(() => {
        setShowNewStreak(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
        >
          {/* Confetti-like particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: -20, 
                  x: Math.random() * window.innerWidth,
                  opacity: 1,
                  rotate: 0
                }}
                animate={{ 
                  y: window.innerHeight + 20,
                  rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                  opacity: [1, 1, 0]
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: "linear",
                  repeat: Infinity
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#FF6B35', '#FFD700', '#FF8C00', '#FFA500'][Math.floor(Math.random() * 4)]
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="flex flex-col items-center gap-4 px-6 text-center max-h-screen py-8">
            {/* Title */}
            <motion.h1
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl font-bold text-foreground"
            >
              🎉 Weekly Goal Smashed! 🎉
            </motion.h1>

            {/* Remi Image with rotation */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ 
                scale: 1, 
                rotate: [0, -5, 5, -5, 0]
              }}
              transition={{ 
                scale: { delay: 0.3, duration: 0.5, type: "spring" },
                rotate: { delay: 0.8, duration: 0.5, repeat: Infinity, repeatDelay: 2 }
              }}
              className="flex-shrink-0"
            >
              <img 
                src={remiImage} 
                alt="Remi celebrating" 
                className="w-44 h-auto max-h-48 object-contain"
              />
            </motion.div>

            {/* Streak counter animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-base text-muted-foreground font-medium">Weekly Streak</span>
              
              <div className="relative h-20 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={showNewStreak ? "new" : "old"}
                    initial={{ y: showNewStreak ? 60 : 0, opacity: showNewStreak ? 0 : 1 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -60, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="text-6xl font-bold text-primary"
                  >
                    {showNewStreak ? newStreak : previousStreak}
                  </motion.span>
                </AnimatePresence>
              </div>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.4 }}
                className="text-base text-muted-foreground"
              >
                {newStreak === 1 ? 'week' : 'weeks'} 🔥
              </motion.span>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.4 }}
              className="text-muted-foreground max-w-xs"
            >
              You hit your weekly goal! Keep the momentum going.
            </motion.p>

            {/* Continue button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.4 }}
              className="w-full max-w-xs"
            >
              <Button onClick={onContinue} className="w-full" size="lg">
                Keep Going!
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
