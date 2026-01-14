import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";
import remiLogging1 from "@/assets/remi-logging-1.webp";
import remiLogging2 from "@/assets/remi-logging-2.webp";
import remiLogging3 from "@/assets/remi-logging-3.webp";
import remiLogging4 from "@/assets/remi-logging-4.webp";
import remiLogging5 from "@/assets/remi-logging-5.webp";

const remiLoggingImages = [remiLogging1, remiLogging2, remiLogging3, remiLogging4, remiLogging5];

const getRandomLoggingImage = () => {
  return remiLoggingImages[Math.floor(Math.random() * remiLoggingImages.length)];
};

// Includes regular types + onboarding challenge titles + First Hello initiation types for tracking completion
export type HelloType = 'regular_hello' | 'todays_hello' | 'remis_challenge' | 
  'First Hello' | 'Well Wishes' | 'Observation' | 'Nice Shoes' | 
  'How Are You?' | 'Name to the Face' | 'Getting Personal' |
  'Greeting' | 'Compliment' | 'Question' | 'Get a Name';

interface LogHelloScreenProps {
  onBack: () => void;
  onLog: (data: { 
    name?: string; 
    notes?: string; 
    rating?: 'positive' | 'neutral' | 'negative';
  }) => Promise<void>;
  challengeTitle?: string | null;
  helloType?: HelloType;
}

export const LogHelloScreen = ({ 
  onBack, 
  onLog, 
  challengeTitle,
  helloType = 'regular_hello'
}: LogHelloScreenProps) => {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<'positive' | 'neutral' | 'negative' | ''>("");
  const [isLogging, setIsLogging] = useState(false);

  const remiImage = useMemo(() => getRandomLoggingImage(), []);

  const screenTitle = challengeTitle 
    ? `Complete: ${challengeTitle}` 
    : "Log Your Hello!";

  const handleSubmit = async () => {
    setIsLogging(true);
    try {
      await onLog({
        name: name || undefined,
        notes: notes || undefined,
        rating: rating || undefined,
      });
      setName("");
      setNotes("");
      setRating("");
      onBack();
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <img src={remiImage} alt="Remi" className="w-10 h-10 object-contain" />
        <h1 className="text-xl font-bold text-foreground">{screenTitle}</h1>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="name">Name (optional)</Label>
          <Input
            id="name"
            placeholder="Did you catch their name?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Describe who you met, location, how it felt or any details you might want to remember :)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-32 text-base"
          />
        </div>

        <div className="space-y-3">
          <Label>How did it feel? (optional)</Label>
          <RadioGroup 
            value={rating} 
            onValueChange={(value) => setRating(value as 'positive' | 'neutral' | 'negative')}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="positive" id="positive" />
              <Label htmlFor="positive" className="cursor-pointer flex-1 text-base">😊 Positive</Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="neutral" id="neutral" />
              <Label htmlFor="neutral" className="cursor-pointer flex-1 text-base">😐 Neutral</Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
              <RadioGroupItem value="negative" id="negative" />
              <Label htmlFor="negative" className="cursor-pointer flex-1 text-base">😔 Negative</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <Button 
          onClick={handleSubmit} 
          className="w-full h-14 text-lg" 
          disabled={isLogging}
        >
          {isLogging ? "Logging..." : "Log Hello! 👋"}
        </Button>
      </div>
    </div>
  );
};
