import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Lock, Trophy, Check } from "lucide-react";
import { Challenge } from "@/types/challenge";
import { getPackById } from "@/data/packs";
import { cn } from "@/lib/utils";
import { format, differenceInDays, parseISO, startOfDay, addDays } from "date-fns";

interface ActiveChallengeCardProps {
  packId: string;
  completedDays: number[];
  packStartDate: string | null;
  onLogHello: (challenge: Challenge) => void;
  onViewPack: () => void;
}

export const ActiveChallengeCard = ({
  packId,
  completedDays,
  packStartDate,
  onLogHello,
  onViewPack,
}: ActiveChallengeCardProps) => {
  const pack = getPackById(packId);
  
  if (!pack || pack.challenges.length === 0) {
    return null;
  }

  // Calculate which day the user is on based on pack start date
  const today = startOfDay(new Date());
  const startDate = packStartDate ? startOfDay(parseISO(packStartDate)) : today;
  const daysSinceStart = differenceInDays(today, startDate);
  
  // Find the current challenge (first incomplete one that's unlocked)
  const getCurrentChallengeIndex = () => {
    // Challenges unlock one per day
    const maxUnlockedDay = Math.min(daysSinceStart + 1, pack.challenges.length);
    
    // Find first incomplete challenge that's unlocked
    for (let i = 0; i < maxUnlockedDay; i++) {
      const challenge = pack.challenges[i];
      if (!completedDays.includes(challenge.day)) {
        return i;
      }
    }
    
    // If all unlocked are complete, show the last completed one
    return Math.min(daysSinceStart, pack.challenges.length - 1);
  };

  const [currentIndex, setCurrentIndex] = useState(getCurrentChallengeIndex());
  const currentChallenge = pack.challenges[currentIndex];
  
  // Calculate unlock status for each challenge
  const isUnlocked = (challengeIndex: number) => {
    return challengeIndex <= daysSinceStart;
  };
  
  const isCompleted = (challenge: Challenge) => {
    return completedDays.includes(challenge.day);
  };

  const getUnlockDate = (challengeIndex: number) => {
    const unlockDate = addDays(startDate, challengeIndex);
    return format(unlockDate, "EEEE");
  };

  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < pack.challenges.length - 1;

  const goLeft = () => {
    if (canGoLeft) setCurrentIndex(currentIndex - 1);
  };

  const goRight = () => {
    if (canGoRight) setCurrentIndex(currentIndex + 1);
  };

  const challengeCompleted = isCompleted(currentChallenge);
  const challengeUnlocked = isUnlocked(currentIndex);
  const completedCount = completedDays.length;

  return (
    <Card className="p-4 rounded-2xl border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      {/* Pack Header */}
      <div className="flex items-center justify-between mb-3">
        <button 
          onClick={onViewPack}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{pack.name}</span>
        </button>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {pack.challenges.map((_, idx) => (
              <div 
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full",
                  completedDays.includes(pack.challenges[idx].day)
                    ? "bg-success"
                    : idx <= daysSinceStart
                    ? "bg-muted-foreground/30"
                    : "bg-muted-foreground/10"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground ml-1">
            {completedCount}/{pack.challenges.length}
          </span>
        </div>
      </div>

      {/* Challenge Card with Navigation */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={goLeft}
          disabled={!canGoLeft}
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shadow-md transition-all",
            canGoLeft ? "hover:bg-muted" : "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Challenge Content */}
        <div className={cn(
          "bg-card rounded-xl p-4 mx-4 text-center transition-all",
          !challengeUnlocked && "opacity-60"
        )}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              DAY {currentChallenge.day}
            </span>
            {challengeCompleted && (
              <div className="flex items-center gap-1 text-success">
                <Check size={14} />
                <span className="text-xs font-semibold">DONE</span>
              </div>
            )}
            {!challengeUnlocked && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Lock size={12} />
              </div>
            )}
          </div>
          
          <div className={cn(
            "text-3xl mb-2",
            !challengeUnlocked && "grayscale opacity-50"
          )}>
            {currentChallenge.icon}
          </div>
          
          <h3 className={cn(
            "font-bold text-lg mb-1",
            !challengeUnlocked && "blur-sm"
          )}>
            {currentChallenge.title}
          </h3>
          
          <p className={cn(
            "text-sm text-muted-foreground mb-2",
            !challengeUnlocked && "blur-sm"
          )}>
            {currentChallenge.description}
          </p>

          {challengeUnlocked && currentChallenge.tips && (
            <p className="text-xs text-muted-foreground/70 italic mb-3">
              💡 {currentChallenge.tips}
            </p>
          )}

          {!challengeUnlocked && (
            <p className="text-xs text-muted-foreground mb-3">
              Unlocks on {getUnlockDate(currentIndex)}
            </p>
          )}

          {challengeUnlocked && !challengeCompleted && (
            <Button 
              onClick={() => onLogHello(currentChallenge)}
              className="w-full rounded-full font-semibold"
              size="sm"
            >
              Complete Challenge
            </Button>
          )}
        </div>

        {/* Right Arrow */}
        <button
          onClick={goRight}
          disabled={!canGoRight}
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shadow-md transition-all",
            canGoRight ? "hover:bg-muted" : "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
};
