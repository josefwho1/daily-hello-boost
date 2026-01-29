import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Check, Play, Pause, RotateCcw } from "lucide-react";
import { packs, getPackById } from "@/data/packs";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useChallengeCompletions } from "@/hooks/useChallengeCompletions";
import { cn } from "@/lib/utils";
import { differenceInDays, parseISO, startOfDay } from "date-fns";
import { toast } from "sonner";
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
  const { progress: cloudProgress, updateProgress: updateCloudProgress } = useUserProgress();
  const [restartingPackId, setRestartingPackId] = useState<string | null>(null);
  const [confirmRestartPackId, setConfirmRestartPackId] = useState<string | null>(null);
  const { guestProgress, updateProgress: updateGuestProgress, isAnonymous } = useGuestMode();
  const { completions, clearCompletionsByTags, refetch: refetchCompletions } = useChallengeCompletions();
  
  const progress = isAnonymous ? guestProgress : cloudProgress;
  const updateProgress = isAnonymous ? updateGuestProgress : updateCloudProgress;
  
  const selectedPackId = progress?.selected_pack_id;
  const packStartDate = progress?.pack_start_date;

  // Calculate how many days are unlocked based on pack start date
  const getUnlockedDays = (packId: string) => {
    if (!packStartDate) return 1; // At least day 1 is unlocked
    const today = startOfDay(new Date());
    const startDate = startOfDay(parseISO(packStartDate));
    return differenceInDays(today, startDate) + 1; // +1 because day 1 unlocks on start date
  };

  // Calculate completion for the 7-day pack
  const getPackProgress = (packId: string) => {
    const pack = getPackById(packId);
    if (!pack || pack.challenges.length === 0) return { completed: 0, total: 0 };
    
    // Use challenge_tag for more reliable tracking across packs
    const completed = pack.challenges.filter(challenge => 
      completions.some(c => c.challenge_tag === challenge.tag || c.challenge_day === challenge.day)
    ).length;
    
    return { completed, total: pack.challenges.length };
  };

  const handleSelectPack = async (packId: string) => {
    const pack = getPackById(packId);
    if (!pack || pack.challenges.length === 0) return;
    
    // Set pack_start_date to now when starting a new pack
    await updateProgress({ 
      selected_pack_id: packId,
      pack_start_date: new Date().toISOString(),
      mode: 'challenge',
    });
  };

  const handlePausePack = async () => {
    // Use empty string instead of null due to NOT NULL constraint
    // Keep pack_start_date so user can resume where they left off
    await updateProgress({ 
      selected_pack_id: '',
      mode: 'daily',
    });
  };

  const handleResumePack = async (packId: string) => {
    // Resume uses existing pack_start_date
    await updateProgress({ 
      selected_pack_id: packId,
      mode: 'challenge',
    });
  };

  const handleRestartPack = async (packId: string) => {
    setRestartingPackId(packId);
    setConfirmRestartPackId(null);
    try {
      // Clear challenge completions for this pack (preserves hello logs)
      // IMPORTANT: pack ids and challenge tag prefixes are not guaranteed to match.
      const pack = getPackById(packId);
      const tagsToClear = (pack?.challenges || [])
        .map((c) => c.tag)
        .filter((t): t is string => typeof t === 'string' && t.length > 0);

      await clearCompletionsByTags(tagsToClear);
      
      // Refetch completions to update UI immediately
      await refetchCompletions();
      
      // Reset pack_start_date to now and activate the pack
      await updateProgress({ 
        selected_pack_id: packId,
        pack_start_date: new Date().toISOString(),
        mode: 'challenge',
      });
      
      toast.success('Challenge restarted! Day 1 unlocked.');
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

  const isPackActive = (packId: string) => selectedPackId === packId;
  const isPackPaused = (packId: string) => {
    // Pack is paused if it has completions but is not currently selected
    const packProgress = getPackProgress(packId);
    return (!selectedPackId || selectedPackId === '') && packProgress.completed > 0;
  };
  const isPackAvailable = (packId: string) => {
    const pack = getPackById(packId);
    return pack && pack.challenges.length > 0;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Challenges</h1>
            <p className="text-sm text-muted-foreground">Select a challenge pack to begin</p>
          </div>
        </div>

        {/* Challenge Packs */}
        <div className="space-y-4">
          {packs.map((pack) => {
            const isActive = isPackActive(pack.id);
            const isPaused = isPackPaused(pack.id);
            const isAvailable = isPackAvailable(pack.id);
            const packProgress = getPackProgress(pack.id);
            const isComplete = packProgress.completed === packProgress.total && packProgress.total > 0;

            return (
              <Card 
                key={pack.id}
                className={cn(
                  "transition-all overflow-hidden",
                  isActive && "border-primary border-2 shadow-lg",
                  isPaused && "border-muted-foreground/30 border-2",
                  !isAvailable && "opacity-60"
                )}
              >
                <CardContent className="p-4">
                  {/* Pack Header */}
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center text-2xl",
                      isActive ? "bg-primary/20" : "bg-muted"
                    )}>
                      {pack.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground truncate">{pack.name}</h3>
                        {isActive && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                        {isPaused && !isComplete && (
                          <span className="text-xs bg-muted-foreground/20 text-muted-foreground px-2 py-0.5 rounded-full">
                            Paused
                          </span>
                        )}
                        {isComplete && (
                          <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </div>
                      
                      {isAvailable ? (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${(packProgress.completed / packProgress.total) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {packProgress.completed}/{packProgress.total}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
                      )}
                    </div>
                  </div>

                  {/* Pack Content - Always show for available packs */}
                  {isAvailable && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      <p className="text-sm text-muted-foreground">{pack.description}</p>
                      
                      {/* Action Button */}
                      {isActive ? (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => navigate("/")}
                            className="flex-1"
                          >
                            Continue Challenge
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={handlePausePack}
                          >
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </Button>
                        </div>
                      ) : isPaused && !isComplete ? (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleResumePack(pack.id)}
                            className="flex-1"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Resume
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleRequestRestart(pack.id)}
                            disabled={restartingPackId === pack.id}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Restart
                          </Button>
                        </div>
                      ) : isComplete ? (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleSelectPack(pack.id)}
                            className="flex-1"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Again
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleRequestRestart(pack.id)}
                            disabled={restartingPackId === pack.id}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Restart
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleSelectPack(pack.id)}
                          className="w-full"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Challenge
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Complete challenges to build social confidence ✨
          </p>
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
