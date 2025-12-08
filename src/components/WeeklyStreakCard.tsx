import { Card } from "@/components/ui/card";
import { Hand } from "lucide-react";
import remiMascot from "@/assets/remi-waving.webp";
import orbImage from "@/assets/orb.webp";
import dailyStreakIcon from "@/assets/daily-streak-icon.webp";
import weeklyStreakIcon from "@/assets/weekly-streak-icon.webp";

interface WeeklyStreakCardProps {
  weeklyStreak: number;
  dailyStreak: number;
  totalHellos: number;
  streakSavers: number;
  mode?: string;
}

export const WeeklyStreakCard = ({ 
  weeklyStreak, 
  dailyStreak, 
  totalHellos,
  streakSavers,
  mode
}: WeeklyStreakCardProps) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary to-accent text-primary-foreground overflow-hidden relative">
      <img 
        src={remiMascot} 
        alt="Remi" 
        className="absolute -right-4 -bottom-4 w-24 h-auto max-h-24 opacity-30 object-contain"
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm opacity-90">Daily Streak</p>
              {mode && (
                <span className="text-xs opacity-75 capitalize">({mode})</span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{dailyStreak}</span>
              <span className="text-lg opacity-90">day{dailyStreak !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <img src={dailyStreakIcon} alt="Daily Streak" className="w-14 h-14 object-contain" />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-primary-foreground/20">
          <div className="flex items-center gap-2">
            <img src={weeklyStreakIcon} alt="Weekly Streak" className="w-6 h-6 flex-shrink-0 object-contain" />
            <div>
              <p className="text-xs opacity-75">Weekly</p>
              <p className="font-semibold">{weeklyStreak} week{weeklyStreak !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Hand className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-xs opacity-75">Lifetime</p>
              <p className="font-semibold">{totalHellos}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img src={orbImage} alt="Orb" className="w-5 h-5 flex-shrink-0 object-contain" />
            <div>
              <p className="text-xs opacity-75">Orbs</p>
              <p className="font-semibold">{streakSavers} / 3</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
