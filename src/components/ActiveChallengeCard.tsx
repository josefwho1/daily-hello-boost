import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Lock, Trophy, Check } from "lucide-react";
import { Challenge } from "@/types/challenge";
import { getPackById } from "@/data/packs";
import { cn } from "@/lib/utils";
import { differenceInDays, parseISO, startOfDay, addDays, format } from "date-fns";

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

  return (
    <Card id="tutorial-todays-hello-card" className="p-4 rounded-2xl border-primary/20 bg-card overflow-hidden">
      {/* Compact header row: icon + title left, nav arrows + counter right */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onViewPack}
          className="flex items-center gap-1.5 text-primary hover:opacity-80 transition-opacity"
        >
          <Trophy size={16} />
          <span className="text-sm font-semibold">{pack.name}</span>
        </button>

        {/* Navigation + progress dots */}
        <div className="flex items-center gap-2">
          {/* Progress dots */}
          <div className="flex gap-0.5">
            {pack.challenges.map((c, idx) => (
              <span
                key={idx}
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isCompleted(c)
                    ? "bg-success"
                    : isUnlocked(idx)
                    ? "bg-muted-foreground/40"
                    : "bg-muted-foreground/15"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {completedCount}/{pack.challenges.length}
          </span>
        </div>
      </div>

      {/* Challenge body: left arrow | content | right arrow */}
      <div className="flex items-stretch gap-2">
        {/* Left nav */}
        <button
          onClick={goLeft}
          disabled={!canGoLeft}
          aria-label="Previous challenge"
          className={cn(
            "flex-shrink-0 w-8 flex items-center justify-center rounded-lg border border-border/50 bg-background/50 transition-colors",
            canGoLeft ? "hover:bg-muted" : "opacity-30 pointer-events-none"
          )}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Content */}
        <div
          className={cn(
            "flex-1 flex flex-col items-center text-center px-2 py-3 rounded-xl bg-muted/30 min-h-[180px]",
            !challengeUnlocked && "relative"
          )}
        >
          {/* Day badge + status */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wide text-muted-foreground">
              Day {currentChallenge.day}
            </span>
            {challengeCompleted && (
              <span className="flex items-center gap-0.5 text-success text-[10px] font-semibold uppercase">
                <Check size={12} /> Done
              </span>
            )}
            {!challengeUnlocked && <Lock size={12} className="text-muted-foreground/70" />}
          </div>

          {/* Icon */}
          <span
            className={cn(
              "text-2xl mb-1",
              !challengeUnlocked && "grayscale opacity-40"
            )}
          >
            {currentChallenge.icon}
          </span>

          {/* Title */}
          <h3
            className={cn(
              "text-base font-bold leading-tight line-clamp-1 mb-1",
              !challengeUnlocked && "blur-sm select-none"
            )}
          >
            {currentChallenge.title}
          </h3>

          {/* Description */}
          <p
            className={cn(
              "text-sm text-muted-foreground line-clamp-2 min-h-[40px]",
              !challengeUnlocked && "blur-sm select-none"
            )}
          >
            {currentChallenge.description}
          </p>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer: unlock text OR tips OR button OR completed */}
          {!challengeUnlocked && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock size={12} /> Unlocks {getUnlockDay(currentIndex)}
            </p>
          )}

          {challengeUnlocked && !challengeCompleted && currentChallenge.tips && (
            <p className="text-[11px] text-muted-foreground/70 italic line-clamp-1 mb-2">
              💡 {currentChallenge.tips}
            </p>
          )}

          {challengeUnlocked && !challengeCompleted && (
            <Button
              onClick={() => onLogHello(currentChallenge)}
              className="mt-auto w-full max-w-[200px] rounded-full font-semibold"
              size="sm"
            >
              Complete Challenge
            </Button>
          )}

          {challengeCompleted && (
            <span className="text-xs text-success font-medium mt-1">✓ Completed</span>
          )}
        </div>

        {/* Right nav */}
        <button
          onClick={goRight}
          disabled={!canGoRight}
          aria-label="Next challenge"
          className={cn(
            "flex-shrink-0 w-8 flex items-center justify-center rounded-lg border border-border/50 bg-background/50 transition-colors",
            canGoRight ? "hover:bg-muted" : "opacity-30 pointer-events-none"
          )}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </Card>
  );
};
