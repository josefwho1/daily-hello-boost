import { challenges } from "@/data/challenges";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ChallengeCard } from "@/components/ChallengeCard";
import { useNavigate } from "react-router-dom";

interface CompletedChallenge {
  id: number;
  completedAt: string;
  note: string;
}

const Challenges = () => {
  const navigate = useNavigate();
  const [completedChallenges] = useLocalStorage<CompletedChallenge[]>("completedChallenges", []);

  const getNextIncompleteIndex = () => {
    return challenges.findIndex(
      c => !completedChallenges.some(cc => cc.id === c.id)
    );
  };

  const nextIncompleteIndex = getNextIncompleteIndex();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">All Challenges</h1>
        <p className="text-muted-foreground mb-6">
          Complete one challenge each day for 7 days
        </p>

        <div className="space-y-4">
          {challenges.map((challenge, index) => {
            const isCompleted = completedChallenges.some(c => c.id === challenge.id);
            const isToday = index === nextIncompleteIndex;
            const isLocked = index > nextIncompleteIndex && nextIncompleteIndex !== -1;

            return (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                isCompleted={isCompleted}
                isToday={isToday}
                isLocked={isLocked}
                onClick={() => !isLocked && navigate("/")}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Challenges;
