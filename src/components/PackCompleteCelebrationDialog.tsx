import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// Remi Congrats images
import remiCongrats1 from "@/assets/remi-congrats-1.webp";
import remiCongrats2 from "@/assets/remi-congrats-2.webp";
import remiCongrats3 from "@/assets/remi-congrats-3.webp";

const remiCongratsImages = [remiCongrats1, remiCongrats2, remiCongrats3];

const getRandomImage = (images: string[]) => {
  return images[Math.floor(Math.random() * images.length)];
};

interface PackCompleteCelebrationDialogProps {
  open: boolean;
  onContinue: () => void;
  packName: string;
}

export const PackCompleteCelebrationDialog = ({
  open,
  onContinue,
  packName,
}: PackCompleteCelebrationDialogProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const remiImage = useMemo(() => getRandomImage(remiCongratsImages), []);

  const playCelebrationSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      // Triumphant fanfare notes
      const notes = [392, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        const startTime = audioContext.currentTime + (index * 0.12);
        const duration = 0.4;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
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
        navigator.vibrate([100, 50, 100, 50, 100, 50, 200]);
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
              {[...Array(80)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute animate-confetti"
                  initial={{ y: -20, opacity: 1 }}
                  animate={{ 
                    y: window.innerHeight + 50,
                    rotate: Math.random() * 720,
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut"
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    backgroundColor: ['#ff6f3b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b6b', '#9b59b6'][Math.floor(Math.random() * 6)],
                    width: `${Math.random() * 12 + 6}px`,
                    height: `${Math.random() * 12 + 6}px`,
                    borderRadius: Math.random() > 0.5 ? '50%' : '0',
                  }}
                />
              ))}
            </div>
          )}

          {/* Sparkle particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
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
                  duration: 2.5 + Math.random() * 1.5,
                  delay: Math.random() * 0.8,
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatDelay: Math.random() * 0.5
                }}
                className="absolute text-3xl"
              >
                {['✨', '🎉', '⭐', '🏆', '🌟'][i % 5]}
              </motion.div>
            ))}
          </div>

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
                className="w-56 h-auto max-h-60 object-contain"
              />
            </motion.div>

            {/* Trophy */}
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
              className="text-6xl"
            >
              🏆
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-3xl font-bold text-foreground"
            >
              Challenge Pack Complete!
            </motion.h1>

            {/* Body text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="flex flex-col items-center gap-2 max-w-xs"
            >
              <p className="text-lg text-muted-foreground">
                You've completed the <span className="font-semibold text-primary">{packName}</span>!
              </p>
              <p className="text-muted-foreground">
                7/7 challenges done. Amazing work! 🌟
              </p>
            </motion.div>

            {/* Progress dots */}
            <motion.div 
              className="flex justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold"
                >
                  ✓
                </motion.div>
              ))}
            </motion.div>

            {/* Continue Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.4 }}
              className="w-full max-w-xs mt-4"
            >
              <Button onClick={onContinue} className="w-full" size="lg">
                Continue 🚀
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
