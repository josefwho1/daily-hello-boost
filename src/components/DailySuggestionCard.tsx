import { useState, useEffect } from "react";
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

export const DailySuggestionCard = () => {
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
      } catch (e) {
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
    <Card className="p-4 rounded-xl bg-card border-border/50 relative overflow-hidden">
      {/* Header row with shuffle button */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span className="text-base font-semibold" style={{ color: '#ff6f3b' }}>Today's Hello</span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            A daily suggestion to help you connect
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShuffle}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
        >
          <Shuffle className="w-3.5 h-3.5" />
        </Button>
      </div>
      
      {/* Content - fixed height for 2 lines */}
      <div 
        className={`mt-3 pr-16 transition-all duration-150 ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <h3 className="text-sm font-medium text-foreground mb-1">{displayHello.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {displayHello.description}
        </p>
      </div>
      
      {/* Remi Curious - positioned bottom right of the card */}
      <img 
        src={remiImage} 
        alt="Remi the curious raccoon" 
        className="absolute bottom-2 right-2 w-14 h-auto object-contain opacity-90"
      />
    </Card>
  );
};
