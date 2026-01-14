import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, Leaf } from "lucide-react";
import { motion } from "framer-motion";

interface ModeSelectionDialogProps {
  open: boolean;
  onSelectMode: (mode: 'daily' | 'chill') => void;
}

export const ModeSelectionDialog = ({ open, onSelectMode }: ModeSelectionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-full w-full h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] sm:max-w-full sm:rounded-none border-none bg-gradient-to-b from-background via-background to-primary/10 overflow-hidden p-0 m-0 top-0 translate-y-0 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center justify-center h-full px-6 py-8 relative overflow-y-auto">
          <motion.div 
            className="w-full max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div 
              className="text-center mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Choose Your Mode
              </h2>
              <p className="text-foreground/70">
                Pick the pace that works best for you
              </p>
            </motion.div>
              
            <div className="space-y-4">
              {/* Daily Mode */}
              <motion.div 
                className="border-2 border-primary/30 rounded-2xl p-5 bg-primary/5 text-center"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-bold">Daily Mode</h3>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Recommended</span>
                </div>
                
                <p className="text-sm text-muted-foreground italic mb-3">
                  One Hello a Day
                </p>
                
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>• Builds powerful habits</li>
                  <li>• Daily streak + XP boosts</li>
                  <li>• Best way to stay connected</li>
                </ul>
                
                <Button 
                  onClick={() => onSelectMode('daily')} 
                  className="w-full"
                  size="lg"
                >
                  <Flame className="w-4 h-4 mr-2" />
                  Daily Mode
                </Button>
              </motion.div>

              {/* Chill Mode */}
              <motion.div 
                className="border border-border rounded-2xl p-5 text-center"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-bold">Chill Mode</h3>
                </div>
                
                <p className="text-sm text-muted-foreground italic mb-3">
                  5 Hellos per Week
                </p>
                
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  <li>• More flexible</li>
                  <li>• Weekly streak</li>
                  <li>• Perfect for busy schedules</li>
                </ul>
                
                <Button 
                  onClick={() => onSelectMode('chill')} 
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Leaf className="w-4 h-4 mr-2" />
                  Chill Mode
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
