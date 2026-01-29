import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Lock, Trophy, Check, Lightbulb } from "lucide-react";
import { Challenge } from "@/types/challenge";
import { getPackById } from "@/data/packs";
import { cn } from "@/lib/utils";

// Import Remi Proud image
import remiProud from "@/assets/remi-proud.webp";

interface ActiveChallengeCardProps {
  packId: string;
  completedDays: number[];
  completedTags: string[];
  packStartDate: string | null;
  onLogHello: (challenge: Challenge) => void;
  onViewPack: () => void;
  onEndChallenge?: () => void;
}

export const ActiveChallengeCard = ({
  packId,
  completedDays,
  completedTags,
  packStartDate,
  onLogHello,
  onViewPack,
  onEndChallenge,
}: ActiveChallengeCardProps) => {
  const pack = getPackById(packId);
  

  if (!pack || pack.challenges.length === 0) {
    return null;
  }

  // Completion-based unlocking: a challenge is unlocked if all previous challenges are completed
  const isUnlocked = (idx: number) => {
    if (idx === 0) return true; // First challenge always unlocked
    // Check if all challenges before this one are completed
    for (let i = 0; i < idx; i++) {
      const prevChallenge = pack.challenges[i];
      if (!completedTags.includes(prevChallenge.tag) && !completedDays.includes(prevChallenge.day)) {
        return false;
      }
    }
    return true;
  };

  // Find the current challenge (first incomplete one that's unlocked)
  const getCurrentChallengeIndex = () => {
    for (let i = 0; i < pack.challenges.length; i++) {
      const challenge = pack.challenges[i];
      const isComplete = completedTags.includes(challenge.tag) || completedDays.includes(challenge.day);
      if (!isComplete && isUnlocked(i)) {
        return i;
      }
    }
    // All completed - show last one
    return pack.challenges.length - 1;
  };

  const [currentIndex, setCurrentIndex] = useState(getCurrentChallengeIndex());
  const currentChallenge = pack.challenges[currentIndex];
  const isCompleted = (c: Challenge) =>
    completedTags.includes(c.tag) || completedDays.includes(c.day);

  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < pack.challenges.length - 1;

  const goLeft = () => canGoLeft && setCurrentIndex(currentIndex - 1);
  const goRight = () => canGoRight && setCurrentIndex(currentIndex + 1);

  const challengeCompleted = isCompleted(currentChallenge);
  const challengeUnlocked = isUnlocked(currentIndex);
  const completedCount = pack.challenges.filter(isCompleted).length;
  const allChallengesComplete = completedCount === pack.challenges.length;


  return (
    <Card
      id="tutorial-todays-hello-card"
      className="p-4 rounded-xl bg-card border-border/50 relative overflow-hidden h-[228px] flex flex-col"
    >
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
            Challenge {currentChallenge.day} of {pack.challenges.length} • {completedCount} completed
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

      {/* Content area */}
      <div 
        className={cn(
          "mt-2 pr-16 flex-1",
          !challengeUnlocked && "opacity-60"
        )}
      >
        {/* Title */}
        <h3 className={cn(
          "text-sm font-medium text-foreground line-clamp-1",
          !challengeUnlocked && "blur-sm select-none"
        )}>
          {currentChallenge.title}
        </h3>
        
        {/* Lock status - only show when locked */}
        {!challengeUnlocked && (
          <div className="flex items-center gap-1 text-muted-foreground text-xs h-5 mt-0.5">
            <Lock size={12} /> Complete previous challenge to unlock
          </div>
        )}
        
        {/* Description - directly after title */}
        <p className={cn(
          "text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]",
          !challengeUnlocked && "blur-sm select-none",
          challengeUnlocked && "mt-0.5"
        )}>
          {currentChallenge.description}
        </p>

        {/* Tips/Suggestions - always visible when available, matching Today's Hello style */}
        {challengeUnlocked && !challengeCompleted && currentChallenge.tips && (
          <p className="text-xs text-muted-foreground/50 italic mt-1 line-clamp-2">
            "{currentChallenge.tips}"
          </p>
        )}
      </div>

      {/* Button area */}
      <div className="mt-3">
        {allChallengesComplete && onEndChallenge ? (
          <Button
            onClick={onEndChallenge}
            variant="outline"
            className="w-full rounded-full font-semibold"
            size="sm"
          >
            End Challenge
          </Button>
        ) : challengeUnlocked && !challengeCompleted ? (
          <Button
            onClick={() => onLogHello(currentChallenge)}
            className="w-full rounded-full font-semibold"
            size="sm"
          >
            Complete Challenge
          </Button>
        ) : challengeCompleted ? (
          <div className="flex items-center justify-center gap-1 text-success text-sm font-medium h-9">
            <Check size={14} /> Completed
          </div>
        ) : (
          <div className="h-9" aria-hidden="true" />
        )}
      </div>

      {/* Remi Proud - positioned bottom right */}
      <img 
        src={remiProud} 
        alt="Remi" 
        className="absolute bottom-2 right-2 w-12 h-auto object-contain opacity-90 pointer-events-none"
      />
    </Card>
  );
};
