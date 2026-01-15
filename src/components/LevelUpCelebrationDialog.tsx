import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getRankFromLevel, formatXp, getXpProgress, LEVEL_XP_THRESHOLDS } from "@/lib/xpSystem";
import { Trophy, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Remi Celebrating images
import remiCelebrating1 from "@/assets/remi-celebrating-1.webp";
import remiCelebrating2 from "@/assets/remi-celebrating-2.webp";
import remiCelebrating3 from "@/assets/remi-celebrating-3.webp";
import remiCelebrating4 from "@/assets/remi-celebrating-4.webp";

const remiCelebratingImages = [remiCelebrating1, remiCelebrating2, remiCelebrating3, remiCelebrating4];

const getRandomImage = (images: string[]) => {
  return images[Math.floor(Math.random() * images.length)];
};

interface LevelUpCelebrationDialogProps {
  open: boolean;
  onClose: () => void;
  newLevel: number;
  totalXp: number;
}

type AnimationPhase = 'loading' | 'leveling' | 'celebration';

export const LevelUpCelebrationDialog = ({ 
  open, 
  onClose, 
  newLevel, 
  totalXp 
}: LevelUpCelebrationDialogProps) => {
  const [celebratingImage] = useState(() => getRandomImage(remiCelebratingImages));
  const [phase, setPhase] = useState<AnimationPhase>('loading');
  const [progressPercent, setProgressPercent] = useState(0);
  const [displayedLevel, setDisplayedLevel] = useState(newLevel - 1);
  const [showSkip, setShowSkip] = useState(false);
  
  const previousLevel = newLevel - 1;
  const rank = getRankFromLevel(newLevel);
  const previousRank = getRankFromLevel(previousLevel);
  const progress = getXpProgress(totalXp, newLevel);

  // Play celebration sound
  const playCelebrationSound = useCallback(() => {
    try {
      // Create a simple celebration sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Play a rising arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const startTime = audioContext.currentTime + (index * 0.1);
        const duration = 0.3;
        
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

  // Trigger vibration
  const triggerVibration = useCallback(() => {
    try {
      if ('vibrate' in navigator) {
        // Celebration pattern: short bursts
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
    } catch (error) {
      console.log('Vibration not supported:', error);
    }
  }, []);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setPhase('loading');
      setProgressPercent(0);
      setDisplayedLevel(previousLevel);
      setShowSkip(false);
      // Show skip button after 1 second
      const skipTimer = setTimeout(() => setShowSkip(true), 1000);
      return () => clearTimeout(skipTimer);
    }
  }, [open, previousLevel]);

  // Animation sequence
  useEffect(() => {
    if (!open) return;

    // Phase 1: Loading bar animation (0% to 100%)
    const loadingTimer = setTimeout(() => {
      setProgressPercent(100);
    }, 300);

    // Phase 2: Trigger leveling up state
    const levelingTimer = setTimeout(() => {
      setPhase('leveling');
      playCelebrationSound();
      triggerVibration();
    }, 1500);

    // Phase 3: Update level number
    const levelUpdateTimer = setTimeout(() => {
      setDisplayedLevel(newLevel);
    }, 1800);

    // Phase 4: Show celebration
    const celebrationTimer = setTimeout(() => {
      setPhase('celebration');
    }, 2500);

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(levelingTimer);
      clearTimeout(levelUpdateTimer);
      clearTimeout(celebrationTimer);
    };
  }, [open, newLevel, playCelebrationSound, triggerVibration]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-full w-full h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] sm:max-w-full sm:rounded-none border-none bg-gradient-to-b from-background via-background to-primary/10 overflow-hidden p-0 m-0 top-0 translate-y-0 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center justify-center h-full px-6 py-8 relative">
          
          {/* Skip button - bottom right */}
          <AnimatePresence>
            {showSkip && phase !== 'celebration' && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute bottom-4 right-4 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                Skip →
              </motion.button>
            )}
          </AnimatePresence>
          {/* Floating particles background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {phase === 'celebration' && (
              <>
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: rank.color,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      y: [0, -100]
                    }}
                    transition={{ 
                      duration: 2,
                      delay: Math.random() * 0.5,
                      repeat: Infinity,
                      repeatDelay: Math.random() * 2
                    }}
                  />
                ))}
              </>
            )}
          </div>

          {/* Remi Image - Always on top */}
          <motion.div 
            className="mb-2"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 10, stiffness: 100 }}
          >
            <img 
              src={celebratingImage} 
              alt="Remi celebrating" 
              className="w-28 h-auto max-h-28 mx-auto object-contain"
            />
          </motion.div>

          {/* Level Badge - Always below Remi */}
          <motion.div 
            className="relative mb-4"
            animate={phase === 'leveling' ? {
              scale: [1, 1.2, 0.9, 1.1, 1],
              rotate: [0, -5, 5, -3, 3, 0],
            } : {}}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <motion.div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-primary-foreground font-bold text-4xl shadow-2xl relative"
              style={{ 
                backgroundColor: phase === 'celebration' ? rank.color : previousRank.color,
                boxShadow: `0 0 ${phase === 'leveling' ? '60px' : '30px'} ${phase === 'celebration' ? rank.color : previousRank.color}50`
              }}
              animate={phase === 'leveling' ? {
                boxShadow: [
                  `0 0 30px ${previousRank.color}50`,
                  `0 0 80px ${rank.color}80`,
                  `0 0 40px ${rank.color}60`
                ]
              } : {}}
              transition={{ duration: 0.6 }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={displayedLevel}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {displayedLevel}
                </motion.span>
              </AnimatePresence>
              
              {/* Sparkle effects during leveling */}
              {phase === 'leveling' && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        top: '50%',
                        left: '50%',
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        x: [0, Math.cos(i * 45 * Math.PI / 180) * 80],
                        y: [0, Math.sin(i * 45 * Math.PI / 180) * 80],
                      }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                    >
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Progress bar section */}
          <div className="w-full max-w-xs mb-8">
            <AnimatePresence mode="wait">
              {phase === 'loading' && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  <p className="text-lg font-semibold text-foreground mb-3">
                    Level {previousLevel}
                  </p>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full rounded-full"
                      style={{ backgroundColor: previousRank.color }}
                      initial={{ width: '60%' }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Loading XP...
                  </p>
                </motion.div>
              )}

              {phase === 'leveling' && (
                <motion.div
                  key="leveling"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="text-center"
                >
                  <motion.h2 
                    className="text-3xl font-bold text-foreground"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      color: [previousRank.color, rank.color]
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    LEVELING UP!
                  </motion.h2>
                </motion.div>
              )}

              {phase === 'celebration' && (
                <motion.div
                  key="celebration"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >

                  <motion.h2 
                    className="text-3xl font-bold text-foreground mb-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    🎉 Level Up!
                  </motion.h2>

                  <motion.p 
                    className="text-xl font-semibold mb-1" 
                    style={{ color: rank.color }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {rank.emoji} {rank.name}
                  </motion.p>

                  <motion.p 
                    className="text-foreground/70 text-base mb-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    You've reached Level {newLevel}!
                  </motion.p>

                  {/* XP Badge */}
                  <motion.div 
                    className="bg-gradient-to-r from-primary/10 to-primary/20 rounded-2xl p-4 mb-6"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      <span className="font-bold text-foreground">{formatXp(totalXp)} XP</span>
                    </div>
                    
                    {/* Progress to next level */}
                    {newLevel < 100 && (
                      <div className="space-y-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full rounded-full"
                            style={{ backgroundColor: rank.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.percent}%` }}
                            transition={{ duration: 1, delay: 0.6 }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatXp(progress.current)} / {formatXp(progress.needed)} to Level {newLevel + 1}
                        </p>
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button 
                      onClick={onClose}
                      className="w-full max-w-xs"
                      size="lg"
                    >
                      Keep Going! 🚀
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
