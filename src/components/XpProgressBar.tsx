import { getRankFromLevel, getXpProgress, formatXp } from "@/lib/xpSystem";
import { Trophy } from "lucide-react";

interface XpProgressBarProps {
  totalXp: number;
  currentLevel: number;
  compact?: boolean;
}

export const XpProgressBar = ({ totalXp, currentLevel, compact = false }: XpProgressBarProps) => {
  const rank = getRankFromLevel(currentLevel);
  const progress = getXpProgress(totalXp, currentLevel);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div 
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
          style={{ backgroundColor: rank.color }}
        >
          {currentLevel}
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${progress.percent}%`,
                backgroundColor: rank.color
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#FFF4F5] to-white rounded-2xl p-4 border border-[#FF6B35]/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md"
            style={{ backgroundColor: rank.color }}
          >
            {currentLevel}
          </div>
          <div>
            <p className="font-semibold text-[#502a13]">Level {currentLevel}</p>
            <p className="text-xs" style={{ color: rank.color }}>
              {rank.emoji} {rank.name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-[#FF6B35]">
            <Trophy className="w-4 h-4" />
            <span className="font-bold">{formatXp(totalXp)}</span>
          </div>
          <p className="text-xs text-muted-foreground">Total XP</p>
        </div>
      </div>

      {/* Progress bar */}
      {currentLevel < 100 && (
        <div className="space-y-1">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${progress.percent}%`,
                backgroundColor: rank.color
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatXp(progress.current)} XP</span>
            <span>{formatXp(progress.needed)} XP to Level {currentLevel + 1}</span>
          </div>
        </div>
      )}

      {currentLevel >= 100 && (
        <div className="text-center py-2">
          <p className="text-sm font-medium text-[#FFD700]">
            ✨ Maximum Level Achieved! ✨
          </p>
        </div>
      )}
    </div>
  );
};
