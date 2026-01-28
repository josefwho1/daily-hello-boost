import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import remiCelebrating from "@/assets/remi-celebrating-3.webp";

interface OnboardingCompleteMilestoneDialogProps {
  open: boolean;
  onContinue: () => void;
}

type AnimationPhase = 'celebration' | 'welcome';

export const OnboardingCompleteMilestoneDialog = ({
  open,
  onContinue,
}: OnboardingCompleteMilestoneDialogProps) => {
  const [phase, setPhase] = useState<AnimationPhase>('celebration');
  const [showSkip, setShowSkip] = useState(false);

  // Play sound
  const playSound = useCallback((notes: number[], delay = 0) => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        const startTime = audioContext.currentTime + delay + (index * 0.12);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.04);
        gainNode.gain.linearRampToValueAtTime(0, startTime + 0.35);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.35);
      });
    } catch (e) {
      console.log('Audio not supported:', e);
    }
  }, []);

  // Trigger vibration
  const triggerVibration = useCallback((pattern: number[]) => {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (e) {
      console.log('Vibration not supported:', e);
    }
  }, []);

  // Reset and run animation sequence
  useEffect(() => {
    if (open) {
      setPhase('celebration');
      setShowSkip(false);
      
      const skipTimer = setTimeout(() => setShowSkip(true), 1000);
      const timer1 = setTimeout(() => setPhase('welcome'), 3000);
      
      return () => {
        clearTimeout(skipTimer);
        clearTimeout(timer1);
      };
    }
  }, [open]);

  // Sound effects for each phase
  useEffect(() => {
    if (!open) return;
    
    if (phase === 'celebration') {
      playSound([523.25, 659.25, 783.99, 1046.50]);
      triggerVibration([100, 50, 100, 50, 200]);
    }
  }, [phase, open, playSound, triggerVibration]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-full w-full h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] sm:max-w-full sm:rounded-none border-none bg-gradient-to-b from-background via-background to-primary/10 overflow-hidden p-0 m-0 top-0 translate-y-0 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center justify-center h-full px-6 py-8 relative overflow-hidden">
          
          {/* Skip button */}
          <AnimatePresence>
            {showSkip && phase !== 'welcome' && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onContinue}
                className="absolute top-4 right-4 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                Skip →
              </motion.button>
            )}
          </AnimatePresence>

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-primary/40"
                style={{ 
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  scale: [0, 1.5, 0],
                  y: [0, -100]
                }}
                transition={{ 
                  duration: 2.5,
                  delay: Math.random() * 0.8,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2
                }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Phase 1: Celebration */}
            {phase === 'celebration' && (
              <motion.div
                key="celebration"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -50 }}
                className="text-center"
              >
                <motion.img 
                  src={remiCelebrating} 
                  alt="Remi celebrating" 
                  className="w-36 h-auto max-h-36 object-contain mx-auto mb-6"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 3, -3, 0]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />

                <motion.h2 
                  className="text-3xl font-bold text-foreground mb-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  🎉 Congratulations! 🎉
                </motion.h2>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-xl font-semibold text-primary mb-2">
                    Initiation Complete!
                  </p>
                  <p className="text-foreground/70">
                    You can officially turn strangers into friends.
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* Phase 2: Welcome */}
            {phase === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center max-w-sm"
              >
                <motion.img 
                  src={remiCelebrating} 
                  alt="Remi celebrating" 
                  className="w-32 h-auto max-h-32 object-contain mx-auto mb-6"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                />

                <motion.h2 
                  className="text-2xl font-bold text-foreground mb-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Welcome to the Gaze 🦝
                </motion.h2>

                <motion.p 
                  className="text-sm text-muted-foreground mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  (that's what a group of raccoons is called!)
                </motion.p>

                <motion.div 
                  className="bg-gradient-to-r from-primary/10 to-primary/20 rounded-2xl p-4 mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-foreground/80 text-sm">
                    Now it's time to choose how you want to continue your journey...
                  </p>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button 
                    onClick={onContinue}
                    className="w-full"
                    size="lg"
                  >
                    Choose My Mode 🚀
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
