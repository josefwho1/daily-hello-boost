import { useState } from "react";
import { challenges } from "@/data/challenges";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, SmilePlus, Meh, Frown, Pencil, Hand } from "lucide-react";
import { useChallengeCompletions, ChallengeCompletion } from "@/hooks/useChallengeCompletions";
import { usePersonLogs } from "@/hooks/usePersonLogs";
import { useHelloLogs } from "@/hooks/useHelloLogs";
import { useTimezone } from "@/hooks/useTimezone";
import { useToast } from "@/hooks/use-toast";

const Notes = () => {
  const { completions, loading, updateCompletion } = useChallengeCompletions();
  const { personLogs, loading: logsLoading } = usePersonLogs();
  const { logs: helloLogs, loading: helloLogsLoading } = useHelloLogs();
  const { formatTimestamp } = useTimezone();
  const { toast } = useToast();
  const [editingCompletion, setEditingCompletion] = useState<ChallengeCompletion | null>(null);
  const [editForm, setEditForm] = useState({
    interaction_name: "",
    notes: "",
    rating: "neutral" as "positive" | "neutral" | "negative",
    difficulty_rating: 3
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combine and sort all entries by date
  const allEntries = [
    ...completions.map(c => ({ ...c, type: 'challenge' as const })),
    ...personLogs.map(p => ({ ...p, type: 'person' as const })),
    ...helloLogs.map(h => ({ ...h, type: 'hello' as const })),
  ].sort((a, b) => {
    const dateA = 'completed_at' in a ? new Date(a.completed_at) : new Date(a.created_at);
    const dateB = 'completed_at' in b ? new Date(b.completed_at) : new Date(b.created_at);
    return dateB.getTime() - dateA.getTime();
  });

  const handleEditClick = (completion: ChallengeCompletion) => {
    setEditingCompletion(completion);
    setEditForm({
      interaction_name: completion.interaction_name || "",
      notes: completion.notes || "",
      rating: completion.rating,
      difficulty_rating: completion.difficulty_rating || 3
    });
  };

  const handleEditSubmit = async () => {
    if (!editingCompletion) return;

    setIsSubmitting(true);
    try {
      await updateCompletion(editingCompletion.id, {
        interaction_name: editForm.interaction_name || null,
        notes: editForm.notes || null,
        rating: editForm.rating,
        difficulty_rating: editForm.difficulty_rating
      });

      toast({
        title: "Updated!",
        description: "Your note has been updated successfully.",
      });

      setEditingCompletion(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingDisplay = (rating: 'positive' | 'neutral' | 'negative' | null) => {
    if (!rating) return null;
    const config = {
      positive: { icon: SmilePlus, color: "bg-green-500/10 text-green-600 border-green-500/20", label: "Positive" },
      neutral: { icon: Meh, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", label: "Neutral" },
      negative: { icon: Frown, color: "bg-red-500/10 text-red-600 border-red-500/20", label: "Negative" }
    };
    return config[rating];
  };

  const getHelloTypeTag = (helloType: string | null) => {
    if (!helloType) return { label: "Standard Hello", color: "bg-muted text-muted-foreground" };
    if (helloType === "Weekly Challenge") return { label: "Weekly Challenge", color: "bg-primary/10 text-primary border-primary/20" };
    // If it matches one of the 7 onboarding challenges
    return { label: "Intro Series", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
  };

  if (loading || logsLoading || helloLogsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-foreground">Notes</h1>

        {allEntries.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Log hellos to start tracking your interactions.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {allEntries.map((entry) => {
              // Hello Log Entry
              if (entry.type === 'hello') {
                const ratingDisplay = getRatingDisplay(entry.rating);
                const typeTag = getHelloTypeTag(entry.hello_type);
                return (
                  <Card key={entry.id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Hand className="text-primary" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {entry.name || "Hello"}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(entry.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className={typeTag.color}>
                          {typeTag.label}
                        </Badge>
                        {ratingDisplay && (
                          <Badge variant="outline" className={`${ratingDisplay.color} gap-1`}>
                            <ratingDisplay.icon size={14} />
                            <span>{ratingDisplay.label}</span>
                          </Badge>
                        )}
                      </div>
                    </div>

                    {entry.notes && (
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                          {entry.notes}
                        </p>
                      </div>
                    )}
                  </Card>
                );
              }

              // Person Log Entry
              if (entry.type === 'person') {
                return (
                  <Card key={entry.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="text-primary" size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">
                            {entry.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(entry.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {entry.description && (
                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground font-medium mb-1">Description:</p>
                        <p className="text-sm text-foreground">{entry.description}</p>
                      </div>
                    )}

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              }

              // Challenge Completion Entry
              const completion = entry;
              const challenge = challenges.find(c => c.id === completion.challenge_day);
              if (!challenge) return null;

              const ratingConfig = {
                positive: { icon: SmilePlus, color: "bg-green-500/10 text-green-600 border-green-500/20" },
                neutral: { icon: Meh, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
                negative: { icon: Frown, color: "bg-red-500/10 text-red-600 border-red-500/20" }
              };

              const { icon: RatingIcon, color: ratingColor } = ratingConfig[completion.rating];

              return (
                <Card key={completion.id} className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{challenge.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1 text-foreground">
                            {challenge.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mb-2">
                            {formatTimestamp(completion.completed_at)}
                          </p>
                          <Badge variant="outline" className={`${ratingColor} gap-1`}>
                            <RatingIcon size={14} />
                            <span className="capitalize">{completion.rating}</span>
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(completion)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {completion.interaction_name && (
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <User size={14} className="text-muted-foreground" />
                      <span className="text-foreground font-medium">{completion.interaction_name}</span>
                    </div>
                  )}
                  
                  {completion.notes && (
                    <div className="bg-muted rounded-lg p-4 mt-3">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {completion.notes}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!editingCompletion} onOpenChange={(open) => !open && setEditingCompletion(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name (Optional)</Label>
              <Input
                id="edit-name"
                placeholder="Who did you meet?"
                value={editForm.interaction_name}
                onChange={(e) => setEditForm({ ...editForm, interaction_name: e.target.value })}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                placeholder="Write about your experience, what was it like, any descriptions to remember them by"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={4}
                maxLength={1000}
              />
            </div>

            <div className="space-y-2">
              <Label>How did it feel?</Label>
              <RadioGroup
                value={editForm.rating}
                onValueChange={(value) => setEditForm({ ...editForm, rating: value as "positive" | "neutral" | "negative" })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="positive" id="edit-positive" />
                  <Label htmlFor="edit-positive" className="flex items-center gap-2 cursor-pointer">
                    <SmilePlus size={16} className="text-green-600" />
                    Positive
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="neutral" id="edit-neutral" />
                  <Label htmlFor="edit-neutral" className="flex items-center gap-2 cursor-pointer">
                    <Meh size={16} className="text-yellow-600" />
                    Neutral
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="negative" id="edit-negative" />
                  <Label htmlFor="edit-negative" className="flex items-center gap-2 cursor-pointer">
                    <Frown size={16} className="text-red-600" />
                    Negative
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-difficulty">Challenge Difficulty</Label>
              <RadioGroup
                value={editForm.difficulty_rating.toString()}
                onValueChange={(value) => setEditForm({ ...editForm, difficulty_rating: parseInt(value) })}
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <RadioGroupItem value={rating.toString()} id={`edit-difficulty-${rating}`} />
                    <Label htmlFor={`edit-difficulty-${rating}`} className="cursor-pointer">
                      {rating} - {rating === 1 ? "Very easy" : rating === 2 ? "Easy" : rating === 3 ? "Just right" : rating === 4 ? "A bit challenging" : "Very challenging"}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCompletion(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notes;
