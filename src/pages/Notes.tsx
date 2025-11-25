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
import { User, SmilePlus, Meh, Frown, Pencil } from "lucide-react";
import { useChallengeCompletions, ChallengeCompletion } from "@/hooks/useChallengeCompletions";
import { useToast } from "@/hooks/use-toast";

const Notes = () => {
  const { completions, loading, updateCompletion } = useChallengeCompletions();
  const { toast } = useToast();
  const [editingCompletion, setEditingCompletion] = useState<ChallengeCompletion | null>(null);
  const [editForm, setEditForm] = useState({
    interaction_name: "",
    notes: "",
    rating: "neutral" as "positive" | "neutral" | "negative",
    difficulty_rating: 3
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  if (loading) {
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
        <h1 className="text-3xl font-bold mb-6 text-center text-foreground">Notes from your interactions</h1>

        {completions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Complete your first challenge to start writing notes about your experiences.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {completions.map((completed) => {
              const challenge = challenges.find(c => c.id === completed.challenge_day);
              if (!challenge) return null;

              const ratingConfig = {
                positive: { icon: SmilePlus, color: "bg-green-500/10 text-green-600 border-green-500/20" },
                neutral: { icon: Meh, color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
                negative: { icon: Frown, color: "bg-red-500/10 text-red-600 border-red-500/20" }
              };

              const { icon: RatingIcon, color: ratingColor } = ratingConfig[completed.rating];

              return (
                <Card key={completed.id} className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{challenge.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-2 text-foreground">
                            {challenge.title}
                          </h3>
                          <Badge variant="outline" className={`${ratingColor} gap-1`}>
                            <RatingIcon size={14} />
                            <span className="capitalize">{completed.rating}</span>
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(completed)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {completed.interaction_name && (
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <User size={14} className="text-muted-foreground" />
                      <span className="text-foreground font-medium">{completed.interaction_name}</span>
                    </div>
                  )}
                  
                  {completed.notes && (
                    <div className="bg-muted rounded-lg p-4 mt-3">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {completed.notes}
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
