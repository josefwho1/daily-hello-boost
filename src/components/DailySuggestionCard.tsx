import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Shuffle } from "lucide-react";
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
    <Card className="p-4 border-border/30 bg-muted/30">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <Lightbulb className="w-4 h-4 text-primary/70" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Today's Hello
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShuffle}
              className="h-6 px-2 text-muted-foreground hover:text-foreground"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </Button>
          </div>
          <p className="text-sm text-foreground font-medium">
            {displayHello.title}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {displayHello.description}
          </p>
        </div>
      </div>
    </Card>
  );
};
