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

// Expandable text component matching Hellobook style
const ExpandableText = ({ text, isExpanded, onToggle }: { 
  text: string; 
  isExpanded: boolean;
  onToggle: (e: React.MouseEvent) => void;
}) => {
  const needsExpansion = text.length > 80;

  if (!needsExpansion) {
    return <p className="text-sm text-muted-foreground">{text}</p>;
  }

  return (
    <div>
      <p className={`text-sm text-muted-foreground ${!isExpanded ? 'line-clamp-2' : ''}`}>
        {text}
      </p>
      <button
        onClick={onToggle}
        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-1 transition-colors"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-3 h-3" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3" />
            Read more
          </>
        )}
      </button>
    </div>
  );
};

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

  if (!selectedMemory) return null;

  return (
    <Card 
      className="rounded-2xl hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98] relative overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Fixed height content area */}
      <div className="p-4 min-h-[140px]">
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

          {/* Notes - always show 2 lines max in fixed area */}
          {selectedMemory.notes && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {selectedMemory.notes}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Expand/collapse button - outside fixed area */}
      {selectedMemory.notes && selectedMemory.notes.length > 80 && (
        <ExpandableNotesSection 
          notes={selectedMemory.notes} 
          onToggle={(e) => e.stopPropagation()}
        />
      )}
    </Card>
  );
};
