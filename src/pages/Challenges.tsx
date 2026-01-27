import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, ChevronRight, Check, Play } from "lucide-react";
import { packs, getPackById } from "@/data/packs";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useGuestMode } from "@/hooks/useGuestMode";
import { useChallengeCompletions } from "@/hooks/useChallengeCompletions";
import { cn } from "@/lib/utils";

const Challenges = () => {
  const navigate = useNavigate();
  const { progress: cloudProgress, updateProgress: updateCloudProgress } = useUserProgress();
  const { guestProgress, updateProgress: updateGuestProgress, isAnonymous } = useGuestMode();
  const { completions } = useChallengeCompletions();
  
  const progress = isAnonymous ? guestProgress : cloudProgress;
  const updateProgress = isAnonymous ? updateGuestProgress : updateCloudProgress;
  
  const selectedPackId = progress?.selected_pack_id;
  const [expandedPackId, setExpandedPackId] = useState<string | null>(selectedPackId || null);

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
    
    await updateProgress({ 
      selected_pack_id: packId,
      mode: 'challenge',
    });
  };

  const handleDeselectPack = async () => {
    await updateProgress({ 
      selected_pack_id: null,
      mode: 'daily',
    });
  };

  const isPackActive = (packId: string) => selectedPackId === packId;
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
            const isAvailable = isPackAvailable(pack.id);
            const packProgress = getPackProgress(pack.id);
            const isExpanded = expandedPackId === pack.id;
            const isComplete = packProgress.completed === packProgress.total && packProgress.total > 0;

            return (
              <Card 
                key={pack.id}
                className={cn(
                  "transition-all overflow-hidden",
                  isActive && "border-primary border-2 shadow-lg",
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
                      
                      {/* Challenge Preview List */}
                      <div className="space-y-2">
                        {pack.challenges.map((challenge, index) => {
                          const isCompleted = completions.some(c => c.challenge_day === challenge.day);
                          
                          return (
                            <div 
                              key={challenge.id}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-lg",
                                isCompleted ? "bg-success/10" : "bg-muted/30"
                              )}
                            >
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                isCompleted ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                              )}>
                                {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
                              </div>
                              <span className={cn(
                                "text-sm flex-1",
                                isCompleted ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {challenge.title}
                              </span>
                              <span className="text-lg">{challenge.icon}</span>
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
                            onClick={handleDeselectPack}
                          >
                            Stop
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
    </div>
  );
};

export default Challenges;
