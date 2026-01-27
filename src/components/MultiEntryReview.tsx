import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trash2, Plus, Check } from "lucide-react";
import { toast } from "sonner";

export interface ExtractedEntry {
  name: string;
  location: string;
  notes: string;
}

interface MultiEntryReviewProps {
  entries: ExtractedEntry[];
  onBack: () => void;
  onSubmit: (entries: ExtractedEntry[]) => Promise<void>;
  isSubmitting: boolean;
}

export const MultiEntryReview = ({
  entries: initialEntries,
  onBack,
  onSubmit,
  isSubmitting,
}: MultiEntryReviewProps) => {
  const [entries, setEntries] = useState<ExtractedEntry[]>(initialEntries);

  const updateEntry = (index: number, field: keyof ExtractedEntry, value: string) => {
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  };

  const removeEntry = (index: number) => {
    if (entries.length === 1) {
      toast.error("You need at least one entry");
      return;
    }
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, { name: "", location: "", notes: "" }]);
  };

  const handleSubmit = async () => {
    // Validate each entry has at least a name or (location/notes)
    const validEntries = entries.filter(
      (e) => e.name.trim() || e.location.trim() || e.notes.trim()
    );

    if (validEntries.length === 0) {
      toast.error("Please fill in at least one entry");
      return;
    }

    await onSubmit(validEntries);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">
          Review {entries.length} {entries.length === 1 ? "Hello" : "Hellos"}
        </h1>
      </div>

      {/* Content - scrollable */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto pb-44">
        <p className="text-sm text-muted-foreground">
          We detected multiple people in your recording. Review and edit each entry below.
        </p>

        {entries.map((entry, index) => (
          <Card key={index} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Person {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeEntry(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`name-${index}`}>Name</Label>
              <Input
                id={`name-${index}`}
                placeholder="What's their name?"
                value={entry.name}
                onChange={(e) => updateEntry(index, "name", e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`location-${index}`}>Where you met</Label>
              <Input
                id={`location-${index}`}
                placeholder="Coffee shop, gym, work..."
                value={entry.location}
                onChange={(e) => updateEntry(index, "location", e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`notes-${index}`}>Notes</Label>
              <Textarea
                id={`notes-${index}`}
                placeholder="What do you want to remember about them?"
                value={entry.notes}
                onChange={(e) => updateEntry(index, "notes", e.target.value)}
                className="min-h-16 text-sm resize-none"
              />
            </div>
          </Card>
        ))}

        <Button
          variant="outline"
          className="w-full mb-4"
          onClick={addEntry}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add another person
        </Button>
      </div>

      {/* Fixed bottom button - positioned above nav bar */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          onClick={handleSubmit}
          className="w-full h-12 text-lg font-semibold shadow-md"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Logging..."
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Log {entries.length} {entries.length === 1 ? "Hello" : "Hellos"} 👋
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
