import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface DailyModeReminderBannerProps {
  type: 'morning' | 'afternoon';
  onDismiss: () => void;
}

export const DailyModeReminderBanner = ({
  type,
  onDismiss,
}: DailyModeReminderBannerProps) => {
  const [visible, setVisible] = useState(true);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  const content = type === 'morning' 
    ? "☀️ Good morning! Don't forget today's hello."
    : "🦝 You haven't logged a hello yet today—still time!";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "w-full rounded-xl px-4 py-3 mb-4",
            "flex items-center justify-between gap-3",
            type === 'morning' 
              ? "bg-gradient-to-r from-amber-400/20 to-orange-400/20 border border-amber-400/30"
              : "bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30"
          )}
        >
          <span className="text-sm font-medium text-foreground flex-1">
            {content}
          </span>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-full hover:bg-background/50 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
