import { useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import remiCelebrating1 from "@/assets/remi-celebrating-1.webp";
import remiCelebrating2 from "@/assets/remi-celebrating-2.webp";
import remiCelebrating3 from "@/assets/remi-celebrating-3.webp";

const images = [remiCelebrating1, remiCelebrating2, remiCelebrating3];

interface FirstHelloCelebrationDialogProps {
  open: boolean;
  onContinue: () => void;
  userName?: string;
}

export const FirstHelloCelebrationDialog = ({
  open,
  onContinue,
  userName = "Friend",
}: FirstHelloCelebrationDialogProps) => {
  const remiImage = useMemo(
    () => images[Math.floor(Math.random() * images.length)],
    []
  );

  const playChime = useCallback(() => {
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        const t = ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.04);
        gain.gain.linearRampToValueAtTime(0, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (open) {
      playChime();
      try {
        navigator?.vibrate?.([60, 80, 100]);
      } catch {}
    }
  }, [open, playChime]);

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
          <div className="flex flex-col items-center gap-5 px-6 text-center z-10">
            {/* Remi */}
            <motion.img
              src={remiImage}
              alt="Remi celebrating"
              className="w-44 h-auto max-h-48 object-contain"
              initial={{ scale: 0, rotate: -8 }}
              animate={{ scale: 1, rotate: [0, -4, 4, 0] }}
              transition={{
                scale: { delay: 0.15, duration: 0.5, type: "spring" },
                rotate: { delay: 0.6, duration: 0.5 },
              }}
            />

            {/* Emoji */}
            <motion.span
              className="text-4xl"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              👋
            </motion.span>

            {/* Title */}
            <motion.h1
              className="text-2xl font-bold text-foreground"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.35 }}
            >
              Your First Hello!
            </motion.h1>

            {/* Message */}
            <motion.p
              className="text-lg text-muted-foreground max-w-xs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.35 }}
            >
              Nice one, {userName}! Every connection starts with a single hello.
            </motion.p>

            {/* Button */}
            <motion.div
              className="w-full max-w-xs mt-3"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.35 }}
            >
              <Button onClick={onContinue} className="w-full" size="lg">
                Let's Go!
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
