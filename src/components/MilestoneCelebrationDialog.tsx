import { useEffect, useState, useMemo, useCallback } from "react";
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

export type MilestoneType = 'hellos' | 'names';

interface MilestoneCelebrationDialogProps {
  open: boolean;
  onContinue: () => void;
  milestoneValue: number;
  milestoneType: MilestoneType;
}

const getMilestoneMessage = (value: number, type: MilestoneType): string => {
  const typeLabel = type === 'hellos' ? 'Hellos' : 'Names';
  
  if (value >= 500) return `Legendary! You've logged ${value} ${typeLabel}!`;
  if (value >= 400) return `Unstoppable! ${value} ${typeLabel} and counting!`;
  if (value >= 300) return `Champion status! ${value} ${typeLabel}!`;
  if (value >= 200) return `On fire! ${value} ${typeLabel} logged!`;
  if (value >= 100) return `Triple digits! ${value} ${typeLabel}!`;
  if (value >= 75) return `Amazing progress! ${value} ${typeLabel}!`;
  if (value >= 50) return `Halfway to 100! ${value} ${typeLabel}!`;
  if (value >= 25) return `Great start! ${value} ${typeLabel}!`;
  return `First milestone! ${value} ${typeLabel}!`;
};

export const MilestoneCelebrationDialog = ({
  open,
  onContinue,
  milestoneValue,
  milestoneType,
}: MilestoneCelebrationDialogProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const remiImage = useMemo(() => getRandomImage(remiCelebratingImages), []);

  const playCelebrationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 880, 1046.50]; // C5, E5, G5, A5, C6
      notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        const startTime = audioContext.currentTime + (index * 0.1);
        const duration = 0.35;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.28, startTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  }, []);

  const triggerVibration = useCallback(() => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 150, 50, 200]);
      }
    } catch (error) {
      console.log('Vibration not supported:', error);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      playCelebrationSound();
      triggerVibration();
    }
  }, [open, playCelebrationSound, triggerVibration]);

  if (!open) return null;

  const message = getMilestoneMessage(milestoneValue, milestoneType);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
        >
          {/* Confetti effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(60)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: -20, opacity: 1 }}
                  animate={{ 
                    y: window.innerHeight + 50,
                    rotate: Math.random() * 720,
                  }}
                  transition={{ 
                    duration: 2.5 + Math.random() * 2,
                    delay: Math.random() * 0.6,
                    ease: "easeOut"
                  }}
                  style={{
                    position: 'absolute',
                    left: `${Math.random() * 100}%`,
                    backgroundColor: ['#ff6f3b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b6b', '#9b59b6'][Math.floor(Math.random() * 6)],
                    width: `${Math.random() * 10 + 5}px`,
                    height: `${Math.random() * 10 + 5}px`,
                    borderRadius: Math.random() > 0.5 ? '50%' : '0',
                  }}
                />
              ))}
            </div>
          )}

          {/* Main content */}
          <div className="flex flex-col items-center gap-6 px-6 text-center max-h-screen py-8 z-10">
            {/* Remi Image */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ 
                scale: 1, 
                rotate: [0, -5, 5, -5, 0]
              }}
              transition={{ 
                scale: { delay: 0.2, duration: 0.5, type: "spring" },
                rotate: { delay: 0.7, duration: 0.6, repeat: 2, repeatDelay: 1.5 }
              }}
              className="flex-shrink-0"
            >
              <img 
                src={remiImage} 
                alt="Remi celebrating" 
                className="w-48 h-auto max-h-52 object-contain"
              />
            </motion.div>

            {/* Milestone number */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-5xl font-bold text-foreground"
            >
              {milestoneValue}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="text-2xl font-bold text-foreground"
            >
              {milestoneType === 'hellos' ? 'Hellos' : 'Names'} Milestone!
            </motion.h1>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
              className="text-lg text-muted-foreground max-w-xs"
            >
              {message}
            </motion.p>

            {/* Continue Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="w-full max-w-xs mt-4"
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

// Milestone thresholds
export const HELLO_MILESTONES = [10, 25, 50, 75, 100, 200, 300, 400, 500];
export const NAME_MILESTONES = [10, 25, 50, 75, 100, 200, 300, 400, 500];

// Helper to check if a milestone was just reached
export const checkMilestoneReached = (
  previousCount: number,
  newCount: number,
  milestones: number[]
): number | null => {
  for (const milestone of milestones) {
    if (previousCount < milestone && newCount >= milestone) {
      return milestone;
    }
  }
  return null;
};
