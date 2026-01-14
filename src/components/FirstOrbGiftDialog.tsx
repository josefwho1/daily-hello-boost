import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import remiHoldingOrb from "@/assets/remi-holding-orb.webp";
import orbImage from "@/assets/orb.webp";

interface FirstOrbGiftDialogProps {
  open: boolean;
  onClaim: () => void;
  username?: string;
}

type AnimationPhase = 'intro' | 'orb_reveal' | 'explanation';

export const FirstOrbGiftDialog = ({ open, onClaim, username = "" }: FirstOrbGiftDialogProps) => {
  const [phase, setPhase] = useState<AnimationPhase>('intro');
  const [showSkip, setShowSkip] = useState(false);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setPhase('intro');
      setShowSkip(false);
      // Show skip button after 1 second
      const skipTimer = setTimeout(() => setShowSkip(true), 1000);
      // Transition through phases
      const timer1 = setTimeout(() => setPhase('orb_reveal'), 1500);
      const timer2 = setTimeout(() => setPhase('explanation'), 3000);
      return () => {
        clearTimeout(skipTimer);
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [open]);

  // Play sound effect
  useEffect(() => {
    if (phase === 'orb_reveal') {
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
        notes.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.value = freq;
          oscillator.type = 'sine';
          const startTime = audioContext.currentTime + (index * 0.15);
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.05);
          gainNode.gain.linearRampToValueAtTime(0, startTime + 0.4);
          oscillator.start(startTime);
          oscillator.stop(startTime + 0.4);
        });
        // Vibration
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 30, 100]);
        }
      } catch (e) {
        console.log('Audio not supported:', e);
      }
    }
  }, [phase]);

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
            {showSkip && phase !== 'explanation' && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClaim}
                className="absolute top-4 right-4 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                Skip →
              </motion.button>
            )}
          </AnimatePresence>
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {phase !== 'intro' && [...Array(15)].map((_, i) => (
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
                  y: [0, -80]
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
            {phase === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="text-center"
              >
                <motion.h2 
                  className="text-3xl font-bold text-foreground mb-4"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  🎉 Congrats{username ? `, ${username}` : ''}!
                </motion.h2>
                <p className="text-xl text-foreground/80">
                  You completed your First Hello!
                </p>
              </motion.div>
            )}

            {phase === 'orb_reveal' && (
              <motion.div
                key="orb_reveal"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
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
                  className="text-2xl font-bold text-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Here's a gift for you!
                </motion.h2>
              </motion.div>
            )}

            {phase === 'explanation' && (
              <motion.div
                key="explanation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center max-w-sm"
              >
                <motion.img 
                  src={remiHoldingOrb} 
                  alt="Remi with Orb" 
                  className="w-36 h-auto max-h-36 object-contain mx-auto mb-6"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                />

                <motion.h2 
                  className="text-2xl font-bold text-foreground mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  You earned an Orb! 🔮
                </motion.h2>

                <motion.div 
                  className="bg-gradient-to-r from-primary/10 to-primary/20 rounded-2xl p-5 mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-foreground/80 text-base mb-3">
                    Orbs are magical safety nets for your streak!
                  </p>
                  <p className="text-foreground/70 text-sm">
                    If you miss a day, use an Orb to keep your streak alive. 
                    You can hold up to 3 at a time.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button 
                    onClick={onClaim}
                    className="w-full"
                    size="lg"
                  >
                    I love Orbs! 🔮
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
