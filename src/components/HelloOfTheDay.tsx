import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { HelloLog } from "@/hooks/useHelloLogs";
import { useTimezone } from "@/hooks/useTimezone";

interface HelloOfTheDayProps {
  logs: HelloLog[];
  onViewLog?: (log: HelloLog) => void;
}

// Get today's date key for localStorage
const getTodayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

export const HelloOfTheDay = ({ logs, onViewLog }: HelloOfTheDayProps) => {
  const [shuffledIndex, setShuffledIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const { formatTimestamp } = useTimezone();

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
    
    // Trigger exit animation
    setIsAnimating(true);
    
    setTimeout(() => {
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
      setIsNotesExpanded(false); // Collapse notes on shuffle
      
      // Persist to localStorage
      localStorage.setItem('memory-of-day-selection', JSON.stringify({
        dateKey: getTodayKey(),
        index: newIndex
      }));
      
      // Re-enable for enter animation
      setIsAnimating(false);
    }, 150);
  };

  const handleCardClick = () => {
    if (selectedMemory && onViewLog) {
      onViewLog(selectedMemory);
    }
  };

  const displayLocation = selectedMemory?.location?.trim();
  const notesText = selectedMemory?.notes?.trim() || "";
  // Heuristic: if it's long enough to likely wrap beyond 2 lines, show the toggle.
  // (We keep this simple + robust; the fixed-height card ensures stability regardless.)
  const notesCanExpand = notesText.length > 90;

  if (!selectedMemory) return null;

  return (
    <Card 
      className="rounded-2xl hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98] relative overflow-hidden h-[176px]"
      onClick={handleCardClick}
    >
      {/* Fixed height content area */}
      <div className="p-4 h-full flex flex-col">
        {/* Shuffle button - top right */}
        {eligibleLogs.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShuffle}
            className="absolute top-3 right-3 h-10 w-10 p-0 text-muted-foreground hover:text-foreground z-10"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </Button>
        )}

        {/* Notes expand/collapse toggle - bottom right (only if needed) */}
        {notesCanExpand && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsNotesExpanded((v) => !v);
            }}
            className="absolute bottom-3 right-3 h-9 w-9 p-0 text-muted-foreground hover:text-foreground z-10"
            aria-label={isNotesExpanded ? "Collapse notes" : "Expand notes"}
          >
            {isNotesExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        )}
        
        <div 
          className={`pr-12 transition-all duration-150 ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {/* Title header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📖</span>
            <span className="text-base font-semibold" style={{ color: '#ff6f3b' }}>Hello of the day</span>
          </div>
          
          {/* Name row with location */}
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate text-foreground">{selectedMemory.name}</h3>
            
            {displayLocation && (
              <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                <MapPin className="w-3 h-3" />
                <span className="text-sm">{displayLocation}</span>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            {formatTimestamp(selectedMemory.created_at, false)}
          </p>

          {/* Notes: always 2-line preview; expands within a scroll area (card height stays fixed) */}
          {notesText && (
            <div className="mt-2 flex-1 min-h-0">
              <div className={`text-sm text-muted-foreground ${isNotesExpanded ? 'h-full overflow-auto pr-2' : ''}`}>
                <p className={!isNotesExpanded ? 'line-clamp-2' : ''}>
                  {notesText}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
