import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
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

  if (!selectedMemory) return null;

  const notesText = selectedMemory.notes || "";

  return (
    <div 
      className="py-3 px-1 cursor-pointer hover:bg-muted/30 rounded-lg transition-colors -mx-1"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">Memory</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-sm font-medium text-foreground">{selectedMemory.name}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {notesText}
          </p>
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
    </div>
  );
};
