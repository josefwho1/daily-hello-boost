import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HelloLog } from "@/hooks/useHelloLogs";

interface EditHelloDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: HelloLog | null;
  onSave: (id: string, updates: {
    name?: string | null;
    notes?: string | null;
    rating?: 'positive' | 'neutral' | 'negative' | null;
    difficulty_rating?: number | null;
  }) => Promise<any>;
}

const EditHelloDialog = ({ open, onOpenChange, log, onSave }: EditHelloDialogProps) => {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState<'positive' | 'neutral' | 'negative' | null>(null);
  const [difficultyRating, setDifficultyRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (log) {
      setName(log.name || "");
      setNotes(log.notes || "");
      setRating(log.rating);
      setDifficultyRating(log.difficulty_rating);
    }
  }, [log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!log) return;

    setIsSubmitting(true);
    const result = await onSave(log.id, {
      name: name || null,
      notes: notes || null,
      rating,
      difficulty_rating: difficultyRating
    });

    if (result) {
      onOpenChange(false);
    }
    setIsSubmitting(false);
  };

  const difficultyOptions = [
    { value: 1, label: 'Easy', emoji: '😌' },
    { value: 2, label: 'Just right', emoji: '👍' },
    { value: 3, label: 'Hard', emoji: '💪' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Hello</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name (optional)</Label>
            <Input
              id="edit-name"
              placeholder="Who did you say hello to?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes (optional)</Label>
            <Textarea
              id="edit-notes"
              placeholder="Any details you want to remember..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl min-h-[80px]"
            />
          </div>


          {/* Difficulty Selection */}
          <div className="space-y-2">
            <Label>How difficult was it?</Label>
            <div className="flex gap-2">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDifficultyRating(difficultyRating === option.value ? null : option.value)}
                  className={`flex-1 py-2 px-3 rounded-xl border transition-all text-sm ${
                    difficultyRating === option.value
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-card border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <span className="mr-1">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditHelloDialog;
