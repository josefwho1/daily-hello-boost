import { useState, useEffect, memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { dailyHellos, getTodaysHello, type DailyHello } from "@/data/dailyHellos";

// Remi Curious images - rotate daily
import remiCurious1 from "@/assets/remi-curious-1.webp";
import remiCurious2 from "@/assets/remi-curious-2.webp";
import remiCurious3 from "@/assets/remi-curious-3.webp";
import remiCurious4 from "@/assets/remi-curious-4.webp";

const remiCuriousImages = [remiCurious1, remiCurious2, remiCurious3, remiCurious4];

// Get today's date key for localStorage
const getTodayKey = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

// Get the Remi Curious image for today (rotates daily)
const getDailyRemiCurious = () => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return remiCuriousImages[dayOfYear % remiCuriousImages.length];
};

export const DailySuggestionCard = memo(() => {
  const [shuffledHello, setShuffledHello] = useState<DailyHello | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const remiImage = getDailyRemiCurious();
  
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
      } catch {
        // Invalid data, ignore
      }
    }
  }, []);

  const defaultHello = getTodaysHello();
  const displayHello = shuffledHello || defaultHello;

  const handleShuffle = () => {
    // Trigger exit animation
    setIsAnimating(true);
    
    setTimeout(() => {
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
      
      // Re-enable for enter animation
      setIsAnimating(false);
    }, 150);
  };

  return (
    <Card id="tutorial-todays-hello-card" className="p-4 rounded-xl bg-card border-border/50 relative overflow-hidden h-[160px]">
      {/* Header row with shuffle button */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span className="text-base font-semibold" style={{ color: '#ff6f3b' }}>Today's Hello</span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShuffle}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <Shuffle className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Content */}
      <div 
        className={`mt-1 pr-14 transition-all duration-150 ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <h3 className="text-sm font-medium text-foreground line-clamp-1">{displayHello.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {displayHello.description}
        </p>
        
        {/* Suggestion - always visible */}
        {displayHello.suggestion && (
          <p className="text-xs text-muted-foreground/70 italic line-clamp-2 mt-2">
            {displayHello.suggestion}
          </p>
        )}
      </div>
      
      {/* Remi Curious - positioned bottom right of the card */}
      <img 
        src={remiImage} 
        alt="Remi" 
        className="absolute bottom-2 right-2 w-12 h-auto object-contain opacity-90 pointer-events-none"
      />
    </Card>
  );
});

DailySuggestionCard.displayName = "DailySuggestionCard";
