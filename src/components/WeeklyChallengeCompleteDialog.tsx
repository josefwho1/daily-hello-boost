import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import remiOrbCelebration from "@/assets/remi-orb-celebration.webp";

interface WeeklyChallengeCompleteDialogProps {
  open: boolean;
  onContinue: () => void;
  orbsAwarded: boolean;
}

export const WeeklyChallengeCompleteDialog = ({ 
  open, 
  onContinue,
  orbsAwarded
}: WeeklyChallengeCompleteDialogProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (open) {
      setShowContent(false);
      // Stagger content appearance
      const timer = setTimeout(() => setShowContent(true), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Play vibration on open
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
          {/* Sparkle particles */}
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
                  duration: 2.5 + Math.random() * 1.5,
                  delay: Math.random() * 0.8,
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatDelay: Math.random() * 0.5
                }}
                className="absolute text-2xl"
              >
                {i % 3 === 0 ? '✨' : i % 3 === 1 ? '🔮' : '⭐'}
              </motion.div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex flex-col items-center gap-4 px-6 text-center max-h-screen py-8">
            {/* Remi Image */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ 
                scale: 1, 
                rotate: [0, -3, 3, -3, 0]
              }}
              transition={{ 
                scale: { delay: 0.2, duration: 0.5, type: "spring" },
                rotate: { delay: 0.7, duration: 0.5, repeat: 2, repeatDelay: 2 }
              }}
              className="flex-shrink-0"
            >
              <img 
                src={remiOrbCelebration} 
                alt="Remi celebrating with orb" 
                className="w-48 h-auto max-h-52 object-contain"
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-2xl font-bold text-foreground"
            >
              🎉 Remi's Challenge Complete!
            </motion.h1>

            {/* Body text */}
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="flex flex-col items-center gap-3 max-w-xs"
                >
                  {orbsAwarded ? (
                    <p className="text-muted-foreground">
                      Amazing work. Here's an <span className="font-semibold text-primary">Orb</span> for your efforts.
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Amazing work completing this week's challenge!
                    </p>
                  )}
                  
                  <p className="text-sm text-muted-foreground">
                    Remember these can be used to save your streak in case you miss a day.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Orb Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="w-full max-w-xs mt-4"
            >
              <Button onClick={onContinue} className="w-full" size="lg">
                🔮
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
