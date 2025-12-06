import { Card } from "@/components/ui/card";
import { Trophy, Flame, Hand, Shield } from "lucide-react";
import remiMascot from "@/assets/remi-mascot.png";

interface WeeklyStreakCardProps {
  weeklyStreak: number;
  dailyStreak: number;
  totalHellos: number;
  streakSavers: number;
}

export const WeeklyStreakCard = ({ 
  weeklyStreak, 
  dailyStreak, 
  totalHellos,
  streakSavers
}: WeeklyStreakCardProps) => {
  return (
    <Card className="p-6 bg-gradient-to-br from-primary to-accent text-primary-foreground overflow-hidden relative">
      <img 
        src={remiMascot} 
        alt="Remi" 
        className="absolute -right-4 -bottom-4 w-24 h-24 opacity-30"
      />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90 mb-1">Weekly Streak</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{weeklyStreak}</span>
              <span className="text-lg opacity-90">week{weeklyStreak !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <Trophy className="w-12 h-12 opacity-90" />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-primary-foreground/20">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-xs opacity-75">Daily</p>
              <p className="font-semibold">{dailyStreak} days</p>
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
            <Shield className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-xs opacity-75">Savers</p>
              <p className="font-semibold">{streakSavers}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
