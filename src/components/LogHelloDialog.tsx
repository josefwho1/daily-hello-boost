import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sevenWaysToSayHello } from "@/data/onboardingChallenges";
import remiMascot from "@/assets/remi-mascot.png";

interface LogHelloDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLog: (data: { name?: string; notes?: string; hello_type?: string }) => Promise<void>;
}

export const LogHelloDialog = ({ open, onOpenChange, onLog }: LogHelloDialogProps) => {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [helloType, setHelloType] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  const handleSubmit = async () => {
    setIsLogging(true);
    try {
      await onLog({
        name: name || undefined,
        notes: notes || undefined,
        hello_type: helloType || undefined
      });
      setName("");
      setNotes("");
      setHelloType("");
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
            <img src={remiMascot} alt="Remi" className="w-12 h-12" />
            <DialogTitle className="text-xl">Log Your Hello!</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="hello-type">Type of Hello</Label>
            <Select value={helloType} onValueChange={setHelloType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type (optional)" />
              </SelectTrigger>
              <SelectContent>
                {sevenWaysToSayHello.map((way) => (
                  <SelectItem key={way.category} value={way.category}>
                    {way.category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
