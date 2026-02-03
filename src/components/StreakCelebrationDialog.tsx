import { useEffect, useState, useMemo, useCallback, useRef } from "react";
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

interface StreakCelebrationDialogProps {
  open: boolean;
  onContinue: () => void;
  streakCount: number;
}

const getStreakMessage = (streak: number): string => {
  if (streak >= 100) return "Legendary dedication!";
  if (streak >= 50) return "Unstoppable momentum!";
  if (streak >= 30) return "A whole month of hellos!";
  if (streak >= 14) return "Two weeks strong!";
  if (streak >= 7) return "One week streak!";
  if (streak >= 3) return "You're on a roll!";
  return "Streak started!";
};

// Easing function for smooth animation
const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

export const StreakCelebrationDialog = ({
  open,
  onContinue,
  streakCount,
}: StreakCelebrationDialogProps) => {
  const [displayedNumber, setDisplayedNumber] = useState(streakCount - 1);
  const [animationComplete, setAnimationComplete] = useState(false);
  const animationRef = useRef<number | null>(null);
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
    } catch {
      // Audio not supported - silent fail
    }
  }, []);

  const triggerVibration = useCallback(() => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 150, 50, 200]);
      }
    } catch {
      // Vibration not supported - silent fail
    }
  }, []);

  // Animate the number from (streakCount - 1) to streakCount
  useEffect(() => {
    if (open) {
      const startValue = Math.max(0, streakCount - 1);
      const endValue = streakCount;
      const duration = 800; // ms
      const startTime = performance.now();
      
      setDisplayedNumber(startValue);
      setAnimationComplete(false);
      
      // Delay the animation start to sync with UI appearance
      const timeoutId = setTimeout(() => {
        playCelebrationSound();
        triggerVibration();
        
        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime - 600; // Account for delay
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeOutQuart(progress);
          
          const currentValue = startValue + (endValue - startValue) * easedProgress;
          setDisplayedNumber(Math.round(currentValue));
          
          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            setAnimationComplete(true);
          }
        };
        
        animationRef.current = requestAnimationFrame(animate);
      }, 600);
      
      return () => {
        clearTimeout(timeoutId);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [open, streakCount, playCelebrationSound, triggerVibration]);

  if (!open) return null;

  const message = getStreakMessage(streakCount);
  const previousStreak = Math.max(0, streakCount - 1);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
        >
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
                loading="lazy"
              />
            </motion.div>

            {/* Animated streak counter */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring" }}
              className="flex flex-col items-center gap-2"
            >
              {/* Number transition display */}
              <div className="flex items-center gap-3">
                <motion.span
                  initial={{ opacity: 1 }}
                  animate={{ opacity: animationComplete ? 0.4 : 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-5xl font-bold text-muted-foreground"
                >
                  {previousStreak}
                </motion.span>
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  className="text-3xl text-primary"
                >
                  →
                </motion.span>
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: animationComplete ? [1, 1.15, 1] : 1,
                  }}
                  transition={{ 
                    scale: { delay: animationComplete ? 0 : 1.4, duration: 0.4, type: "spring" }
                  }}
                  className="text-6xl font-bold text-primary"
                >
                  {displayedNumber}
                </motion.span>
              </div>
              
              {/* Fire emoji */}
              <motion.span 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="text-4xl"
              >
                🔥
              </motion.span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="text-2xl font-bold text-foreground"
            >
              Day {streakCount} Streak!
            </motion.h1>

            {/* Message */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="text-lg text-muted-foreground max-w-xs"
            >
              {message}
            </motion.p>

            {/* Continue Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.4 }}
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
