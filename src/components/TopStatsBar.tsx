import orbImage from "@/assets/orb.webp";
import { Flame, Calendar } from "lucide-react";

interface TopStatsBarProps {
  hellosThisWeek: number;
  targetHellos: number;
  streak: number;
  orbs: number;
  mode: 'daily' | 'chill';
  isOnboarding?: boolean;
}

export const TopStatsBar = ({
  hellosThisWeek,
  targetHellos,
  streak,
  orbs,
  mode,
  isOnboarding = false
}: TopStatsBarProps) => {
  const isDaily = mode === 'daily';

  return (
    <div className="flex items-center justify-between gap-2 bg-card/80 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-sm border border-primary/10">
      {/* Weekly Progress */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Week:</span>
        <span className="font-bold text-foreground">
          {hellosThisWeek}/{targetHellos}
        </span>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-1">
        {isDaily ? (
          <Flame className="w-4 h-4 text-primary" />
        ) : (
          <Calendar className="w-4 h-4 text-primary" />
        )}
        <span className="font-bold text-foreground">{streak}</span>
      </div>

      {/* Orbs */}
      <div className="flex items-center gap-1">
        <img src={orbImage} alt="Orb" className="w-4 h-4 object-contain" />
        <span className="font-bold text-foreground">{orbs}/3</span>
      </div>
    </div>
  );
};
