import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useUserProgressQuery } from "@/hooks/useUserProgressQuery";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useDailyMode } from "@/hooks/useDailyMode";
import { useChallengeProgress } from "@/hooks/useChallengeProgress";
import { useHelloLogs } from "@/hooks/useHelloLogs";
import { ChallengeListView } from "@/components/ChallengeListView";
import { ThirtyHellosListView } from "@/components/ThirtyHellosListView";
import { LogHelloScreen } from "@/components/LogHelloScreen";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, ChevronRight, RotateCcw, Pause, Play, Shuffle, Check } from "lucide-react";
import { toast } from "sonner";
import { ChallengeUndoToast } from "@/components/ChallengeUndoToast";
import questsIcon from "@/assets/quests-icon.webp";
import remiQuest from "@/assets/remi-quest.webp";
import vaultIcon from "@/assets/vault-icon.webp";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { thirtyHellosChallenge } from "@/data/thirtyHellosChallenge";

const Challenges = () => {
  const navigate = useNavigate();
  const { progress: cloudProgress, updateProgress: updateCloudProgress, loading: cloudLoading } = useUserProgressQuery();
  const { guestProgress, updateProgress: updateGuestProgress, isAnonymous, loading: guestLoading } = useGuestMode();
  const { logs, addLog } = useHelloLogs();
  const { state: dailyModeState, activateDailyMode, deactivateDailyMode, loading: dailyModeLoading } = useDailyMode();
  const { state: challengeState, markDayComplete, unmarkDayComplete, restartChallenge, loading: challengeLoading } = useChallengeProgress();

  const [showChallengeList, setShowChallengeList] = useState(false);
  const [showThirtyHellosList, setShowThirtyHellosList] = useState(false);
  const [showConfirmRestart7Day, setShowConfirmRestart7Day] = useState(false);
  const [showConfirmSwitch, setShowConfirmSwitch] = useState<string | null>(null); // target pack id
  const [showLogScreen, setShowLogScreen] = useState(false);
  const [pendingChallengeCompletion, setPendingChallengeCompletion] = useState<{ day: number; name: string } | null>(null);

  const progress = isAnonymous ? guestProgress : cloudProgress;
  const updateProgress = isAnonymous ? updateGuestProgress : updateCloudProgress;
  const isLoading = (isAnonymous ? guestLoading : cloudLoading) || challengeLoading || dailyModeLoading;

  // Never default to 'daily' — preserve the user's actual pack selection
  // Using '30-day-hello' as fallback prevents falsely showing Today's Hello as active during loading
  const selectedPack = progress?.selected_pack_id || '30-day-hello';

  const thirtyHellosCompletedCount = logs.filter(l => l.hello_type?.startsWith('thirty:')).length;


  // Switch to a pack (with confirmation if another quest is active)
  const handleSelectPack = (packId: string) => {
    if (selectedPack === packId) return;
    // If currently on a quest (not daily), confirm switch
    if (selectedPack !== 'daily' && packId !== selectedPack) {
      setShowConfirmSwitch(packId);
    } else {
      doSwitch(packId);
    }
  };

  const doSwitch = async (packId: string) => {
    await updateProgress({ selected_pack_id: packId });
    setShowConfirmSwitch(null);
    const names: Record<string, string> = {
      'daily': "Today's Hello",
      '30-day-hello': '7-Day Challenge',
      '30-hellos': '30 Hellos',
    };
    toast.success(`${names[packId] || packId} activated! 🎯`);
  };

  const handlePauseToDailyMode = async () => {
    await updateProgress({ selected_pack_id: 'daily' });
    toast.success("Quest paused. Enjoy Today's Hello!");
  };

  const handleRestart7Day = async () => {
    await restartChallenge();
    setShowConfirmRestart7Day(false);
    toast.success("Challenge restarted! Day 1 ready.");
  };

  const showChallengeCompletedToast = (day: number, challengeName: string) => {
    const toastId = toast.custom(id => (
      <ChallengeUndoToast id={id} challengeName={challengeName} onUndo={() => unmarkDayComplete(day)} />
    ), { duration: 3000 });
    window.setTimeout(() => toast.dismiss(toastId), 3100);
  };

  const handleLogHello = async (data: {
    name?: string; location?: string; notes?: string;
    no_name_flag?: boolean; hello_type?: string;
  }) => {
    await addLog(data);
    if (pendingChallengeCompletion) {
      await markDayComplete(pendingChallengeCompletion.day);
      showChallengeCompletedToast(pendingChallengeCompletion.day, pendingChallengeCompletion.name);
      setPendingChallengeCompletion(null);
    }
    setShowLogScreen(false);
  };

  // Sub-screens
  if (showLogScreen && pendingChallengeCompletion) {
    return <LogHelloScreen
      onBack={() => { setShowLogScreen(false); setPendingChallengeCompletion(null); }}
      onLog={async data => {
        await handleLogHello({ ...data, hello_type: `Challenge: ${pendingChallengeCompletion.name}` });
      }}
      challengeTitle={pendingChallengeCompletion.name}
      existingLogs={logs}
      requireAtLeastOneField={true}
    />;
  }

  if (showThirtyHellosList) {
    return <ThirtyHellosListView
      completedDays={challengeState.completedDays}
      onComplete={async (day, name) => {
        await markDayComplete(day);
        showChallengeCompletedToast(day, name);
      }}
      onBack={() => setShowThirtyHellosList(false)}
    />;
  }

  if (showChallengeList) {
    return <ChallengeListView
      completedDays={challengeState.completedDays}
      onComplete={async (day, name) => {
        setPendingChallengeCompletion({ day, name });
        setShowLogScreen(true);
      }}
      onUncomplete={async day => { await unmarkDayComplete(day); }}
      onBack={() => setShowChallengeList(false)}
      onSelectChallenge={index => {
        navigate('/', { state: { selectedChallengeIndex: index } });
      }}
    />;
  }

  // --- Quest Card Component ---
  const QuestCard = ({ 
    id, icon, title, description, subtitle,
    isActive, isComplete, progressValue, progressLabel,
    onStart, onPause, onViewChallenges, onRestart,
  }: {
    id: string; icon: string; title: string; description: string; subtitle: string;
    isActive: boolean; isComplete?: boolean; progressValue: number; progressLabel: string;
    onStart: () => void; onPause?: () => void; onViewChallenges?: () => void; onRestart?: () => void;
  }) => (
    <Card className={`mb-4 transition-all ${isActive ? 'ring-2 ring-primary/50 border-primary/30' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground text-sm">{title}</h3>
              {isActive && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-success/20 text-success rounded-full">
                  ACTIVE
                </span>
              )}
              {isComplete && !isActive && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-muted text-muted-foreground rounded-full">
                  DONE
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            <p className="text-xs text-success font-medium mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Progress */}
        {id !== 'daily' && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">{progressLabel}</span>
            </div>
            <Progress value={progressValue} className="h-1.5" />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!isActive ? (
            <Button variant="default" size="sm" onClick={onStart} className="flex-1 rounded-full text-xs h-8">
              <Play className="w-3.5 h-3.5 mr-1" />
              {id === 'daily' ? 'Activate' : (progressValue > 0 ? 'Resume' : 'Start')}
            </Button>
          ) : (
            <>
              {id !== 'daily' && onPause && (
                <Button variant="outline" size="sm" onClick={onPause} className="rounded-full text-xs h-8" title="Pause">
                  <Pause className="w-3.5 h-3.5" />
                </Button>
              )}
            </>
          )}
          
          {onViewChallenges && (
            <Button variant="outline" size="sm" onClick={onViewChallenges} className="flex-1 rounded-full text-xs h-8">
              View Challenges
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}

          {onRestart && (
            <Button variant="ghost" size="sm" onClick={onRestart} className="rounded-full text-xs h-8 px-2" title="Restart">
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background page-container">
      <div className="max-w-md mx-auto px-4 py-6 pb-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={questsIcon} alt="Quests" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Quests</h1>
              <p className="text-sm text-muted-foreground">Choose your path</p>
            </div>
          </div>
          <img src={remiQuest} alt="Remi" className="w-16 h-16 object-contain" />
        </div>

        {/* Daily Mode Card */}
        <QuestCard
          id="daily"
          icon="💡"
          title="Today's Hello"
          description="Daily prompts for ideas or inspiration."
          subtitle="Always Free"
          isActive={selectedPack === 'daily'}
          progressValue={0}
          progressLabel=""
          onStart={() => handleSelectPack('daily')}
        />

        {/* 7-Day Challenge Card */}
        <QuestCard
          id="30-day-hello"
          icon="🎯"
          title="7-Day Challenge"
          description="Perfect for a confidence boost, from friendly hello to getting a strangers name"
          subtitle="FREE • Perfect for Everyone"
          isActive={selectedPack === '30-day-hello'}
          isComplete={challengeState.isComplete}
          progressValue={challengeState.progressPercent}
          progressLabel={`${challengeState.completedCount}/${challengeState.totalCount} Complete`}
          onStart={() => handleSelectPack('30-day-hello')}
          onPause={handlePauseToDailyMode}
          onViewChallenges={() => setShowChallengeList(true)}
          onRestart={() => setShowConfirmRestart7Day(true)}
        />


        {/* More quests coming soon note */}
        <div className="text-center mt-4 mb-4">
          <p className="text-sm text-muted-foreground">
            More quests coming soon! For ideas, feedback or suggestions message us at{' '}
            <a
              href="https://www.instagram.com/onehelloco"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              @onehelloco
            </a>
            {' '}on Instagram.
          </p>
        </div>

        {/* Vault Easter Egg */}
        <div className="pb-2 flex-row flex items-center justify-center mt-2">
          <button onClick={() => navigate('/vault')} className="relative focus:outline-none">
            <img src={vaultIcon} alt="Remi's Vault" className="w-12 h-12 object-contain" />
          </button>
          <p className="text-xs text-muted-foreground ml-2">What do we have here...?</p>
        </div>
      </div>

      {/* Confirm Restart 7-Day Dialog */}
      <AlertDialog open={showConfirmRestart7Day} onOpenChange={setShowConfirmRestart7Day}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Restart the challenge?</AlertDialogTitle>
            <AlertDialogDescription>
              Your challenge progress will be reset to Day 1. Your logged hellos in the Hellobook will be kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestart7Day} className="rounded-xl">Restart</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Switch Quest Dialog */}
      <AlertDialog open={!!showConfirmSwitch} onOpenChange={() => setShowConfirmSwitch(null)}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Switch quest?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current quest will be paused. Progress is saved and you can resume anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => showConfirmSwitch && doSwitch(showConfirmSwitch)} className="rounded-xl">
              Switch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Challenges;
