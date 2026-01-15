import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiMascot from "@/assets/remi-waving.webp";
import orbImage from "@/assets/orb.webp";

export type StreakSaverScenario = 
  | 'can_save' // missed_days 1-2, has orbs
  | 'no_orbs'  // missed_days 1-2, no orbs (gift an orb)
  | 'fresh_start'; // missed_days >= 3, cannot be saved

interface StreakSaverDialogProps {
  open: boolean;
  onClose: () => void;
  scenario: StreakSaverScenario;
  orbsAvailable: number;
  missedDays: number;
  previousStreak: number;
  onUseOrb: () => void;
  onLetReset: () => void;
  onAcceptGift: () => void;
  onFreshStart: () => void;
}

export const StreakSaverDialog = ({ 
  open, 
  onClose,
  scenario,
  orbsAvailable,
  missedDays,
  previousStreak,
  onUseOrb,
  onLetReset,
  onAcceptGift,
  onFreshStart,
}: StreakSaverDialogProps) => {
  
  if (scenario === 'can_save') {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={remiMascot} alt="Remi" className="w-20 h-auto max-h-20 object-contain" />
            </div>
            <DialogTitle className="text-xl flex items-center justify-center gap-2">
              Save your streak?
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              You missed the last {missedDays === 1 ? 'day' : 'couple days'}. Use 1 orb to keep your {previousStreak}-day streak alive!
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center gap-3 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
            <img src={orbImage} alt="Orb" className="w-6 h-6 object-contain" />
            <span className="font-medium">Orbs available: {orbsAvailable}</span>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onLetReset}
            >
              Let it reset
            </Button>
            <Button
              className="flex-1"
              onClick={onUseOrb}
            >
              <img src={orbImage} alt="Orb" className="w-4 h-4 mr-2 object-contain" />
              Use 1 orb (Save streak)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (scenario === 'no_orbs') {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={remiMascot} alt="Remi" className="w-20 h-auto max-h-20 object-contain" />
            </div>
            <DialogTitle className="text-xl">
              Your streak has been reset
            </DialogTitle>
            <DialogDescription className="text-center pt-2 space-y-2">
              <p>You missed {missedDays === 1 ? 'a day' : 'the last couple days'} and didn't have an orb to save your {previousStreak}-day streak.</p>
              <p className="text-primary font-medium">Here's a gift orb to help you next time! 🎁</p>
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
            <img src={orbImage} alt="Orb" className="w-10 h-10 object-contain animate-pulse" />
            <span className="font-medium text-lg">+1 Orb</span>
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              onClick={onAcceptGift}
            >
              Thanks, Remi! ✨
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // scenario === 'fresh_start'
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src={remiMascot} alt="Remi" className="w-20 h-auto max-h-20 object-contain" />
          </div>
          <DialogTitle className="text-xl">
            Fresh start! 🌱
          </DialogTitle>
          <DialogDescription className="text-center pt-2 space-y-2">
            <p>It's been a few days since your last hello. Your streak has been reset, but that's okay!</p>
            <p>Every hello is a new opportunity. Let's start building your streak again!</p>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button
            className="w-full"
            onClick={onFreshStart}
          >
            Let's go! 💪
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
