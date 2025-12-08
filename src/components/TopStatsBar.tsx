import { getRankFromLevel } from "@/lib/xpSystem";
import orbImage from "@/assets/orb.webp";
import { Flame, Calendar } from "lucide-react";

interface TopStatsBarProps {
  hellosThisWeek: number;
  targetHellos: number;
  streak: number;
  orbs: number;
  level: number;
  mode: 'daily' | 'chill';
  isOnboarding?: boolean;
}

export const TopStatsBar = ({
  hellosThisWeek,
  targetHellos,
  streak,
  orbs,
  level,
  mode,
  isOnboarding = false
}: TopStatsBarProps) => {
  const rank = getRankFromLevel(level);
  const isDaily = mode === 'daily';

  return (
    <div className="flex items-center justify-between gap-2 bg-white/80 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-sm border border-[#FF6B35]/10">
      {/* Weekly Progress */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Week:</span>
        <span className="font-bold text-[#502a13]">
          {hellosThisWeek}/{targetHellos}
        </span>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-1">
        {isDaily ? (
          <Flame className="w-4 h-4 text-[#FF6B35]" />
        ) : (
          <Calendar className="w-4 h-4 text-[#FF6B35]" />
        )}
        <span className="font-bold text-[#502a13]">{streak}</span>
      </div>

      {/* Orbs */}
      <div className="flex items-center gap-1">
        <img src={orbImage} alt="Orb" className="w-4 h-4 object-contain" />
        <span className="font-bold text-[#502a13]">{orbs}/3</span>
      </div>

      {/* Level Badge */}
      <div 
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
        style={{ backgroundColor: rank.color }}
        title={`Level ${level} - ${rank.name}`}
      >
        {level}
      </div>
    </div>
  );
};
