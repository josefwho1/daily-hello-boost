import { Button } from "@/components/ui/button";
import remiCelebrating from "@/assets/remi-celebrating-3.webp";

interface OnboardingCompleteMilestoneScreenProps {
  onContinue: () => void;
}

export const OnboardingCompleteMilestoneScreen = ({
  onContinue,
}: OnboardingCompleteMilestoneScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div className="h-full bg-primary w-full" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <img 
            src={remiCelebrating} 
            alt="Remi celebrating" 
            className="w-40 h-auto max-h-40 mx-auto object-contain animate-bounce-soft" 
          />
          
          <h1 className="text-2xl font-bold text-foreground">
            🎉 Congratulations 🎉
          </h1>
          
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Initiation complete.</p>
            <p className="text-muted-foreground">You can officially turn a stranger into a friend.</p>
            <p className="text-foreground font-medium">Welcome to the Gaze</p>
            <p className="text-sm text-muted-foreground">(that's what a group of raccoons is called 🦝)</p>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">
              Now it's time to choose how you want to continue your journey...
            </p>
          </div>

          <Button onClick={onContinue} className="w-full" size="lg">
            Choose My Mode 🚀
          </Button>
        </div>
      </div>
    </div>
  );
};
