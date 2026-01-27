import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle, MapPin } from "lucide-react";
import remiLogging1 from "@/assets/remi-logging-1.webp";
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
  const isLongNote = notesText.length > 100;
  const displayLocation = selectedMemory.location?.trim();

  // For inline "Read more", we truncate the text and append the button
  const truncatedNotes = isLongNote && !isExpanded 
    ? notesText.slice(0, 100).trim() 
    : notesText;

  return (
    <Card 
      className="p-4 rounded-xl bg-card border-border/50 cursor-pointer hover:bg-muted/30 transition-colors relative overflow-hidden"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 pr-12">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📖</span>
            <span className="text-base font-semibold text-foreground">Throwback</span>
          </div>
          
          {/* Name row */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-base font-semibold text-foreground">{selectedMemory.name}</span>
            {displayLocation && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="text-sm">{displayLocation}</span>
              </div>
            )}
          </div>
          
          {/* Notes with inline Read more */}
          <p className="text-sm text-muted-foreground">
            {isExpanded ? (
              <>
                {notesText}
                {isLongNote && (
                  <button
                    onClick={handleExpandToggle}
                    className="text-xs text-primary hover:text-primary/80 ml-1 inline"
                  >
                    Read less
                  </button>
                )}
              </>
            ) : (
              <>
                {truncatedNotes}
                {isLongNote && (
                  <button
                    onClick={handleExpandToggle}
                    className="text-xs text-primary hover:text-primary/80 inline"
                  >
                    ...Read more
                  </button>
                )}
              </>
            )}
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
      
      {/* Remi Logging - positioned bottom right */}
      <img 
        src={remiLogging1} 
        alt="Remi the logging raccoon" 
        className="absolute bottom-2 right-2 w-14 h-auto object-contain opacity-90"
      />
    </Card>
  );
};
