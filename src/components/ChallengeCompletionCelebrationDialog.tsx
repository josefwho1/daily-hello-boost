import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiMascot from "@/assets/remi-waving.webp";

interface ChallengeCompletionCelebrationDialogProps {
  open: boolean;
  onContinue: () => void;
  dayNumber: number;
  currentStreak: number;
  username?: string;
  isFirstHelloEver?: boolean;
  isPerfectWeek?: boolean;
  totalChallengesCompleted?: number;
}

const getDayMessage = (dayNumber: number, streak: number, username: string, isPerfectWeek: boolean, totalChallengesCompleted: number) => {
  const name = username || "friend";
  
  // Check if this is a perfect streak completion for days 1-7
  if (streak === dayNumber && dayNumber <= 7) {
    switch (dayNumber) {
      case 1:
        return {
          title: `Congrats ${name} on your First Hello!`,
          lines: [
            "As a reward, here is an Orb 🔮",
            "These can be used to save your streak incase you miss a day!",
            "",
            "Come back tomorrow to retrieve your next challenge.",
            "I really wish you do 😊"
          ],
          showOrb: true
        };
      case 2:
        return {
          title: `Well done ${name}! I knew you'd come back.`,
          lines: [
            "2 for 2! Can we make it a trifecta?",
            "",
            "See you tomorrow 👋",
            "Hope it's a nice day ☀️"
          ]
        };
      case 3:
        return {
          title: "Rain or shine, we're having a good time.",
          lines: [
            `That's 3 in a row, ${name}!`,
            "",
            "Time to have some fun tomorrow.",
            "I'd suggest to wear something nice 👟"
          ]
        };
      case 4:
        return {
          title: `You're on a roll now ${name}!`,
          lines: [
            "Nice work! Love your shoes 👟",
            "",
            "Hope you're feeling as good as I am.",
            "See you for Day 5!"
          ]
        };
      case 5:
        return {
          title: "G'day mate, how are you going?!",
          lines: [
            "(sorry I turn Australian when I get excited)",
            "",
            "That's 5 out of 5 koalas 🐨",
            "It's time to start taking names.",
            "",
            `See you tomorrow ${name}`
          ]
        };
      case 6:
        return {
          title: `You can't be stopped & I love it, ${name}.`,
          lines: [
            "The perfect week is One Hello away.",
            "",
            "Now it's Getting Personal.",
            "See you for Day 7."
          ]
        };
      case 7:
        return {
          title: `Congratulations ${name}!!!`,
          lines: [
            "7 for 7. The perfect week.",
            "",
            "I'm so proud of you 🥺",
            "I knew you had it in you all along 🦝",
            "",
            "Here's another Orb for your superb efforts you legend."
          ],
          showOrb: true,
          isPerfectWeek: true
        };
    }
  }
  
  // User completed all 7 challenges but not with perfect streak
  if (totalChallengesCompleted === 7 && !isPerfectWeek) {
    return {
      title: "Congrats on completing all 7 challenges!",
      lines: [
        "You are officially onboarded!",
        "",
        "Here's another Orb for your efforts you beautiful human. 🔮"
      ],
      showOrb: true
    };
  }
  
  // Default message for non-streak completions
  return {
    title: dayNumber === 1 
      ? `Congrats ${name} on your First Hello!` 
      : "Nice work — that took courage! 💪",
    lines: [
      `Day ${dayNumber} complete!`,
      "Come back tomorrow for the next challenge."
    ]
  };
};

export const ChallengeCompletionCelebrationDialog = ({
  open,
  onContinue,
  dayNumber,
  currentStreak,
  username = "",
  isFirstHelloEver = false,
  isPerfectWeek = false,
  totalChallengesCompleted = 0,
}: ChallengeCompletionCelebrationDialogProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const message = getDayMessage(dayNumber, currentStreak, username, isPerfectWeek, totalChallengesCompleted);
  const isDay7Complete = dayNumber === 7 || totalChallengesCompleted === 7;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md overflow-hidden [&>button]:hidden" 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  backgroundColor: ['#ff6f3b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6b6b'][Math.floor(Math.random() * 5)],
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  borderRadius: Math.random() > 0.5 ? '50%' : '0',
                }}
              />
            ))}
          </div>
        )}

        <div className="text-center relative z-10 py-4">
          <div className="flex justify-center mb-4">
            <img 
              src={remiMascot} 
              alt="Remi celebrating" 
              className="w-24 h-auto max-h-24 animate-bounce-soft object-contain" 
            />
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-4">
            {message.title}
          </h2>
          
          <div className="text-muted-foreground space-y-1 mb-6">
            {message.lines.map((line, index) => (
              <p key={index} className={line === "" ? "h-2" : ""}>
                {line}
              </p>
            ))}
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 my-4">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < dayNumber
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < dayNumber ? '✓' : i + 1}
              </div>
            ))}
          </div>

          <Button onClick={onContinue} className="w-full mt-4" size="lg">
            {isDay7Complete ? "Choose My Journey 🚀" : "Continue ✨"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
