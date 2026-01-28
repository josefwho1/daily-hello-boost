import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Lock, Trophy, Check } from "lucide-react";
import { Challenge } from "@/types/challenge";
import { getPackById } from "@/data/packs";
import { cn } from "@/lib/utils";
import { differenceInDays, parseISO, startOfDay, addDays, format } from "date-fns";

// Import Remi Proud image
import remiProud from "@/assets/remi-proud.webp";

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
  const [isExpanded, setIsExpanded] = useState(false);

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
    for (let i = 0; i <= maxUnlockedIndex; i++) {
      const challenge = pack.challenges[i];
      if (!completedDays.includes(challenge.day)) {
        return i;
      }
    }
    return maxUnlockedIndex;
  };

  const [currentIndex, setCurrentIndex] = useState(getCurrentChallengeIndex());
  const currentChallenge = pack.challenges[currentIndex];

  const isUnlocked = (idx: number) => idx <= maxUnlockedIndex;
  const isCompleted = (c: Challenge) =>
    completedTags.includes(c.tag) || completedDays.includes(c.day);

  const getUnlockDay = (idx: number) =>
    format(addDays(startDate, idx), "EEEE");

  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < pack.challenges.length - 1;

  const goLeft = () => canGoLeft && setCurrentIndex(currentIndex - 1);
  const goRight = () => canGoRight && setCurrentIndex(currentIndex + 1);

  const challengeCompleted = isCompleted(currentChallenge);
  const challengeUnlocked = isUnlocked(currentIndex);
  const completedCount = pack.challenges.filter(isCompleted).length;

  const handleCardTap = () => {
    if (challengeUnlocked && !challengeCompleted) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Card id="tutorial-todays-hello-card" className="p-4 rounded-xl bg-card border-border/50 relative overflow-hidden min-h-[180px]">
      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={onViewPack}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Trophy size={18} style={{ color: '#ff6f3b' }} />
            <span className="text-base font-semibold" style={{ color: '#ff6f3b' }}>{pack.name}</span>
          </button>
          <p className="text-xs text-muted-foreground/70">
            Day {currentChallenge.day} of {pack.challenges.length} • {completedCount} completed
          </p>
        </div>
        
        {/* Navigation arrows */}
        <div className="flex items-center gap-1">
          <button
            onClick={goLeft}
            disabled={!canGoLeft}
            aria-label="Previous challenge"
            className={cn(
              "h-7 w-7 flex items-center justify-center rounded-lg transition-colors",
              canGoLeft ? "text-muted-foreground hover:text-foreground hover:bg-muted" : "text-muted-foreground/30 pointer-events-none"
            )}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={goRight}
            disabled={!canGoRight}
            aria-label="Next challenge"
            className={cn(
              "h-7 w-7 flex items-center justify-center rounded-lg transition-colors",
              canGoRight ? "text-muted-foreground hover:text-foreground hover:bg-muted" : "text-muted-foreground/30 pointer-events-none"
            )}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Content area - tap to expand */}
      <div 
        className={cn(
          "mt-2 pr-16 cursor-pointer transition-all duration-200",
          !challengeUnlocked && "opacity-60"
        )}
        onClick={handleCardTap}
      >
        {/* Title */}
        <h3 className={cn(
          "text-sm font-medium text-foreground line-clamp-1",
          !challengeUnlocked && "blur-sm select-none"
        )}>
          {currentChallenge.title}
        </h3>
        
        {/* Status badges - fixed height */}
        <div className="flex items-center gap-2 h-5 mt-0.5">
          {challengeCompleted && (
            <span className="flex items-center gap-1 text-success text-xs font-medium">
              <Check size={12} /> Completed
            </span>
          )}
          {!challengeUnlocked && (
            <span className="flex items-center gap-1 text-muted-foreground text-xs">
              <Lock size={12} /> Unlocks {getUnlockDay(currentIndex)}
            </span>
          )}
        </div>
        
        {/* Description - fixed 2 lines */}
        <p className={cn(
          "text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] mt-1",
          !challengeUnlocked && "blur-sm select-none"
        )}>
          {currentChallenge.description}
        </p>

        {/* Expanded content: tips */}
        {isExpanded && challengeUnlocked && !challengeCompleted && currentChallenge.tips && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Try saying</p>
            <p className="text-sm text-foreground/90 italic">
              {currentChallenge.tips}
            </p>
          </div>
        )}

        {/* Tap hint for unlocked incomplete challenges */}
        {challengeUnlocked && !challengeCompleted && !isExpanded && currentChallenge.tips && (
          <p className="text-[10px] text-muted-foreground/50 mt-2">
            Tap for suggestions
          </p>
        )}
      </div>

      {/* Complete button - only for unlocked, incomplete challenges */}
      {challengeUnlocked && !challengeCompleted && (
        <Button
          onClick={() => onLogHello(currentChallenge)}
          className="mt-4 w-full rounded-full font-semibold"
          size="sm"
        >
          Complete Challenge
        </Button>
      )}

      {/* Remi Proud - positioned bottom right */}
      <img 
        src={remiProud} 
        alt="Remi" 
        className="absolute bottom-2 right-2 w-12 h-auto object-contain opacity-90 pointer-events-none"
      />
    </Card>
  );
};
