import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// Remi Celebrating images
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

const remiCelebratingImages = [
  remiCelebrating1, remiCelebrating2, remiCelebrating3, remiCelebrating4, remiCelebrating5,
  remiCelebrating6, remiCelebrating7, remiCelebrating8, remiCelebrating9, remiCelebrating10
];

const getRandomImage = (images: string[]) => {
  return images[Math.floor(Math.random() * images.length)];
};

interface SingleChallengeCompleteDialogProps {
  open: boolean;
  onContinue: () => void;
  dayNumber: number;
  totalDays: number;
  challengeTitle?: string;
}

export const SingleChallengeCompleteDialog = ({
  open,
  onContinue,
  dayNumber,
  totalDays,
  challengeTitle,
}: SingleChallengeCompleteDialogProps) => {
  const [showContent, setShowContent] = useState(false);
  const remiImage = useMemo(() => getRandomImage(remiCelebratingImages), []);

  useEffect(() => {
    if (open) {
      setShowContent(false);
      // Stagger content appearance
      const timer = setTimeout(() => setShowContent(true), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Play vibration on open
  useEffect(() => {
    if (open && navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }
  }, [open]);

  // Auto-dismiss after 2.5 seconds
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onContinue();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [open, onContinue]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
          onClick={onContinue}
        >
          {/* Sparkle particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  y: window.innerHeight + 20, 
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
                  opacity: 0,
                  scale: 0.5
                }}
                animate={{ 
                  y: -50,
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1, 0.8, 0.3]
                }}
                transition={{ 
                  duration: 2 + Math.random() * 1,
                  delay: Math.random() * 0.5,
                  ease: "easeOut",
                }}
                className="absolute text-2xl"
              >
                {['✨', '⭐', '🎯'][i % 3]}
              </motion.div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            {/* Remi Image */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="flex-shrink-0"
            >
              <img 
                src={remiImage} 
                alt="Remi celebrating" 
                className="w-36 h-auto max-h-40 object-contain"
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-2xl font-bold text-foreground"
            >
              Challenge Complete! 🎉
            </motion.h1>

            {/* Challenge info */}
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-2"
                >
                  {challengeTitle && (
                    <p className="text-muted-foreground text-sm">
                      {challengeTitle}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress dots */}
            <motion.div 
              className="flex justify-center gap-2 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {[...Array(totalDays)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.05, type: "spring" }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < dayNumber
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i < dayNumber ? '✓' : i + 1}
                </motion.div>
              ))}
            </motion.div>

            {/* Progress text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground"
            >
              {dayNumber}/{totalDays} completed
            </motion.p>

            {/* Tap to continue hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 1 }}
              className="text-xs text-muted-foreground mt-4"
            >
              Tap to continue
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
