import { useState, useEffect } from "react";
import { challenges } from "@/data/challenges";
import { CompletedChallenge } from "@/types/challenge";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ChallengeCard } from "@/components/ChallengeCard";
import { StreakDisplay } from "@/components/StreakDisplay";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/one-hello-logo.png";

const Home = () => {
  const navigate = useNavigate();
  const [completedChallenges, setCompletedChallenges] = useLocalStorage<CompletedChallenge[]>("completedChallenges", []);
  const [streak, setStreak] = useLocalStorage<number>("streak", 0);
  const [lastCompletedDate, setLastCompletedDate] = useLocalStorage<string | null>("lastCompletedDate", null);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [currentName, setCurrentName] = useState("");
  const [currentNote, setCurrentNote] = useState("");
  const [currentRating, setCurrentRating] = useState<'positive' | 'neutral' | 'negative'>('positive');
  const [completingChallengeId, setCompletingChallengeId] = useState<number | null>(null);

  useEffect(() => {
    // Check if streak should be reset
    if (lastCompletedDate) {
      const lastDate = new Date(lastCompletedDate);
      const today = new Date();
      lastDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 1) {
        setStreak(0);
        toast.error("Your streak was reset. Start fresh today!");
      }
    }
  }, []);

  const isChallengAvailable = (challengeId: number) => {
    // If completed, always available
    if (completedChallenges.some(c => c.id === challengeId)) return true;
    
    // Find the next incomplete challenge
    const nextIncompleteIndex = challenges.findIndex(
      c => !completedChallenges.some(cc => cc.id === c.id)
    );
    
    if (nextIncompleteIndex === -1) return true; // All completed
    
    const nextIncompleteId = challenges[nextIncompleteIndex].id;
    
    // If this is not the next incomplete, it's not available
    if (challengeId !== nextIncompleteId) return false;
    
    // Check if it's past midnight since last completion
    if (lastCompletedDate) {
      const lastDate = new Date(lastCompletedDate);
      const now = new Date();
      lastDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= 1) return true;
    } else {
      // First challenge is always available
      return true;
    }
    
    return false;
  };

  const getCurrentDayChallenge = () => {
    const nextIncompleteIndex = challenges.findIndex(
      c => !completedChallenges.some(cc => cc.id === c.id)
    );
    return nextIncompleteIndex !== -1 ? challenges[nextIncompleteIndex] : challenges[challenges.length - 1];
  };

  const todayChallenge = getCurrentDayChallenge();
  const isTodayChallengeCompleted = completedChallenges.some(c => c.id === todayChallenge.id);
  const isTodayChallengeAvailable = isChallengAvailable(todayChallenge.id);

  const handleCompleteChallenge = (challengeId: number) => {
    setCompletingChallengeId(challengeId);
    setCurrentName("");
    setCurrentNote("");
    setCurrentRating('positive');
    setShowNoteDialog(true);
  };

  const handleSaveNote = () => {
    if (!completingChallengeId) return;

    const today = new Date().toISOString();
    const newCompleted: CompletedChallenge = {
      id: completingChallengeId,
      completedAt: today,
      name: currentName,
      note: currentNote,
      rating: currentRating
    };

    setCompletedChallenges([...completedChallenges, newCompleted]);
    
    // Update streak
    const lastDate = lastCompletedDate ? new Date(lastCompletedDate) : null;
    const currentDate = new Date();
    
    if (!lastDate) {
      setStreak(1);
    } else {
      lastDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        setStreak(streak + 1);
        toast.success(`🔥 ${streak + 1} day streak! Keep going!`);
      } else if (daysDiff === 0) {
        toast.success("Challenge completed!");
      } else {
        setStreak(1);
        toast.success("Challenge completed! Starting a new streak!");
      }
    }
    
    setLastCompletedDate(today);
    setShowNoteDialog(false);
    setCompletingChallengeId(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="One Hello" className="w-72 mx-auto mb-4" />
          <p className="text-foreground font-medium mb-2">
            Welcome to the One Hello 7-Day Pilot. Thank you for your participation and good luck!
          </p>
        </div>

        {/* Streak Display */}
        <StreakDisplay streak={streak} className="mb-6" />

        {/* Today's Challenge */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-foreground">
            {isTodayChallengeCompleted ? "Today's Challenge - Complete!" : "Today's Challenge"}
          </h2>
          <ChallengeCard
            challenge={todayChallenge}
            isCompleted={isTodayChallengeCompleted}
            isToday={true}
            isLocked={!isTodayChallengeAvailable}
            onComplete={isTodayChallengeCompleted ? undefined : () => handleCompleteChallenge(todayChallenge.id)}
          />
          {isTodayChallengeCompleted && todayChallenge.id < 7 && (
            <div className="mt-4 bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center">
              <p className="text-foreground font-medium">
                Great work today! Come back tomorrow to reveal your next challenge
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full rounded-full"
            onClick={() => navigate("/challenges")}
          >
            View All Challenges
          </Button>
          <Button 
            variant="outline" 
            className="w-full rounded-full"
            onClick={() => navigate("/notes")}
          >
            Read My Notes
          </Button>
        </div>

        {/* Note Dialog */}
        <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>How did it go?</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  placeholder="Who did you interact with?"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Write about your experience... What did you learn? How did it feel?"
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  className="min-h-24"
                />
              </div>

              <div className="space-y-2">
                <Label>How would you rate the interaction? *</Label>
                <RadioGroup value={currentRating} onValueChange={(value) => setCurrentRating(value as 'positive' | 'neutral' | 'negative')}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="positive" id="positive" />
                    <Label htmlFor="positive" className="font-normal cursor-pointer">Positive</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="neutral" id="neutral" />
                    <Label htmlFor="neutral" className="font-normal cursor-pointer">Neutral</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="negative" id="negative" />
                    <Label htmlFor="negative" className="font-normal cursor-pointer">Negative</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNoteDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveNote} className="flex-1">
                  Save & Complete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Home;
