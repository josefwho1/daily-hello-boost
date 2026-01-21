import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Flame } from "lucide-react";
import remiCelebrating1 from "@/assets/remi-celebrating-1.webp";
import remiCelebrating2 from "@/assets/remi-celebrating-2.webp";
import remiCelebrating3 from "@/assets/remi-celebrating-3.webp";
import remiCelebrating4 from "@/assets/remi-celebrating-4.webp";

interface DailyStreakCelebrationDialogProps {
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

// Get milestone message for special streak counts
const getMilestoneMessage = (streak: number): string | null => {
  if (streak === 7) return "One week strong! 🔥";
  if (streak === 14) return "Two weeks! Incredible! 🌟";
  if (streak === 21) return "Three weeks! You're unstoppable! 💪";
  if (streak === 30) return "One month! Amazing dedication! 🏆";
  if (streak % 50 === 0) return `${streak} days! Legendary! 👑`;
  return null;
};

export const DailyStreakCelebrationDialog = ({ 
  open, 
  onContinue,
  newStreak
}: DailyStreakCelebrationDialogProps) => {
  const [showNewStreak, setShowNewStreak] = useState(false);
  const previousStreak = newStreak - 1;
  const milestoneMessage = getMilestoneMessage(newStreak);

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
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Play celebration sound on open
  useEffect(() => {
    if (open && navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
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
          {/* Flame particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: window.innerHeight + 20, 
                  x: Math.random() * window.innerWidth,
                  opacity: 0,
                  scale: 0.5
                }}
                animate={{ 
                  y: -50,
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1, 0.8, 0.3]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 1.5,
                  delay: Math.random() * 0.8,
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatDelay: Math.random() * 0.5
                }}
                className="absolute text-2xl"
              >
                🔥
              </motion.div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex flex-col items-center gap-3 px-6 text-center max-h-screen py-6">
            {/* Title with flame icon */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex items-center gap-2"
            >
              <Flame className="w-8 h-8 text-primary animate-pulse" />
              <h1 className="text-2xl font-bold text-foreground">
                Streak Extended!
              </h1>
              <Flame className="w-8 h-8 text-primary animate-pulse" />
            </motion.div>

            {/* Remi Image */}
            <motion.div
              initial={{ scale: 0, rotate: -5 }}
              animate={{ 
                scale: 1, 
                rotate: [0, -3, 3, -3, 0]
              }}
              transition={{ 
                scale: { delay: 0.2, duration: 0.4, type: "spring" },
                rotate: { delay: 0.6, duration: 0.4, repeat: 2, repeatDelay: 1.5 }
              }}
              className="flex-shrink-0"
            >
              <img 
                src={remiImage} 
                alt="Remi celebrating" 
                className="w-40 h-auto max-h-44 object-contain"
              />
            </motion.div>

            {/* Streak counter animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-sm text-muted-foreground font-medium">Daily Streak</span>
              
              <div className="relative h-20 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={showNewStreak ? "new" : "old"}
                    initial={{ y: showNewStreak ? 50 : 0, opacity: showNewStreak ? 0 : 1, scale: showNewStreak ? 0.8 : 1 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -50, opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-6xl font-bold text-primary">
                      {showNewStreak ? newStreak : previousStreak}
                    </span>
                    {showNewStreak && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="text-xl font-bold text-success"
                      >
                        +1
                      </motion.span>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.3 }}
                className="text-sm text-muted-foreground"
              >
                {newStreak === 1 ? 'day' : 'days'} in a row
              </motion.span>
            </motion.div>

            {/* Milestone message or default subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.3 }}
              className="text-muted-foreground max-w-xs text-sm"
            >
              {milestoneMessage || "Keep showing up — every hello counts!"}
            </motion.p>

            {/* Continue button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.3 }}
              className="w-full max-w-xs mt-2"
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
