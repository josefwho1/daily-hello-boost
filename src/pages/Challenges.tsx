import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUserProgressQuery } from "@/hooks/useUserProgressQuery";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useDailyMode } from "@/hooks/useDailyMode";
import { useChallengeProgress } from "@/hooks/useChallengeProgress";
import { useHelloLogs } from "@/hooks/useHelloLogs";
import { useTimezone } from "@/hooks/useTimezone";
import { DailyModeDetailScreen } from "@/components/DailyModeDetailScreen";
import { ChallengeListView } from "@/components/ChallengeListView";
import { LogHelloScreen } from "@/components/LogHelloScreen";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Target, Flame, RotateCcw, ChevronRight, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { ChallengeUndoToast } from "@/components/ChallengeUndoToast";
import questsIcon from "@/assets/quests-icon.webp";
import remiQuest from "@/assets/remi-quest.webp";
import vaultIcon from "@/assets/vault-icon.webp";
import remiWaving from "@/assets/remi-waving.webp";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
const Challenges = () => {
  const navigate = useNavigate();
  const {
    progress: cloudProgress,
    updateProgress: updateCloudProgress,
    loading: cloudLoading
  } = useUserProgressQuery();
  const {
    guestProgress,
    updateProgress: updateGuestProgress,
    isAnonymous,
    loading: guestLoading
  } = useGuestMode();
  const {
    logs,
    addLog
  } = useHelloLogs();
  const {
    timezoneOffset
  } = useTimezone();
  const {
    state: dailyModeState,
    activateDailyMode,
    deactivateDailyMode,
    loading: dailyModeLoading
  } = useDailyMode();
  const {
    state: challengeState,
    markDayComplete,
    unmarkDayComplete,
    restartChallenge,
    loading: challengeLoading
  } = useChallengeProgress();
  const [showDailyModeDetail, setShowDailyModeDetail] = useState(false);
  const [showChallengeList, setShowChallengeList] = useState(false);
  const [showConfirmRestart, setShowConfirmRestart] = useState(false);
  const [showConfirmDailyModeOff, setShowConfirmDailyModeOff] = useState(false);
  const [showConfirmPause, setShowConfirmPause] = useState(false);
  const [showLogScreen, setShowLogScreen] = useState(false);
  const [pendingChallengeCompletion, setPendingChallengeCompletion] = useState<{
    day: number;
    name: string;
  } | null>(null);

  // Remi easter egg state
  const [remiTapCount, setRemiTapCount] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const REMI_MESSAGES = ["Hello!", "Hey!", "Yo yo yooo", "Okay that's enough...", null // Remi disappears
  ];
  const progress = isAnonymous ? guestProgress : cloudProgress;
  const updateProgress = isAnonymous ? updateGuestProgress : updateCloudProgress;
  const isLoading = (isAnonymous ? guestLoading : cloudLoading) || challengeLoading || dailyModeLoading;

  // Check if quest is paused (selected_pack_id === 'daily' means showing Today's Hello)
  const isQuestPaused = progress?.selected_pack_id === 'daily';

  // Remi easter egg helpers
  const remiMessage = remiTapCount > 0 ? REMI_MESSAGES[remiTapCount - 1] : null;
  const isRemiGone = remiTapCount >= REMI_MESSAGES.length;
  const handleRemiTap = () => {
    if (remiTapCount >= REMI_MESSAGES.length) return;
    setRemiTapCount(prev => prev + 1);
    setShowSpeechBubble(true);

    // Hide speech bubble after a delay (except for the final "scared away" message)
    if (remiTapCount < REMI_MESSAGES.length - 1) {
      setTimeout(() => setShowSpeechBubble(false), 2000);
    }
  };
  const handleDailyModeToggle = async (enabled: boolean) => {
    if (enabled) {
      await activateDailyMode();
      toast.success("Daily Mode activated! 🔥");
    } else {
      // Show warning when turning OFF
      setShowConfirmDailyModeOff(true);
    }
  };
  const handleConfirmDailyModeOff = async () => {
    await deactivateDailyMode();
    setShowConfirmDailyModeOff(false);
    toast.success("Daily Mode deactivated");
  };
  const handleRestartChallenge = async () => {
    await restartChallenge();
    setShowConfirmRestart(false);
    toast.success("Challenge restarted! Day 1 ready.");
  };
  const handlePauseQuest = async () => {
    await updateProgress({
      selected_pack_id: 'daily'
    });
    setShowConfirmPause(false);
    toast.success("Quest paused. Enjoy Today's Hello!");
  };
  const handleResumeQuest = async () => {
    await updateProgress({
      selected_pack_id: '30-day-hello'
    });
    toast.success("Quest resumed! Keep going! 🎯");
  };

  // Helper to show challenge completion toast (banner is clickable to undo)
  const showChallengeCompletedToast = (day: number, challengeName: string) => {
    const toastId = toast.custom(id => <ChallengeUndoToast id={id} challengeName={challengeName} onUndo={() => unmarkDayComplete(day)} />, {
      duration: 3000
    });

    // Hard safety-net: ensure it always auto-dismisses after ~3s.
    window.setTimeout(() => {
      toast.dismiss(toastId);
    }, 3100);
  };
  const handleLogHello = async (data: {
    name?: string;
    location?: string;
    notes?: string;
    no_name_flag?: boolean;
    hello_type?: string;
  }) => {
    await addLog(data);

    // Mark challenge complete
    if (pendingChallengeCompletion) {
      await markDayComplete(pendingChallengeCompletion.day);
      showChallengeCompletedToast(pendingChallengeCompletion.day, pendingChallengeCompletion.name);
      setPendingChallengeCompletion(null);
    }
    setShowLogScreen(false);
  };

  // Show Daily Mode detail screen
  if (showDailyModeDetail) {
    return <DailyModeDetailScreen isActive={dailyModeState.isActive} currentStreak={dailyModeState.currentStreak} bestStreak={dailyModeState.bestStreak} startDate={dailyModeState.startDate} onActivate={activateDailyMode} onDeactivate={deactivateDailyMode} onBack={() => setShowDailyModeDetail(false)} />;
  }

  // Show Log Hello screen for challenge completion
  if (showLogScreen && pendingChallengeCompletion) {
    return <LogHelloScreen onBack={() => {
      setShowLogScreen(false);
      setPendingChallengeCompletion(null);
    }} onLog={async data => {
      await handleLogHello({
        ...data,
        hello_type: `Challenge: ${pendingChallengeCompletion.name}`
      });
    }} challengeTitle={pendingChallengeCompletion.name} existingLogs={logs} requireAtLeastOneField={true} />;
  }

  // Show Challenge List view
  if (showChallengeList) {
    return <ChallengeListView completedDays={challengeState.completedDays} onComplete={async (day, name) => {
      await markDayComplete(day);
      showChallengeCompletedToast(day, name);
    }} onUncomplete={async day => {
      await unmarkDayComplete(day);
    }} onBack={() => setShowChallengeList(false)} onSelectChallenge={index => {
      navigate('/', {
        state: {
          selectedChallengeIndex: index
        }
      });
    }} />;
  }
  return <div className="min-h-screen bg-background page-container">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={questsIcon} alt="Quests" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Quests</h1>
              <p className="text-sm text-muted-foreground">Track your progress</p>
            </div>
          </div>
          <img src={remiQuest} alt="Remi" className="w-16 h-16 object-contain" />
        </div>

        {/* Daily Mode Toggle Section - Compressed */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <div>
                  <span className="font-bold text-foreground">Daily Mode</span>
                  <p className="text-xs text-muted-foreground">
                    {dailyModeState.isActive ? `${dailyModeState.currentStreak} day streak 🔥` : "Track your streak"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setShowDailyModeDetail(true)} className="text-xs text-muted-foreground px-2">
                  Details
                  <ChevronRight className="w-3 h-3 ml-0.5" />
                </Button>
                <Switch checked={dailyModeState.isActive} onCheckedChange={handleDailyModeToggle} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Quest Section - 30-Day Challenge */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground">Your Active Quest</span>
            </div>
            
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                🎯
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground">The 30 Hellos</h3>
                <p className="text-xs text-muted-foreground">30 ways to start real-world connection</p>
                <p className="text-xs text-success font-medium">FREE • Perfect for Everyone</p>
                {isQuestPaused && <p className="text-xs text-warning font-medium mt-1">⏸️ Paused</p>}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">
                  Progress: {challengeState.completedCount}/{challengeState.totalCount} Complete
                </span>
              </div>
              <Progress value={challengeState.progressPercent} className="h-2" />
            </div>

            {challengeState.isComplete && <div className="bg-success/10 rounded-lg p-3 mb-4 text-center">
                <p className="text-success font-medium">🎉 Challenge Complete!</p>
              </div>}
            
            <div className="flex gap-2">
              <Button variant="default" size="sm" onClick={() => setShowChallengeList(true)} className="flex-1 rounded-full">
                View Challenges
              </Button>
              
              {/* Pause/Resume button - hide when challenge is complete */}
              {!challengeState.isComplete && (isQuestPaused ? <Button variant="outline" size="sm" onClick={handleResumeQuest} className="rounded-full" title="Resume Quest">
                    <Play className="w-4 h-4" />
                  </Button> : <Button variant="outline" size="sm" onClick={() => setShowConfirmPause(true)} className="rounded-full" title="Pause Quest">
                    <Pause className="w-4 h-4" />
                  </Button>)}
              
              <Button variant="outline" size="sm" onClick={() => setShowConfirmRestart(true)} className="rounded-full" title="Restart Challenge">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Packs Section */}
        <Card className="opacity-70 mb-8">
          <CardContent className="p-4">
            <h3 className="font-bold text-foreground mb-2">More Packs Coming Soon! 🦝</h3>
            <p className="text-sm text-muted-foreground mb-3">
              We're building new challenge packs like:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Reconnect (14 days)</li>
              <li>• New In Town (21 days)</li>
              <li>• Social Courage (10 days)</li>
              <li>• Night Out (7 days)</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3 italic">Stay tuned!</p>
          </CardContent>
        </Card>

        {/* Remi's Vault Easter Egg */}
        <div className="flex flex-col items-center pb-2">
          <button onClick={() => navigate('/vault')} className="relative opacity-40 hover:opacity-60 transition-opacity duration-300 focus:outline-none">
            <img src={vaultIcon} alt="Remi's Vault" className="w-12 h-12 object-contain" />
          </button>
          
          {/* Remi peeking next to vault */}
          <div className="relative mt-2">
            <AnimatePresence>
              {showSpeechBubble && remiMessage && !isRemiGone && <motion.div initial={{
              opacity: 0,
              scale: 0.8,
              y: 10
            }} animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }} exit={{
              opacity: 0,
              scale: 0.8,
              y: 10
            }} className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl px-3 py-2 shadow-lg whitespace-nowrap z-10">
                  <p className="text-sm font-medium text-foreground">{remiMessage}</p>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-r border-b border-border rotate-45" />
                </motion.div>}
            </AnimatePresence>
            
            {isRemiGone ? <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} className="opacity-50">
                <p className="text-xs text-muted-foreground">You scared Remi away...</p>
              </motion.div> : <motion.button onClick={handleRemiTap} whileTap={{
            scale: 0.9
          }} className="opacity-30 hover:opacity-50 transition-opacity duration-300 focus:outline-none">
                
              </motion.button>}
          </div>
        </div>
      </div>

      {/* Confirm Restart Dialog */}
      <AlertDialog open={showConfirmRestart} onOpenChange={setShowConfirmRestart}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Restart the challenge?</AlertDialogTitle>
            <AlertDialogDescription>
              Your challenge progress will be reset to Day 1. Your logged hellos in the Hellobook will be kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestartChallenge} className="rounded-xl">
              Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Daily Mode Off Dialog */}
      <AlertDialog open={showConfirmDailyModeOff} onOpenChange={setShowConfirmDailyModeOff}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Turn off Daily Mode?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current streak will end and be saved if it's your best. Daily reminders will stop. You can turn Daily Mode back on anytime to start a new streak.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Keep On</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDailyModeOff} className="rounded-xl">
              Turn Off
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Pause Quest Dialog */}
      <AlertDialog open={showConfirmPause} onOpenChange={setShowConfirmPause}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Pause your quest?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be saved. The Home screen will show "Today's Hello" prompts instead. You can resume anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePauseQuest} className="rounded-xl">
              Pause Quest
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default Challenges;