import { useLocalStorage } from "@/hooks/useLocalStorage";
import { challenges } from "@/data/challenges";
import { CompletedChallenge } from "@/types/challenge";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, SmilePlus, Meh, Frown } from "lucide-react";
import { format } from "date-fns";

const Notes = () => {
  const [completedChallenges] = useLocalStorage<CompletedChallenge[]>("completedChallenges", []);

  const sortedChallenges = [...completedChallenges].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">My Notes</h1>
        <p className="text-muted-foreground mb-6">
          Reflections from your journey
        </p>

        {sortedChallenges.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              Complete your first challenge to start writing notes about your experiences.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedChallenges.map((completed) => {
              const challenge = challenges.find(c => c.id === completed.id);
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
                      <h3 className="font-bold text-lg mb-1 text-foreground">
                        {challenge.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar size={14} />
                        <span>
                          {format(new Date(completed.completedAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <Badge variant="outline" className={`${ratingColor} gap-1`}>
                        <RatingIcon size={14} />
                        <span className="capitalize">{completed.rating}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  {completed.name && (
                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <User size={14} className="text-muted-foreground" />
                      <span className="text-foreground font-medium">{completed.name}</span>
                    </div>
                  )}
                  
                  {completed.note && (
                    <div className="bg-muted rounded-lg p-4 mt-3">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        {completed.note}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
