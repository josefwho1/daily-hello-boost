import { memo } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// Challenge celebration images
import onboardingWeatherchat from "@/assets/onboarding-weatherchat.webp";
import onboardingHelpinghand from "@/assets/onboarding-helpinghand.webp";
import onboardingCompliment from "@/assets/onboarding-compliment.webp";
import onboardingHowareyou from "@/assets/onboarding-howareyou.webp";
import onboardingGettingpersonal from "@/assets/onboarding-gettingpersonal.webp";
import onboardingTakingnames from "@/assets/onboarding-takingnames.webp";
import remiCongrats1 from "@/assets/remi-congrats-1.webp";
import remiLogging1 from "@/assets/remi-logging-1.webp";

export interface ChallengeRevealConfig {
  image: string;
  headline: string;
  body: string[];
  button: string;
}

// Map from completed day → next challenge reveal
const challengeReveals: Record<number, ChallengeRevealConfig> = {
  1: {
    image: onboardingWeatherchat,
    headline: "Next: Weather Chat",
    body: [
      "Comment on something you're both experiencing.",
      "Weather, long lines, vibes — anything shared.",
      "Examples: \"What a beautiful day\" \"Long line, hey?\" \"Great song\""
    ],
    button: "Let's do it",
  },
  2: {
    image: onboardingHelpinghand,
    headline: "Next: Helping Hand",
    body: [
      "People love being helpful. (Benjamin Franklin effect)",
      "Ask a stranger for a small favour —",
      "the time, directions, or a quick photo."
    ],
    button: "Yes sir",
  },
  3: {
    image: onboardingCompliment,
    headline: "Next: Compliment",
    body: [
      "Nice work, knew you were a natural 🦝",
      "Let's make someone's day.",
      "Give someone a genuine compliment. Clothing or accessories work great."
    ],
    button: "I'll be back 😎",
  },
  4: {
    image: onboardingHowareyou,
    headline: "Next: How Are You?",
    body: [
      "Great job.",
      "Now try asking how someone's day is going.",
      "Simple & universal."
    ],
    button: "See you soon",
  },
  5: {
    image: onboardingGettingpersonal,
    headline: "Next: Getting Personal",
    body: [
      "You're doing great.",
      "Now ask something simple to learn more about them.",
      "Where they're from. What brought them here."
    ],
    button: "On it",
  },
  6: {
    image: onboardingTakingnames,
    headline: "Next: Taking Names",
    body: [
      "You're on a roll, it's time to start taking names!",
      "Names are like magic, they turn strangers into people.",
      "Start a conversation with a stranger and get their name.",
      "Save it in your Hellobook so you don't forget."
    ],
    button: "Got it, Remi.",
  },
};

// Final completion screen (day 7 done)
const finalCompletion: ChallengeRevealConfig = {
  image: remiCongrats1,
  headline: "🎉 Initiation Complete 🎉",
  body: [
    "You showed up. You spoke to strangers. You did the thing.",
    "You can officially turn a stranger into a friend.",
    "Welcome to the Gaze",
    "(that's what a group of raccoons is called 🦝)"
  ],
  button: "Raccoons unite",
};

// Post-completion normal mode screen
const normalModeScreen: ChallengeRevealConfig = {
  image: remiLogging1,
  headline: "Your journey doesn't stop here.",
  body: [
    "Keep saying hello to maintain your streak.",
    "Log names in your Hellobook.",
    "Explore quests for new ways to connect."
  ],
  button: "Let's do it",
};

interface ChallengeRevealDialogProps {
  open: boolean;
  completedDay: number;
  userName?: string;
  onContinue: () => void;
}

export const ChallengeRevealDialog = memo(({ open, completedDay, userName, onContinue }: ChallengeRevealDialogProps) => {
  if (!open) return null;

  // Determine which screen to show
  let config: ChallengeRevealConfig;
  
  if (completedDay === 7) {
    config = finalCompletion;
  } else if (completedDay === 8) {
    // Post-final: normal mode transition
    config = normalModeScreen;
  } else {
    config = challengeReveals[completedDay] || challengeReveals[1];
  }

  // Inject user name into body if available
  const bodyLines = config.body.map(line => {
    if (userName) {
      return line.replace(/\bname\b/i, (match) => {
        // Only replace standalone "name" that looks like a placeholder
        return match === 'name' ? userName : match;
      });
    }
    return line;
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] bg-background flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-full max-w-md text-center space-y-6"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <img
              src={config.image}
              alt={config.headline}
              className="w-56 h-auto max-h-56 mx-auto object-contain"
            />

            <h1 className="text-2xl font-bold text-foreground">
              {config.headline}
            </h1>

            <div className="space-y-2">
              {bodyLines.map((line, i) => (
                <p key={i} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>
                  {line}
                </p>
              ))}
            </div>

            <Button onClick={onContinue} className="w-full" size="lg">
              {config.button}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

ChallengeRevealDialog.displayName = 'ChallengeRevealDialog';
