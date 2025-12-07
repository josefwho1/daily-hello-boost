import { Card } from "@/components/ui/card";
import { Trophy, Flame, Hand, Sparkles, Calendar } from "lucide-react";
import remiMascot from "@/assets/remi-mascot.png";

interface StreakCardProps {
  weeklyStreak: number;
  dailyStreak: number;
  totalHellos: number;
  orbs: number;
  mode: 'daily' | 'connect';
}

export const StreakCard = ({ 
  weeklyStreak, 
  dailyStreak, 
  totalHellos,
  orbs,
  mode
}: StreakCardProps) => {
  const isDaily = mode === 'daily';
  
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
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm opacity-90">
                {isDaily ? 'Daily Streak' : 'Weekly Streak'}
              </p>
              <span className="text-xs opacity-75 capitalize px-2 py-0.5 bg-primary-foreground/20 rounded-full">
                {isDaily ? 'Daily Mode' : 'Connect Mode'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">
                {isDaily ? dailyStreak : weeklyStreak}
              </span>
              <span className="text-lg opacity-90">
                {isDaily 
                  ? `day${dailyStreak !== 1 ? 's' : ''}`
                  : `week${weeklyStreak !== 1 ? 's' : ''}`
                }
              </span>
            </div>
          </div>
          {isDaily ? (
            <Flame className="w-12 h-12 opacity-90" />
          ) : (
            <Calendar className="w-12 h-12 opacity-90" />
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-primary-foreground/20">
          <div className="flex items-center gap-2">
            {isDaily ? (
              <Trophy className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Flame className="w-5 h-5 flex-shrink-0" />
            )}
            <div>
              <p className="text-xs opacity-75">
                {isDaily ? 'Weekly' : 'Daily'}
              </p>
              <p className="font-semibold">
                {isDaily 
                  ? `${weeklyStreak} week${weeklyStreak !== 1 ? 's' : ''}`
                  : `${dailyStreak} day${dailyStreak !== 1 ? 's' : ''}`
                }
              </p>
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
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-xs opacity-75">Orbs</p>
              <p className="font-semibold">{orbs} / 3</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
