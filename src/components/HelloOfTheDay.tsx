import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Shuffle, ChevronDown, ChevronUp } from "lucide-react";

interface HelloLog {
  id: string;
  name: string | null;
  notes: string | null;
  hello_type: string | null;
  created_at: string;
}

interface HelloOfTheDayProps {
  logs: HelloLog[];
}

// Get today's date key for localStorage
const getTodayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

export const HelloOfTheDay = ({ logs }: HelloOfTheDayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handleShuffle = () => {
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

  if (!selectedMemory) return null;

  const notesText = selectedMemory.notes || "";
  const isLongNotes = notesText.length > 80;

  return (
    <Card className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Memory</span>
        </div>
        {eligibleLogs.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShuffle}
            className="h-8 px-2 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
          >
            <Shuffle className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="pl-7">
        <p className="font-medium text-foreground">{selectedMemory.name}</p>
        <p className={`text-sm text-muted-foreground mt-1 ${!isExpanded && isLongNotes ? 'line-clamp-2' : ''}`}>
          "{notesText}"
        </p>
        {isLongNotes && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 h-6 px-0 text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 mr-1" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Read more
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};
