import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import all Remi celebrating images
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
  remiCelebrating1,
  remiCelebrating2,
  remiCelebrating3,
  remiCelebrating4,
  remiCelebrating5,
  remiCelebrating6,
  remiCelebrating7,
  remiCelebrating8,
  remiCelebrating9,
  remiCelebrating10,
];

interface DailyModeHomeCardProps {
  todaysHelloCount: number;
  currentStreak: number;
  hasLoggedToday: boolean;
}

export const DailyModeHomeCard = ({
  todaysHelloCount,
  currentStreak,
  hasLoggedToday,
}: DailyModeHomeCardProps) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationImage, setCelebrationImage] = useState(remiCelebratingImages[0]);
  const [previousStreak, setPreviousStreak] = useState(currentStreak);

  // Detect streak increment and trigger celebration
  useEffect(() => {
    if (currentStreak > previousStreak && previousStreak > 0) {
      // Pick a random Remi celebrating image
      const randomIndex = Math.floor(Math.random() * remiCelebratingImages.length);
      setCelebrationImage(remiCelebratingImages[randomIndex]);
      setShowCelebration(true);
      
      // Hide celebration after animation
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
    setPreviousStreak(currentStreak);
  }, [currentStreak, previousStreak]);

  return (
    <Card className="p-4 rounded-xl bg-card border-border/50 mb-6 relative overflow-hidden">
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 rounded-xl"
          >
            <div className="flex flex-col items-center gap-2">
              <motion.img
                src={celebrationImage}
                alt="Remi celebrating"
                className="w-20 h-20 object-contain"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <p className="text-lg font-bold text-primary">+1 Day! 🔥</p>
                <p className="text-sm text-muted-foreground">Streak: {currentStreak} days</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <span className="font-bold text-foreground text-base">Daily Mode</span>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Today:</span>
            {hasLoggedToday ? (
              <span className="flex items-center gap-1 text-base font-bold text-success">
                <Check className="w-4 h-4" />
                {todaysHelloCount}
              </span>
            ) : (
              <span className="text-base font-bold text-destructive">0</span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Streak:</span>
            <span className="text-lg font-bold text-foreground">
              {currentStreak} 🔥
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
