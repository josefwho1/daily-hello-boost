import { useState, useEffect } from "react";
import { getPackById } from "@/data/packs";
import { ChallengeCard } from "@/components/ChallengeCard";
import { StreakDisplay } from "@/components/StreakDisplay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/one-hello-logo-sticker.png";
import { isSameDayInTimezone, getDaysDifferenceInTimezone, getDateInUserTimezone } from "@/lib/timezone";
import { format } from "date-fns";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useChallengeCompletions } from "@/hooks/useChallengeCompletions";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { InstructionsCarousel } from "@/components/InstructionsCarousel";
import { AddPersonDialog } from "@/components/AddPersonDialog";
import { UserPlus } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, loading: progressLoading, updateProgress } = useUserProgress();
  const { completions, loading: completionsLoading, addCompletion } = useChallengeCompletions();
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [showSecondWelcomeDialog, setShowSecondWelcomeDialog] = useState(false);
  const [currentName, setCurrentName] = useState("");
  const [currentNote, setCurrentNote] = useState("");
  const [currentRating, setCurrentRating] = useState<'positive' | 'neutral' | 'negative'>('positive');
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(3);
  const [completingChallengeId, setCompletingChallengeId] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("");
  const [currentDateTime, setCurrentDateTime] = useState<Date>(getDateInUserTimezone());
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);

  const selectedPackId = progress?.selected_pack_id || 'starter-pack';
  const currentPack = getPackById(selectedPackId);
  const challenges = currentPack?.challenges || [];

  const loading = progressLoading || completionsLoading;

  // Update current date/time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(getDateInUserTimezone());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Get username directly from user metadata
    const name = user.user_metadata?.name || 'User';
    setUsername(name);
  }, [user]);

  // Check if user should see welcome dialogs
  useEffect(() => {
    const checkWelcomeStatus = async () => {
      if (!progress || loading) return;
      
      // Check if user has seen welcome messages
      if (!progress.has_seen_welcome_messages) {
        setShowWelcomeDialog(true);
      }
    };
    
    checkWelcomeStatus();
  }, [progress, loading]);

  useEffect(() => {
    if (!progress) return;
    
    // Check if streak should be reset
    if (progress.last_completed_date) {
      const daysDiff = getDaysDifferenceInTimezone(progress.last_completed_date, new Date());
      
      if (daysDiff > 1) {
        updateProgress({ current_streak: 0 });
        toast.error("Your streak was reset. Start fresh today!");
      }
    }
  }, [progress]);

  const isChallengAvailable = (challengeDay: number) => {
    // If completed, always available
    if (completions.some(c => c.challenge_day === challengeDay)) return true;
    
    // Find the next incomplete challenge
    const nextIncompleteIndex = challenges.findIndex(
      c => !completions.some(cc => cc.challenge_day === c.id)
    );
    
    if (nextIncompleteIndex === -1) return true; // All completed
    
    const nextIncompleteDay = challenges[nextIncompleteIndex].id;
    
    // If this is not the next incomplete, it's not available
    if (challengeDay !== nextIncompleteDay) return false;
    
    // Check if it's past midnight since last completion
    if (progress?.last_completed_date) {
      const daysDiff = getDaysDifferenceInTimezone(progress.last_completed_date, new Date());
      if (daysDiff >= 1) return true;
      return false;
    } else {
      // First challenge is always available
      return true;
    }
  };

  const getCurrentDayChallenge = () => {
    const nextIncompleteIndex = challenges.findIndex(
      (c) => !completions.some((cc) => cc.challenge_day === c.id)
    );
    return nextIncompleteIndex !== -1
      ? challenges[nextIncompleteIndex]
      : challenges[challenges.length - 1];
  };

  const hasCompletedToday = (() => {
    if (!progress?.last_completed_date) return false;
    return isSameDayInTimezone(progress.last_completed_date, new Date());
  })();

  let todayChallenge = getCurrentDayChallenge();
  let isTodayChallengeCompleted = false;
  let isTodayChallengeAvailable = false;

  if (hasCompletedToday) {
    const todayCompletion = [...completions]
      .sort(
        (a, b) =>
          new Date(b.completed_at).getTime() -
          new Date(a.completed_at).getTime()
      )
      .find((c) => isSameDayInTimezone(c.completed_at, new Date()));

    if (todayCompletion) {
      const completedChallenge = challenges.find(
        (c) => c.id === todayCompletion.challenge_day
      );
      if (completedChallenge) {
        todayChallenge = completedChallenge;
        isTodayChallengeCompleted = true;
        isTodayChallengeAvailable = false;
      }
    }
  } else {
    todayChallenge = getCurrentDayChallenge();
    isTodayChallengeCompleted = completions.some(
      (c) => c.challenge_day === todayChallenge.id
    );
    isTodayChallengeAvailable = isChallengAvailable(todayChallenge.id);
  }

  const handleCompleteChallenge = (challengeId: number) => {
    setCompletingChallengeId(challengeId);
    setCurrentName("");
    setCurrentNote("");
    setCurrentRating('positive');
    setCurrentDifficulty(3);
    setShowNoteDialog(true);
  };

  const handleSaveNote = async () => {
    if (!completingChallengeId || !progress) return;

    try {
      await addCompletion({
        challenge_day: completingChallengeId,
        interaction_name: currentName || null,
        notes: currentNote || null,
        rating: currentRating,
        difficulty_rating: currentDifficulty
      });

      const today = new Date().toISOString();
      
      // Update streak
      if (!progress.last_completed_date) {
        await updateProgress({
          current_streak: 1,
          current_day: completingChallengeId + 1,
          last_completed_date: today
        });
      } else {
        const daysDiff = getDaysDifferenceInTimezone(progress.last_completed_date, new Date());
        
        if (daysDiff === 1) {
          const newStreak = progress.current_streak + 1;
          await updateProgress({
            current_streak: newStreak,
            current_day: completingChallengeId + 1,
            last_completed_date: today
          });
          toast.success(`🔥 ${newStreak} day streak! Keep going!`);
        } else if (daysDiff === 0) {
          toast.success("Challenge completed!");
        } else {
          await updateProgress({
            current_streak: 1,
            current_day: completingChallengeId + 1,
            last_completed_date: today
          });
          toast.success("Challenge completed! Starting a new streak!");
        }
      }
      
      setShowNoteDialog(false);
      setCompletingChallengeId(null);
    } catch (error) {
      toast.error("Failed to save challenge completion");
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

  if (!progress) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-4">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <img src={logo} alt="One Hello" className="w-72 mx-auto" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Hello <span className="text-primary">{username}</span>
            </h1>
            <p className="text-lg text-foreground font-medium mb-2">
              Welcome to the One Hello App!
            </p>
          </div>
          <Button 
            onClick={() => navigate("/packs")}
            variant="outline"
            className="w-full mt-4"
          >
            <span className="mr-2">{currentPack?.icon}</span>
            <span>{currentPack?.name}</span>
          </Button>
        </div>

        {/* Instructions Carousel */}
        <InstructionsCarousel />

        {/* Add New Person Section */}
        <Card className="p-6 mt-6">
          <h2 className="text-xl font-bold mb-2 text-foreground">Add New Person</h2>
          <p className="text-sm text-muted-foreground mb-4">
            So you've met someone new, log their details here so you don't forget
          </p>
          <Button 
            onClick={() => setIsAddPersonOpen(true)}
            className="w-full"
            variant="outline"
          >
            <UserPlus className="mr-2" size={18} />
            Log New Person
          </Button>
        </Card>

        {/* Streak Display */}
        <StreakDisplay streak={progress.current_streak} className="my-6" />

        {/* Today's Challenge */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-foreground">
            {isTodayChallengeCompleted
              ? "Today's Challenge - Complete!"
              : "Today's Challenge"}
          </h2>
          <ChallengeCard
            challenge={todayChallenge}
            isCompleted={isTodayChallengeCompleted}
            isToday={true}
            isLocked={!isTodayChallengeAvailable}
            onComplete={
              isTodayChallengeCompleted
                ? undefined
                : () => handleCompleteChallenge(todayChallenge.id)
            }
          />
          {hasCompletedToday && todayChallenge.id < 7 && (
            <div className="mt-4 bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center">
              <p className="text-foreground font-medium">
                Great work today! Come back tomorrow to reveal your next
                challenge
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

        {/* Welcome Dialog 1 */}
        <Dialog open={showWelcomeDialog} onOpenChange={(open) => {
          if (!open) {
            setShowWelcomeDialog(false);
            setShowSecondWelcomeDialog(true);
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">Welcome Aboard!</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center space-y-3">
                <p className="font-bold text-lg">Why One Hello exists</p>
                <div className="space-y-2 text-sm leading-relaxed">
                  <p>We're the loneliest generation in history, even though we're more "connected" than ever.</p>
                  <p>One Hello a day is the smallest, most powerful antidote.</p>
                  <p>It's exposure therapy for social anxiety.</p>
                  <p>It's reps for the muscle we forgot we had.</p>
                  <p>It's the fastest way to make any city feel like home again.</p>
                  <p className="font-semibold">You're not just doing a challenge.</p>
                  <p className="font-semibold">You're part of the friendliest movement on earth.</p>
                  <p className="font-semibold">One Hello at a time.</p>
                  <p className="italic">Thank you for being a part of it.</p>
                </div>
              </div>
              <Button onClick={() => {
                setShowWelcomeDialog(false);
                setShowSecondWelcomeDialog(true);
              }} className="w-full">
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Welcome Dialog 2 */}
        <Dialog open={showSecondWelcomeDialog} onOpenChange={async (open) => {
          if (!open) {
            setShowSecondWelcomeDialog(false);
            // Mark as seen in database
            if (progress && !progress.has_seen_welcome_messages) {
              await supabase
                .from('user_progress')
                .update({ has_seen_welcome_messages: true })
                .eq('user_id', user?.id);
            }
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">A quick note before we start</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center space-y-3 text-sm leading-relaxed">
                <p>99% of people light up when a stranger is kind.</p>
                <p>Some are having a bad day - that's okay.</p>
                <p className="font-semibold">Smile, keep it light, and never take it personally.</p>
                <p>Your job isn't to win every interaction.</p>
                <p>Your job is to put more good energy into the world than you take out.</p>
                <p className="font-bold text-lg mt-4">Now go say Hello.</p>
              </div>
              <Button onClick={async () => {
                setShowSecondWelcomeDialog(false);
                // Mark as seen in database
                if (progress && !progress.has_seen_welcome_messages) {
                  await supabase
                    .from('user_progress')
                    .update({ has_seen_welcome_messages: true })
                    .eq('user_id', user?.id);
                }
              }} className="w-full">
                Let's Go!
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
                  placeholder="Write about your experience, what was it like, any descriptions to remember them by"
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

              <div className="space-y-2">
                <Label>Challenge Difficulty *</Label>
                <RadioGroup value={currentDifficulty.toString()} onValueChange={(value) => setCurrentDifficulty(parseInt(value))}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="diff-1" />
                    <Label htmlFor="diff-1" className="font-normal cursor-pointer">1 – Very easy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="diff-2" />
                    <Label htmlFor="diff-2" className="font-normal cursor-pointer">2 – Easy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="diff-3" />
                    <Label htmlFor="diff-3" className="font-normal cursor-pointer">3 – Just right</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="diff-4" />
                    <Label htmlFor="diff-4" className="font-normal cursor-pointer">4 – A bit challenging</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="diff-5" />
                    <Label htmlFor="diff-5" className="font-normal cursor-pointer">5 – Very challenging</Label>
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
      
      <AddPersonDialog 
        open={isAddPersonOpen} 
        onOpenChange={setIsAddPersonOpen}
      />
    </div>
  );
};

export default Home;
