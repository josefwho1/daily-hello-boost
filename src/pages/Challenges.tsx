import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ChevronRight, Check, Play, Pause, Lock } from "lucide-react";
import { packs, getPackById } from "@/data/packs";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useChallengeCompletions } from "@/hooks/useChallengeCompletions";
import { cn } from "@/lib/utils";
import { differenceInDays, parseISO, startOfDay } from "date-fns";

const Challenges = () => {
  const navigate = useNavigate();
  const { progress: cloudProgress, updateProgress: updateCloudProgress } = useUserProgress();
  const { guestProgress, updateProgress: updateGuestProgress, isAnonymous } = useGuestMode();
  const { completions } = useChallengeCompletions();
  
  const progress = isAnonymous ? guestProgress : cloudProgress;
  const updateProgress = isAnonymous ? updateGuestProgress : updateCloudProgress;
  
  const selectedPackId = progress?.selected_pack_id;
  const packStartDate = progress?.pack_start_date;
  const [expandedPackId, setExpandedPackId] = useState<string | null>(selectedPackId || null);

  // Calculate how many days are unlocked based on pack start date
  const getUnlockedDays = (packId: string) => {
    if (selectedPackId !== packId || !packStartDate) return 0;
    const today = startOfDay(new Date());
    const startDate = startOfDay(parseISO(packStartDate));
    return differenceInDays(today, startDate) + 1; // +1 because day 1 unlocks on start date
  };

  // Calculate completion for the 7-day pack
  const getPackProgress = (packId: string) => {
    const pack = getPackById(packId);
    if (!pack || pack.challenges.length === 0) return { completed: 0, total: 0 };
    
    const completed = pack.challenges.filter(challenge => 
      completions.some(c => c.challenge_day === challenge.day)
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
    // Pause keeps pack_start_date so user can resume where they left off
    await updateProgress({ 
      selected_pack_id: null,
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

  const isPackActive = (packId: string) => selectedPackId === packId;
  const isPackPaused = (packId: string) => {
    // Pack is paused if it has a start date but is not currently selected
    return !selectedPackId && packStartDate && getPackProgress(packId).completed > 0;
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
            const isExpanded = expandedPackId === pack.id;
            const isComplete = packProgress.completed === packProgress.total && packProgress.total > 0;
            const unlockedDays = getUnlockedDays(pack.id);

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
                  <div 
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => isAvailable && setExpandedPackId(isExpanded ? null : pack.id)}
                  >
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
                        {isPaused && (
                          <span className="text-xs bg-muted-foreground/20 text-muted-foreground px-2 py-0.5 rounded-full">
                            Paused
                          </span>
                        )}
                        {isComplete && (
                          <Check className="w-4 h-4 text-success" />
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
                    
                    {isAvailable && (
                      <ChevronRight className={cn(
                        "w-5 h-5 text-muted-foreground transition-transform",
                        isExpanded && "rotate-90"
                      )} />
                    )}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && isAvailable && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      <p className="text-sm text-muted-foreground">{pack.description}</p>
                      
                      {/* Challenge Preview List - Only show unlocked challenges */}
                      <div className="space-y-2">
                        {pack.challenges.map((challenge, index) => {
                          const isCompleted = completions.some(c => c.challenge_day === challenge.day);
                          const isChallengeUnlocked = isActive ? index < unlockedDays : isCompleted;
                          const isFirstChallenge = index === 0;
                          
                          // Only show: first challenge, completed challenges, or unlocked challenges
                          const shouldShowDetails = isFirstChallenge || isCompleted || isChallengeUnlocked;
                          
                          return (
                            <div 
                              key={challenge.id}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-lg",
                                isCompleted ? "bg-success/10" : 
                                isChallengeUnlocked ? "bg-muted/30" : 
                                "bg-muted/10"
                              )}
                            >
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                isCompleted ? "bg-success text-success-foreground" : 
                                isChallengeUnlocked ? "bg-muted text-muted-foreground" :
                                "bg-muted/50 text-muted-foreground/50"
                              )}>
                                {isCompleted ? <Check className="w-3 h-3" /> : 
                                 !isChallengeUnlocked && !isFirstChallenge ? <Lock className="w-3 h-3" /> : 
                                 index + 1}
                              </div>
                              <span className={cn(
                                "text-sm flex-1",
                                isCompleted ? "text-foreground" : 
                                shouldShowDetails ? "text-muted-foreground" :
                                "text-muted-foreground/50"
                              )}>
                                {shouldShowDetails ? challenge.title : "???"}
                              </span>
                              <span className={cn(
                                "text-lg",
                                !shouldShowDetails && "opacity-30 grayscale"
                              )}>
                                {shouldShowDetails ? challenge.icon : "🔒"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      
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
                      ) : isPaused ? (
                        <Button 
                          onClick={() => handleResumePack(pack.id)}
                          className="w-full"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Resume Challenge
                        </Button>
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
    </div>
  );
};

export default Challenges;
