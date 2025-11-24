import { challenges } from "@/data/challenges";
import { CompletedChallenge } from "@/types/challenge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ChallengeCard } from "@/components/ChallengeCard";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/one-hello-logo.png";
import { getDaysDifferenceInTimezone } from "@/lib/timezone";

const Challenges = () => {
  const navigate = useNavigate();
  const [completedChallenges] = useLocalStorage<CompletedChallenge[]>("completedChallenges", []);
  const [lastCompletedDate] = useLocalStorage<string | null>("lastCompletedDate", null);

  const getNextIncompleteIndex = () => {
    return challenges.findIndex(
      c => !completedChallenges.some(cc => cc.id === c.id)
    );
  };

  const isChallengAvailable = (challengeId: number) => {
    if (completedChallenges.some(c => c.id === challengeId)) return true;
    
    const nextIncompleteIndex = challenges.findIndex(
      c => !completedChallenges.some(cc => cc.id === c.id)
    );
    
    if (nextIncompleteIndex === -1) return true;
    
    const nextIncompleteId = challenges[nextIncompleteIndex].id;
    
    if (challengeId !== nextIncompleteId) return false;
    
    if (lastCompletedDate) {
      const daysDiff = getDaysDifferenceInTimezone(lastCompletedDate, new Date());
      if (daysDiff >= 1) return true;
    } else {
      return true;
    }
    
    return false;
  };

  const nextIncompleteIndex = getNextIncompleteIndex();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <img src={logo} alt="One Hello" className="w-64 mx-auto mb-4" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-foreground">All Challenges</h1>
        <p className="text-muted-foreground mb-6">
          Complete one challenge each day for 7 days
        </p>

        <div className="space-y-4">
          {challenges.map((challenge, index) => {
            const isCompleted = completedChallenges.some(c => c.id === challenge.id);
            const isToday = index === nextIncompleteIndex;
            const isAvailable = isChallengAvailable(challenge.id);
            const isLocked = !isAvailable;

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
