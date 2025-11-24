import { useLocalStorage } from "@/hooks/useLocalStorage";
import { challenges } from "@/data/challenges";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface CompletedChallenge {
  id: number;
  completedAt: string;
  note: string;
}

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

              return (
                <Card key={completed.id} className="p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{challenge.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 text-foreground">
                        {challenge.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={14} />
                        <span>
                          {format(new Date(completed.completedAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                  
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
