import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiMascot from "@/assets/remi-waving.webp";

interface DayChallengeRevealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayNumber: number;
  challengeTitle: string;
  challengeDescription: string;
  challengeSuggestion?: string;
  onAccept: () => void;
}

const remiDailyMessages = [
  "Let's start your One Hello journey! Your first challenge is ready...",
  "Day 2! You're building momentum. Here's today's challenge...",
  "Day 3 - You're getting good at this! Ready for the next one?",
  "Day 4! Over halfway there. Today's challenge is a fun one...",
  "Day 5! The courage is building. Here's your challenge...",
  "Day 6 - Almost there! This one's special...",
  "Day 7! The final challenge! Let's make it count...",
];

export const DayChallengeRevealDialog = ({
  open,
  onOpenChange,
  dayNumber,
  challengeTitle,
  challengeDescription,
  challengeSuggestion,
  onAccept,
}: DayChallengeRevealDialogProps) => {
  const messageIndex = Math.min(dayNumber - 1, remiDailyMessages.length - 1);
  const remiMessage = remiDailyMessages[messageIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={remiMascot} 
              alt="Remi" 
              className="w-24 h-auto max-h-24 animate-bounce-soft object-contain" 
            />
          </div>
          <DialogTitle className="text-xl text-center">Day {dayNumber} Challenge! 🎉</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {remiMessage}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 my-4 space-y-2 text-center">
          <h3 className="font-bold text-xl text-foreground">
            {challengeTitle}
          </h3>
          <p className="text-sm text-muted-foreground">
            {challengeDescription}
          </p>
          {challengeSuggestion && (
            <p className="text-xs italic" style={{ color: '#a67c52' }}>
              💡 {challengeSuggestion}
            </p>
          )}
        </div>

        <Button onClick={onAccept} className="w-full" size="lg">
          I'll try this today! 💪
        </Button>
      </DialogContent>
    </Dialog>
  );
};
