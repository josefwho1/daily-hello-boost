import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { packs, getPackById } from "@/data/packs";
import { useUserProgressQuery } from "@/hooks/useUserProgressQuery";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useChallengeCompletionsQuery } from "@/hooks/useChallengeCompletionsQuery";
import { useDailyMode } from "@/hooks/useDailyMode";
import { ChallengeCardSkeleton } from "@/components/ChallengeCardSkeleton";
import { DailyModeTile } from "@/components/DailyModeTile";
import { DailyModeDetailScreen } from "@/components/DailyModeDetailScreen";
import { IntroSeriesCard } from "@/components/IntroSeriesCard";
import { IntroSeriesDetailScreen } from "@/components/IntroSeriesDetailScreen";
import { Card, CardContent } from "@/components/ui/card";
import { differenceInDays, parseISO, startOfDay } from "date-fns";
import { toast } from "sonner";
import vaultIcon from "@/assets/vault-icon.webp";
import questsIcon from "@/assets/quests-icon.webp";
import remiQuest from "@/assets/remi-quest.webp";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Challenges = () => {
  const navigate = useNavigate();
  const { progress: cloudProgress, updateProgress: updateCloudProgress, loading: cloudLoading } = useUserProgressQuery();
  const [restartingPackId, setRestartingPackId] = useState<string | null>(null);
  const [confirmRestartPackId, setConfirmRestartPackId] = useState<string | null>(null);
  const [showDailyModeDetail, setShowDailyModeDetail] = useState(false);
  const [showIntroSeriesDetail, setShowIntroSeriesDetail] = useState(false);
  const { guestProgress, updateProgress: updateGuestProgress, isAnonymous, loading: guestLoading } = useGuestMode();
  const { completions, clearCompletionsByTags, refetch: refetchCompletions, loading: completionsLoading } = useChallengeCompletionsQuery();
  const { state: dailyModeState, activateDailyMode, deactivateDailyMode, loading: dailyModeLoading } = useDailyMode();
  
  const progress = isAnonymous ? guestProgress : cloudProgress;
  const updateProgress = isAnonymous ? updateGuestProgress : updateCloudProgress;
  const isLoading = (isAnonymous ? guestLoading : cloudLoading) || completionsLoading;
  
  const selectedPackId = progress?.selected_pack_id;
  const packStartDate = progress?.pack_start_date;

  // Get the 7-day intro pack
  const introPack = getPackById("7-day-hello");

  // Calculate how many days are unlocked based on pack start date
  const getUnlockedDays = (packId: string) => {
    if (!packStartDate) return 1;
    const today = startOfDay(new Date());
    const startDate = startOfDay(parseISO(packStartDate));
    return differenceInDays(today, startDate) + 1;
  };

  // Calculate completion for a pack
  const getPackProgress = (packId: string) => {
    const pack = getPackById(packId);
    if (!pack || pack.challenges.length === 0) return { completed: 0, total: 0 };
    
    const completed = pack.challenges.filter(challenge => 
      completions.some(c => c.challenge_tag === challenge.tag || c.challenge_day === challenge.day)
    ).length;
    
    return { completed, total: pack.challenges.length };
  };

  // Get pack status
  const getPackStatus = (packId: string): "not-started" | "active" | "paused" | "completed" => {
    const packProgress = getPackProgress(packId);
    const isActive = selectedPackId === packId;
    const isComplete = packProgress.completed === packProgress.total && packProgress.total > 0;
    const hasProgress = packProgress.completed > 0;
    
    if (isComplete) return "completed";
    if (isActive) return "active";
    if (hasProgress && !isActive) return "paused";
    return "not-started";
  };

  // Get completion date for intro series (if completed)
  const getCompletionDate = (packId: string): string | null => {
    const pack = getPackById(packId);
    if (!pack) return null;
    
    const packProgress = getPackProgress(packId);
    if (packProgress.completed !== packProgress.total) return null;
    
    // Find the latest completion date among all challenges in the pack
    const packCompletions = completions.filter(c => 
      pack.challenges.some(ch => ch.tag === c.challenge_tag || ch.day === c.challenge_day)
    );
    
    if (packCompletions.length === 0) return null;
    
    const latestCompletion = packCompletions.reduce((latest, current) => {
      return new Date(current.completed_at) > new Date(latest.completed_at) ? current : latest;
    });
    
    return latestCompletion.completed_at;
  };

  const handleSelectPack = async (packId: string) => {
    const pack = getPackById(packId);
    if (!pack || pack.challenges.length === 0) return;
    
    await updateProgress({ 
      selected_pack_id: packId,
      pack_start_date: new Date().toISOString(),
      mode: 'challenge',
    });
    setShowIntroSeriesDetail(false);
    navigate("/");
  };

  const handlePausePack = async () => {
    await updateProgress({ 
      selected_pack_id: '',
      mode: 'daily',
    });
    setShowIntroSeriesDetail(false);
  };

  const handleResumePack = async (packId: string) => {
    await updateProgress({ 
      selected_pack_id: packId,
      mode: 'challenge',
    });
    setShowIntroSeriesDetail(false);
    navigate("/");
  };

  const handleRestartPack = async (packId: string) => {
    setRestartingPackId(packId);
    setConfirmRestartPackId(null);
    try {
      const pack = getPackById(packId);
      const tagsToClear = (pack?.challenges || [])
        .map((c) => c.tag)
        .filter((t): t is string => typeof t === 'string' && t.length > 0);

      await clearCompletionsByTags(tagsToClear);
      await refetchCompletions();
      
      await updateProgress({ 
        selected_pack_id: packId,
        pack_start_date: new Date().toISOString(),
        mode: 'challenge',
      });
      
      toast.success('Challenge restarted! Day 1 unlocked.');
      setShowIntroSeriesDetail(false);
      navigate("/");
    } catch (error) {
      console.error('Failed to restart pack:', error);
      toast.error('Failed to restart challenge');
    } finally {
      setRestartingPackId(null);
    }
  };

  const handleRequestRestart = (packId: string) => {
    setConfirmRestartPackId(packId);
  };

  // Show Daily Mode detail screen
  if (showDailyModeDetail) {
    return (
      <DailyModeDetailScreen
        isActive={dailyModeState.isActive}
        currentStreak={dailyModeState.currentStreak}
        bestStreak={dailyModeState.bestStreak}
        startDate={dailyModeState.startDate}
        onActivate={activateDailyMode}
        onDeactivate={deactivateDailyMode}
        onBack={() => setShowDailyModeDetail(false)}
      />
    );
  }

  // Show Intro Series detail screen
  if (showIntroSeriesDetail && introPack) {
    const introProgress = getPackProgress("7-day-hello");
    const introStatus = getPackStatus("7-day-hello");
    const completionDate = getCompletionDate("7-day-hello");

    return (
      <IntroSeriesDetailScreen
        status={introStatus}
        completedCount={introProgress.completed}
        totalCount={introProgress.total}
        completionDate={completionDate}
        onBack={() => setShowIntroSeriesDetail(false)}
        onBegin={() => handleSelectPack("7-day-hello")}
        onResume={() => handleResumePack("7-day-hello")}
        onRestart={() => handleRequestRestart("7-day-hello")}
        onPause={handlePausePack}
      />
    );
  }

  // Intro series data
  const introProgress = introPack ? getPackProgress("7-day-hello") : { completed: 0, total: 7 };
  const introStatus = getPackStatus("7-day-hello");

  // Get other packs (excluding intro series)
  const otherPacks = packs.filter(pack => pack.id !== "7-day-hello");

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={questsIcon} alt="Quests" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Quests</h1>
              <p className="text-sm text-muted-foreground">Select a quest to begin</p>
            </div>
          </div>
          <img src={remiQuest} alt="Remi" className="w-16 h-16 object-contain" />
        </div>

        {/* Daily Mode Tile */}
        <div className="mb-4">
          <DailyModeTile
            isActive={dailyModeState.isActive}
            bestStreak={dailyModeState.bestStreak}
            onClick={() => setShowDailyModeDetail(true)}
          />
        </div>

        {/* Intro Series Card */}
        {isLoading ? (
          <ChallengeCardSkeleton />
        ) : introPack && (
          <div className="mb-4">
            <IntroSeriesCard
              status={introStatus}
              completedCount={introProgress.completed}
              totalCount={introProgress.total}
              onClick={() => setShowIntroSeriesDetail(true)}
            />
          </div>
        )}

        {/* Other Packs (Coming Soon) */}
        <div className="space-y-4">
          {isLoading ? (
            <ChallengeCardSkeleton />
          ) : (
            otherPacks.map((pack) => (
              <Card key={pack.id} className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-muted">
                      {pack.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground">{pack.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Vault Easter Egg */}
        <div className="mt-8 mb-2 flex justify-center">
          <button
            onClick={() => navigate('/vault')}
            className="opacity-40 hover:opacity-100 transition-opacity duration-300"
            aria-label="Open Remi's Vault"
          >
            <img 
              src={vaultIcon} 
              alt="Vault" 
              className="w-10 h-10 object-contain"
            />
          </button>
        </div>
      </div>

      {/* Restart Confirmation Dialog */}
      <AlertDialog open={!!confirmRestartPackId} onOpenChange={(open) => !open && setConfirmRestartPackId(null)}>
        <AlertDialogContent className="rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Restart this challenge?</AlertDialogTitle>
            <AlertDialogDescription>
              Your challenge progress will be reset to Day 1. Your logged hellos in the Hellobook will be kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => confirmRestartPackId && handleRestartPack(confirmRestartPackId)}
              className="rounded-xl"
              disabled={restartingPackId !== null}
            >
              {restartingPackId ? "Restarting..." : "Restart"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Challenges;
