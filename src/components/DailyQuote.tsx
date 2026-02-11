import { useMemo } from "react";

const QUOTES = [
  "Connection doesn't start with confidence. It starts with courage.",
  "You never know where a hello can lead, so why not take the chance.",
  "Strangers become friends in one sentence: 'Hey, I'm ___.\"",
  "Every hello is evidence that the world is less scary than your mind suggests.",
  "Asking how someone's day is going might be the best thing they hear all week.",
  "People carry invisible battles. A hello is a small kindness that always lands.",
  "Asking how someone is going, might just make their day. Not say anything, never will.",
  "Kindness is free. Use it like confetti.",
  "The world needs more kindness — today you can contribute to that mission.",
  "People will forget what you said, forget what you did, but they will never forget that you remembered their name.",
  "Awkward silences can be killed using a simple hello.",
  "You're not bad at talking to people — you're just out of practice.",
  "Talking to strangers is like a muscle, the more you do it the stronger & easier it becomes.",
  "Nothing gets easier unless you start.",
  "Today, be the initiator. The one who goes first.",
  "Saying hello is a habit, and habits shape lives.",
  "Just try. Your courage is bigger than your doubt.",
  "Someone out there will be glad you said hello today.",
  "One Hello at a time, we're rebuilding the world.",
  "Connection is a superpower and today you're the hero.",
  "You've already survived 100% of the hellos you've ever given. Keep the streak alive.",
  "I eat garbage for a living and I still say hello. What's stopping you today?",
  "Asking how someone is might just make their day. Staying silent never will.",
  "The world needs more kindness. Today you're the delivery guy.",
];

export const DailyQuote = () => {
  const quote = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  return (
    <div className="text-center px-6 py-4 mb-4">
      <p className="text-sm text-muted-foreground/60 italic leading-relaxed">
        "{quote}"
      </p>
    </div>
  );
};
