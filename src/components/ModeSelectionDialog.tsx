import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import remiMascot from "@/assets/remi-waving.png";
import { Flame, Calendar } from "lucide-react";
import { useState } from "react";

interface ModeSelectionDialogProps {
  open: boolean;
  onSelectMode: (mode: 'daily' | 'connect') => void;
}

export const ModeSelectionDialog = ({ open, onSelectMode }: ModeSelectionDialogProps) => {
  const [selectedMode, setSelectedMode] = useState<'daily' | 'connect'>('daily');

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-auto [&>button]:hidden max-h-[90vh] overflow-y-auto">
        <div className="text-center py-4">
          <img 
            src={remiMascot} 
            alt="Remi" 
            className="w-20 h-20 mx-auto mb-4"
          />
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            🏆 Congratulations!
          </h2>

          <p className="text-lg font-medium text-primary mb-2">
            You've completed the One Hello challenge!
          </p>
          
          <p className="text-muted-foreground mb-6">
            Now choose how you want to continue your journey.
          </p>
          
          <RadioGroup 
            value={selectedMode} 
            onValueChange={(v) => setSelectedMode(v as 'daily' | 'connect')}
            className="space-y-4"
          >
            {/* Daily Mode */}
            <Card 
              className={`p-4 cursor-pointer transition-all text-left ${
                selectedMode === 'daily' 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedMode('daily')}
            >
              <div className="flex items-start gap-4">
                <RadioGroupItem value="daily" id="daily" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <Label className="text-lg font-semibold cursor-pointer">
                      Daily Mode
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    "One Hello a Day"
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Designed for users who enjoy streaks and daily motivation. 
                    Complete 1 hello per day to maintain your streak.
                  </p>
                </div>
              </div>
            </Card>

            {/* Connect Mode */}
            <Card 
              className={`p-4 cursor-pointer transition-all text-left ${
                selectedMode === 'connect' 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedMode('connect')}
            >
              <div className="flex items-start gap-4">
                <RadioGroupItem value="connect" id="connect" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <Label className="text-lg font-semibold cursor-pointer">
                      Connect Mode
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    "5 Hellos a Week"
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Designed for users who want flexibility without daily pressure. 
                    Complete 5 hellos per week (Mon–Sun).
                  </p>
                </div>
              </div>
            </Card>
          </RadioGroup>
          
          <Button 
            onClick={() => onSelectMode(selectedMode)} 
            className="w-full mt-6" 
            size="lg"
          >
            Start {selectedMode === 'daily' ? 'Daily' : 'Connect'} Mode
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
