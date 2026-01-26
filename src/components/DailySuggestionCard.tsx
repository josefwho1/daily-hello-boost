import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { dailyHellos, getTodaysHello, type DailyHello } from "@/data/dailyHellos";

// Get today's date key for localStorage
const getTodayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

export const DailySuggestionCard = () => {
  const [shuffledHello, setShuffledHello] = useState<DailyHello | null>(null);
  
  // Load persisted shuffle on mount
  useEffect(() => {
    const savedData = localStorage.getItem('todays-hello-selection');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.dateKey === getTodayKey() && parsed.helloId) {
          const found = dailyHellos.find(h => h.id === parsed.helloId);
          if (found) {
            setShuffledHello(found);
          }
        }
      } catch (e) {
        // Invalid data, ignore
      }
    }
  }, []);

  const defaultHello = getTodaysHello();
  const displayHello = shuffledHello || defaultHello;

  const handleShuffle = () => {
    // Pick a random hello different from current
    let newHello: DailyHello;
    const currentId = displayHello.id;
    
    do {
      const randomIndex = Math.floor(Math.random() * dailyHellos.length);
      newHello = dailyHellos[randomIndex];
    } while (newHello.id === currentId && dailyHellos.length > 1);
    
    setShuffledHello(newHello);
    
    // Persist to localStorage
    localStorage.setItem('todays-hello-selection', JSON.stringify({
      dateKey: getTodayKey(),
      helloId: newHello.id
    }));
  };

  return (
    <Card className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-medium text-primary">Today's Hello</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-sm font-medium text-foreground truncate">{displayHello.title}</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {displayHello.description}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShuffle}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <Shuffle className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  );
};
