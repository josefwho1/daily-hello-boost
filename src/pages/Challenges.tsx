import { challenges } from "@/data/challenges";
import { ChallengeCard } from "@/components/ChallengeCard";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/one-hello-logo.png";
import { getDaysDifferenceInTimezone } from "@/lib/timezone";
import { useChallengeCompletions } from "@/hooks/useChallengeCompletions";
import { useUserProgress } from "@/hooks/useUserProgress";

const Challenges = () => {
  const navigate = useNavigate();
  const { completions, loading: completionsLoading } = useChallengeCompletions();
  const { progress, loading: progressLoading } = useUserProgress();

  const loading = completionsLoading || progressLoading;

  const getNextIncompleteIndex = () => {
    return challenges.findIndex(
      c => !completions.some(cc => cc.challenge_day === c.id)
    );
  };

  const isChallengAvailable = (challengeDay: number) => {
    if (completions.some(c => c.challenge_day === challengeDay)) return true;
    
    const nextIncompleteIndex = challenges.findIndex(
      c => !completions.some(cc => cc.challenge_day === c.id)
    );
    
    if (nextIncompleteIndex === -1) return true;
    
    const nextIncompleteDay = challenges[nextIncompleteIndex].id;
    
    if (challengeDay !== nextIncompleteDay) return false;
    
    if (progress?.last_completed_date) {
      const daysDiff = getDaysDifferenceInTimezone(progress.last_completed_date, new Date());
      if (daysDiff >= 1) return true;
      return false;
    } else {
      return true;
    }
  };

  const nextIncompleteIndex = getNextIncompleteIndex();

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
        <div className="text-center mb-6">
          <img src={logo} alt="One Hello" className="w-64 mx-auto mb-4" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2 text-foreground">All Challenges</h1>
        <p className="text-muted-foreground mb-6">
          Complete one challenge each day for 7 days
        </p>

        <div className="space-y-4">
          {challenges.map((challenge, index) => {
            const isCompleted = completions.some(c => c.challenge_day === challenge.id);
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
