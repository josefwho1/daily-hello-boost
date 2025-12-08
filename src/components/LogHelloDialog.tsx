import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import remiMascot from "@/assets/remi-waving.webp";

export type HelloType = 'regular_hello' | 'todays_hello' | 'remis_challenge';

interface LogHelloDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLog: (data: { 
    name?: string; 
    notes?: string; 
    rating?: 'positive' | 'neutral' | 'negative';
    difficulty_rating?: number;
  }) => Promise<void>;
  challengeTitle?: string | null;
  helloType?: HelloType;
}

export const LogHelloDialog = ({ 
  open, 
  onOpenChange, 
  onLog, 
  challengeTitle,
  helloType = 'regular_hello'
}: LogHelloDialogProps) => {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<'positive' | 'neutral' | 'negative' | ''>("");
  const [difficultyRating, setDifficultyRating] = useState<number | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  const showDifficultyRating = helloType === 'todays_hello' || helloType === 'remis_challenge';

  const dialogTitle = challengeTitle 
    ? `Complete: ${challengeTitle}` 
    : "Log Your Hello!";

  const handleSubmit = async () => {
    setIsLogging(true);
    try {
      await onLog({
        name: name || undefined,
        notes: notes || undefined,
        rating: rating || undefined,
        difficulty_rating: difficultyRating || undefined
      });
      setName("");
      setNotes("");
      setRating("");
      setDifficultyRating(null);
      onOpenChange(false);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <img src={remiMascot} alt="Remi" className="w-12 h-auto max-h-12 object-contain" />
            <DialogTitle className="text-xl">{dialogTitle}</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              placeholder="Did you catch their name?"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="How did it go? What did you talk about?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24"
            />
          </div>

          <div className="space-y-2">
            <Label>How did it feel? (optional)</Label>
            <RadioGroup 
              value={rating} 
              onValueChange={(value) => setRating(value as 'positive' | 'neutral' | 'negative')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="positive" id="positive" />
                <Label htmlFor="positive" className="cursor-pointer">😊 Positive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neutral" id="neutral" />
                <Label htmlFor="neutral" className="cursor-pointer">😐 Neutral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="negative" id="negative" />
                <Label htmlFor="negative" className="cursor-pointer">😔 Negative</Label>
              </div>
            </RadioGroup>
          </div>

          {showDifficultyRating && (
            <div className="space-y-2">
              <Label>Difficulty (optional)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={difficultyRating === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDifficultyRating(difficultyRating === 1 ? null : 1)}
                  className="flex-1"
                >
                  😌 Easy
                </Button>
                <Button
                  type="button"
                  variant={difficultyRating === 2 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDifficultyRating(difficultyRating === 2 ? null : 2)}
                  className="flex-1"
                >
                  👍 Just right
                </Button>
                <Button
                  type="button"
                  variant={difficultyRating === 3 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDifficultyRating(difficultyRating === 3 ? null : 3)}
                  className="flex-1"
                >
                  💪 Hard
                </Button>
              </div>
            </div>
          )}

          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            disabled={isLogging}
          >
            {isLogging ? "Logging..." : "Log Hello! 👋"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};