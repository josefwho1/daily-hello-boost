import { useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { vibrateCelebration } from "@/lib/haptics";

import remiCongrats1 from "@/assets/remi-congrats-1.webp";
import remiCongrats2 from "@/assets/remi-congrats-2.webp";
import remiCongrats3 from "@/assets/remi-congrats-3.webp";
import remiCelebrating1 from "@/assets/remi-celebrating-1.webp";
import remiCelebrating2 from "@/assets/remi-celebrating-2.webp";
import remiCelebrating3 from "@/assets/remi-celebrating-3.webp";

const images = [remiCongrats1, remiCongrats2, remiCongrats3, remiCelebrating1, remiCelebrating2, remiCelebrating3];

interface ChallengeDayCelebrationDialogProps {
  open: boolean;
  onContinue: () => void;
  dayNumber: number;
  challengeName: string;
}

const getDayMessage = (day: number): string => {
  switch (day) {
    case 1: return "You took the first step!";
    case 2: return "Two days in — you're building momentum!";
    case 3: return "Halfway there, keep it up!";
    case 4: return "Kindness looks good on you!";
    case 5: return "Five down, you're almost there!";
    case 6: return "One more to go!";
    case 7: return "You completed the whole challenge!";
    default: return "Amazing work!";
  }
};

export const ChallengeDayCelebrationDialog = ({
  open,
  onContinue,
  dayNumber,
  challengeName,
}: ChallengeDayCelebrationDialogProps) => {
  const remiImage = useMemo(
    () => images[Math.floor(Math.random() * images.length)],
    []
  );

  const playChime = useCallback(() => {
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      // Ascending 3-note chime
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
        gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
        gain.gain.linearRampToValueAtTime(0, t + 0.28);
        osc.start(t);
        osc.stop(t + 0.28);
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (open) {
      playChime();
      vibrateCelebration();
    }
  }, [open, playChime]);

  if (!open) return null;

  const message = getDayMessage(dayNumber);

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

            {/* Day badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex items-center gap-2"
            >
              <span className="text-4xl font-bold text-primary">Day {dayNumber}</span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-3xl"
              >
                ✅
              </motion.span>
            </motion.div>

            {/* Challenge name */}
            <motion.h1
              className="text-xl font-bold text-foreground"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.35 }}
            >
              {challengeName}
            </motion.h1>

            {/* Message */}
            <motion.p
              className="text-lg text-muted-foreground max-w-xs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.35 }}
            >
              {message}
            </motion.p>

            {/* Button */}
            <motion.div
              className="w-full max-w-xs mt-3"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.35 }}
            >
              <Button onClick={onContinue} className="w-full" size="lg">
                {dayNumber === 7 ? "Amazing!" : "Keep Going!"}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
