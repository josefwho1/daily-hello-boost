import { Card } from "@/components/ui/card";
import { Trophy, Flame, Calendar } from "lucide-react";
import remiMascot from "@/assets/remi-mascot.png";

interface WeeklyStreakCardProps {
  weeklyStreak: number;
  dailyStreak: number;
  longestStreak: number;
  mode: string;
}

export const WeeklyStreakCard = ({ 
  weeklyStreak, 
  dailyStreak, 
  longestStreak,
  mode 
}: WeeklyStreakCardProps) => {
  const getModeLabel = () => {
    switch (mode) {
      case 'easy': return '3 hellos/week';
      case 'hard': return '7 hellos/week';
      default: return '5 hellos/week';
    }
  };

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

        <div className="flex gap-4 pt-4 border-t border-primary-foreground/20">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5" />
            <div>
              <p className="text-xs opacity-75">Daily</p>
              <p className="font-semibold">{dailyStreak} days</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            <div>
              <p className="text-xs opacity-75">Best</p>
              <p className="font-semibold">{longestStreak} weeks</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <div>
              <p className="text-xs opacity-75">Mode</p>
              <p className="font-semibold capitalize">{mode}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
