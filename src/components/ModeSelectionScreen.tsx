import { Button } from "@/components/ui/button";
import { Flame, Leaf } from "lucide-react";

interface ModeSelectionScreenProps {
  onSelectMode: (mode: 'daily' | 'chill') => void;
}

export const ModeSelectionScreen = ({ onSelectMode }: ModeSelectionScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div className="h-full bg-primary w-full" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Choose Your Mode</h1>
            <p className="text-muted-foreground mt-2">Pick the pace that works best for you</p>
          </div>
          
          <div className="space-y-4">
            {/* Daily Mode */}
            <div className="border border-primary/20 rounded-xl p-5 bg-primary/5 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold">Daily Mode</h3>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Recommended</span>
              </div>
              
              <p className="text-sm text-muted-foreground italic mb-3">
                One Hello a Day
              </p>
              
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• Builds powerful habits</li>
                <li>• Daily streak + XP boosts</li>
                <li>• Best way to stay connected</li>
              </ul>
              
              <Button 
                onClick={() => onSelectMode('daily')} 
                className="w-full"
                size="lg"
              >
                <Flame className="w-4 h-4 mr-2" />
                Daily Mode
              </Button>
            </div>

            {/* Chill Mode */}
            <div className="border border-border rounded-xl p-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-bold">Chill Mode</h3>
              </div>
              
              <p className="text-sm text-muted-foreground italic mb-3">
                3 Hellos per Week
              </p>
              
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• More flexible</li>
                <li>• Weekly streak</li>
                <li>• Perfect for busy schedules</li>
              </ul>
              
              <Button 
                onClick={() => onSelectMode('chill')} 
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Leaf className="w-4 h-4 mr-2" />
                Chill Mode
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
