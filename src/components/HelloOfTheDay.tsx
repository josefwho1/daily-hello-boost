import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle, ChevronDown, ChevronUp } from "lucide-react";
import { HelloLog } from "@/hooks/useHelloLogs";

interface HelloOfTheDayProps {
  logs: HelloLog[];
  onEditLog?: (log: HelloLog) => void;
}

// Get today's date key for localStorage
const getTodayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

export const HelloOfTheDay = ({ logs, onEditLog }: HelloOfTheDayProps) => {
  const [shuffledIndex, setShuffledIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter logs with both name AND notes
  const eligibleLogs = useMemo(() => {
    return logs.filter(log => 
      log.name && log.name.trim() && log.notes && log.notes.trim()
    );
  }, [logs]);

  // Load persisted shuffle index on mount
  useEffect(() => {
    const savedData = localStorage.getItem('memory-of-day-selection');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.dateKey === getTodayKey() && typeof parsed.index === 'number') {
          setShuffledIndex(parsed.index);
        }
      } catch (e) {
        // Invalid data, ignore
      }
    }
  }, []);

  const selectedMemory = useMemo(() => {
    if (eligibleLogs.length === 0) return null;
    
    // If user has shuffled today, use that index
    if (shuffledIndex !== null && shuffledIndex < eligibleLogs.length) {
      return eligibleLogs[shuffledIndex];
    }
    
    // Default: Use today's date as seed for consistent selection per day
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % eligibleLogs.length;
    return eligibleLogs[index];
  }, [eligibleLogs, shuffledIndex]);

  const handleShuffle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (eligibleLogs.length <= 1) return;
    
    // Pick a random index different from current
    let newIndex: number;
    const currentIndex = shuffledIndex ?? ((() => {
      const today = new Date();
      const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
      return seed % eligibleLogs.length;
    })());
    
    do {
      newIndex = Math.floor(Math.random() * eligibleLogs.length);
    } while (newIndex === currentIndex && eligibleLogs.length > 1);
    
    setShuffledIndex(newIndex);
    setIsExpanded(false);
    
    // Persist to localStorage
    localStorage.setItem('memory-of-day-selection', JSON.stringify({
      dateKey: getTodayKey(),
      index: newIndex
    }));
  };

  const handleCardClick = () => {
    if (selectedMemory && onEditLog) {
      onEditLog(selectedMemory);
    }
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  if (!selectedMemory) return null;

  const notesText = selectedMemory.notes || "";
  const isLongNote = notesText.length > 80;
  const displayLocation = selectedMemory.location?.trim();

  return (
    <Card 
      className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 cursor-pointer hover:from-amber-500/15 hover:to-amber-500/10 transition-colors"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">Memory</span>
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-base font-semibold text-foreground">{selectedMemory.name}</span>
            {displayLocation && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground truncate">{displayLocation}</span>
              </>
            )}
          </div>
          <p className={`text-sm text-muted-foreground ${isExpanded ? '' : 'line-clamp-2'}`}>
            {notesText}
          </p>
          {isLongNote && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandToggle}
              className="h-6 px-0 mt-1 text-xs text-primary hover:text-primary/80 hover:bg-transparent"
            >
              {isExpanded ? (
                <>Read less <ChevronUp className="w-3 h-3 ml-1" /></>
              ) : (
                <>Read more <ChevronDown className="w-3 h-3 ml-1" /></>
              )}
            </Button>
          )}
        </div>
        {eligibleLogs.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShuffle}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </Card>
  );
};
