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
  completedTags: string[];
  packStartDate: string | null;
  onLogHello: (challenge: Challenge) => void;
  onViewPack: () => void;
}

export const ActiveChallengeCard = ({
  packId,
  completedDays,
  completedTags,
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
  
  // Maximum unlocked day (0-indexed: day 0 = first day)
  const maxUnlockedIndex = Math.min(daysSinceStart, pack.challenges.length - 1);
  
  // Find the current challenge (first incomplete one that's unlocked)
  const getCurrentChallengeIndex = () => {
    // Find first incomplete challenge that's unlocked
    for (let i = 0; i <= maxUnlockedIndex; i++) {
      const challenge = pack.challenges[i];
      if (!completedDays.includes(challenge.day)) {
        return i;
      }
    }
    
    // If all unlocked are complete, show the last unlocked one
    return maxUnlockedIndex;
  };

  const [currentIndex, setCurrentIndex] = useState(getCurrentChallengeIndex());
  const currentChallenge = pack.challenges[currentIndex];
  
  // Calculate unlock status for each challenge
  const isUnlocked = (challengeIndex: number) => {
    return challengeIndex <= maxUnlockedIndex;
  };
  
  const isCompleted = (challenge: Challenge) => {
    // Check by tag first (more reliable), fallback to day number
    return completedTags.includes(challenge.tag) || completedDays.includes(challenge.day);
  };

  const getUnlockDate = (challengeIndex: number) => {
    const unlockDate = addDays(startDate, challengeIndex);
    return format(unlockDate, "EEEE");
  };

  // Can navigate to any challenge, but locked ones are blurred
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
  // Count completed challenges by checking each challenge
  const completedCount = pack.challenges.filter(c => isCompleted(c)).length;

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
            {pack.challenges.map((challenge, idx) => (
              <div 
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  isCompleted(challenge)
                    ? "bg-success"
                    : idx <= maxUnlockedIndex
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

        {/* Challenge Content - Fixed height container */}
        <div className={cn(
          "bg-card rounded-xl p-4 mx-4 text-center transition-all min-h-[220px] flex flex-col",
          !challengeUnlocked && "relative"
        )}>
          {/* Header row */}
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
          
          {/* Icon */}
          <div className={cn(
            "text-2xl mb-2",
            !challengeUnlocked && "grayscale opacity-50"
          )}>
            {currentChallenge.icon}
          </div>
          
          {/* Title - fixed height */}
          <h3 className={cn(
            "font-bold text-base mb-1 line-clamp-1",
            !challengeUnlocked && "blur-sm select-none"
          )}>
            {currentChallenge.title}
          </h3>
          
          {/* Description - fixed height with line clamp */}
          <p className={cn(
            "text-sm text-muted-foreground line-clamp-2 min-h-[40px]",
            !challengeUnlocked && "blur-sm select-none"
          )}>
            {currentChallenge.description}
          </p>

          {/* Spacer to push button/info to bottom */}
          <div className="flex-1 min-h-2" />

          {/* Bottom section - consistent positioning */}
          <div className="mt-auto">
            {challengeUnlocked && currentChallenge.tips && !challengeCompleted && (
              <p className="text-xs text-muted-foreground/70 italic mb-2 line-clamp-1">
                💡 {currentChallenge.tips}
              </p>
            )}

            {!challengeUnlocked && (
              <p className="text-xs text-muted-foreground mb-2 flex items-center justify-center gap-1">
                <Lock size={12} />
                Unlocks {getUnlockDate(currentIndex)}
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

            {challengeCompleted && (
              <p className="text-xs text-success font-medium">
                ✓ Completed
              </p>
            )}
          </div>
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
