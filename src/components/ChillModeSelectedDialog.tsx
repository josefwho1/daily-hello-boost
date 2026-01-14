import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import remiMascot from "@/assets/remi-waving.webp";

interface ChillModeSelectedDialogProps {
  open: boolean;
  onContinue: () => void;
}

export const ChillModeSelectedDialog = ({ open, onContinue }: ChillModeSelectedDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-full w-full h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] sm:max-w-full sm:rounded-none border-none bg-gradient-to-b from-background via-background to-primary/10 overflow-hidden p-0 m-0 top-0 translate-y-0 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center justify-center h-full px-6 py-8 relative overflow-y-auto">
          <motion.div 
            className="text-center max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.img
              src={remiMascot}
              alt="Remi"
              className="w-28 h-auto max-h-28 object-contain mx-auto mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            />
            
            <motion.h2 
              className="text-2xl font-bold text-foreground mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Chill Mode activated.
            </motion.h2>
            
            <motion.div 
              className="text-foreground/70 space-y-4 mb-8 bg-muted/30 rounded-2xl p-5"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p>5 Hellos per week - any day, any time.</p>
              <p>Hit your 5 to keep your weekly streak going.</p>
              <p>Miss a week? Use an Orb to save it 🔮</p>
              <p>No pressure. Just connection at your pace.</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button onClick={onContinue} className="w-full" size="lg">
                I'm ready ✨
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
