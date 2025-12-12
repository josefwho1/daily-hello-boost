import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getRankFromLevel, formatXp, getXpProgress } from "@/lib/xpSystem";
import remiCelebrating from "@/assets/remi-orb-celebration.webp";
import { Trophy, User } from "lucide-react";

interface LevelUpCelebrationDialogProps {
  open: boolean;
  onClose: () => void;
  newLevel: number;
  totalXp: number;
}

export const LevelUpCelebrationDialog = ({ 
  open, 
  onClose, 
  newLevel, 
  totalXp 
}: LevelUpCelebrationDialogProps) => {
  const rank = getRankFromLevel(newLevel);
  const progress = getXpProgress(totalXp, newLevel);
  
  // Check if this is Level 4 - profile picture unlock level
  const isProfileUnlockLevel = newLevel === 4;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto [&>button]:hidden bg-[#FFF4F5] border-2 border-[#FF6B35]/20 overflow-hidden">
        <div className="text-center py-6 relative z-10">
          {/* Remi celebrating */}
          <div className="relative inline-block mb-4">
            <img 
              src={remiCelebrating} 
              alt="Remi celebrating" 
              className="w-28 h-auto max-h-28 mx-auto object-contain"
            />
            <div 
              className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
              style={{ backgroundColor: rank.color }}
            >
              {newLevel}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#502a13] mb-2">
            🎉 Level Up!
          </h2>

          <p className="text-lg font-semibold mb-1" style={{ color: rank.color }}>
            {rank.emoji} {rank.name}
          </p>

          <p className="text-[#502a13]/70 text-sm mb-4">
            You've reached Level {newLevel}!
          </p>

          {/* Profile Picture Unlock Notification - Level 4 */}
          {isProfileUnlockLevel && (
            <div className="bg-gradient-to-r from-[#FF6B35]/20 to-[#FF6B35]/30 rounded-2xl p-4 mb-4 border border-[#FF6B35]/30">
              <div className="flex items-center justify-center gap-2 mb-2">
                <User className="w-5 h-5 text-[#FF6B35]" />
                <span className="font-bold text-[#502a13]">New Feature Unlocked!</span>
              </div>
              <p className="text-sm text-[#502a13]/80">
                You can now customize your profile picture! Head to your Profile to choose your favorite Remi 🦝
              </p>
            </div>
          )}

          {/* XP Badge */}
          <div className="bg-gradient-to-r from-[#FF6B35]/10 to-[#FF6B35]/20 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-[#FF6B35]" />
              <span className="font-bold text-[#502a13]">{formatXp(totalXp)} XP</span>
            </div>
            
            {/* Progress to next level */}
            {newLevel < 100 && (
              <div className="space-y-1">
                <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${progress.percent}%`,
                      backgroundColor: rank.color
                    }}
                  />
                </div>
                <p className="text-xs text-[#502a13]/60">
                  {formatXp(progress.current)} / {formatXp(progress.needed)} to Level {newLevel + 1}
                </p>
              </div>
            )}
          </div>

          <Button 
            onClick={onClose}
            className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-semibold"
            size="lg"
          >
            {isProfileUnlockLevel ? "Check it out! 🦝" : "Keep Going! 🚀"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
