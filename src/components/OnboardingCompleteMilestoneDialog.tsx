import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import remiCelebrating from "@/assets/remi-celebrating-3.webp";
import remiHoldingOrb from "@/assets/remi-holding-orb.webp";
import orbImage from "@/assets/orb.webp";

interface OnboardingCompleteMilestoneDialogProps {
  open: boolean;
  onContinue: () => void;
}

type AnimationPhase = 'celebration' | 'orb_reward' | 'welcome';

export const OnboardingCompleteMilestoneDialog = ({
  open,
  onContinue,
}: OnboardingCompleteMilestoneDialogProps) => {
  const [phase, setPhase] = useState<AnimationPhase>('celebration');
  const [showSkip, setShowSkip] = useState(false);

  // Reset and run animation sequence
  useEffect(() => {
    if (open) {
      setPhase('celebration');
      setShowSkip(false);
      // Show skip button after 1 second
      const skipTimer = setTimeout(() => setShowSkip(true), 1000);
      const timer1 = setTimeout(() => setPhase('orb_reward'), 2500);
      const timer2 = setTimeout(() => setPhase('welcome'), 5000);
      return () => {
        clearTimeout(skipTimer);
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [open]);

  // Play sound effects
  useEffect(() => {
    if (!open) return;
    
    const playSound = (notes: number[], delay = 0) => {
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
    };

    if (phase === 'celebration') {
      playSound([523.25, 659.25, 783.99, 1046.50]); // C5, E5, G5, C6
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100, 50, 200]);
    } else if (phase === 'orb_reward') {
      playSound([392, 523.25, 659.25, 783.99], 0.3); // G4, C5, E5, G5
      if ('vibrate' in navigator) navigator.vibrate([50, 30, 100]);
    }
  }, [phase, open]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-full w-full h-full max-h-full sm:max-w-full sm:rounded-none border-none bg-gradient-to-b from-background via-background to-primary/10 overflow-hidden p-0 m-0 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 relative overflow-hidden">
          
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

            {phase === 'orb_reward' && (
              <motion.div
                key="orb_reward"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="text-center"
              >
                <motion.div 
                  className="relative inline-block mb-6"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <img 
                    src={orbImage} 
                    alt="Orb" 
                    className="w-40 h-40 object-contain mx-auto"
                  />
                  {/* Sparkles around orb */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        top: '50%',
                        left: '50%',
                      }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5],
                        x: [0, Math.cos(i * 60 * Math.PI / 180) * 70],
                        y: [0, Math.sin(i * 60 * Math.PI / 180) * 70],
                      }}
                      transition={{ 
                        duration: 1.5, 
                        delay: i * 0.1,
                        repeat: Infinity
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                    </motion.div>
                  ))}
                </motion.div>

                <motion.h2 
                  className="text-2xl font-bold text-foreground mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Bonus Orb Earned! 🔮
                </motion.h2>

                <motion.p 
                  className="text-foreground/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  A reward for completing your initiation!
                </motion.p>
              </motion.div>
            )}

            {phase === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center max-w-sm"
              >
                <motion.img 
                  src={remiHoldingOrb} 
                  alt="Remi with Orb" 
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
