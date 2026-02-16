import { useMemo } from "react";

const QUOTES = [
  "Hello... it's me (Reminder Raccoon)",
  "One hello a day keeps the doctor away 👨‍⚕️",
  "Let's make someones day, One Hello is all it takes 🦝",
  "Hope you're having a great day, I wonder what could make it even better 👀",
  "I once said hello and made a friend, just saying 🦝",
  "My friend got married after saying hello, pretty cool",
  "99% of people light up when a stranger is simply kind.",
  "The world is full of people waiting for someone to say hello first.",
  "Connection doesn't start with confidence. It starts with courage.",
  "You never know where a hello can lead, so why not take the chance.",
  "The smallest act of courage can change someone's entire day.",
  "Strangers become friends in one sentence: 'Hey, I'm ___.'",
  "Your future best friend is currently a stranger.",
  "Every hello is evidence that the world is friendlier than your mind or media suggests.",
  "Asking how someone's day is going might be the best thing they hear all week.",
  "People carry invisible battles. A hello is a small kindness that always lands.",
  "Asking how someone is going, might just make their day. Not say anything, never will.",
  "Kindness is free. Use it like confetti 🎊",
  "The world needs more kindness - today you can contribute to that mission.",
  "Life is meaningless without connection. Go make one today, however big or small.",
  "The world is full of people waiting for someone to make the first move. Today, that's you.",
  "People will forget what you said, forget what you did, but they will never forget that you remembered their name.",
  "Awkward silences can be killed using a simple hello.",
  "Talking to strangers is like muscle, the more you do it the stronger & easier it becomes.",
  "Nothing gets easier unless you start.",
  "Today, be the initiator. The one who goes first.",
  "If it scares you a little, it's probably worth doing.",
  "Someone out there will be glad you said hello today.",
  "Saying hello is free, but the pay off is infinite.",
  "One hello at a time, we're reconnecting the world.",
  "Connection is a superpower and today you're the hero.",
  "You miss 100% of the connections you don't initiate.",
  "You've already survived 100% of the hellos you've ever given. Keep the streak alive.",
  "I eat garbage for a living and I still say hello. What's stopping you today?",
  "Asking how someone is might just make their day. Staying silent never will.",
  "The world needs more kindness. Today you're the delivery person.",
  "A small hello can change someone's entire day.",
  "Let's reconnect the world, One Hello at a time.",
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
