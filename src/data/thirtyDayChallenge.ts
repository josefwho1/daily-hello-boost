export interface ThirtyDayChallenge {
  day: number;
  name: string;
  description: string;
  suggestion: string;
}

export const thirtyDayChallenge: ThirtyDayChallenge[] = [
  {
    day: 1,
    name: "First Hello",
    description: "Smile & say Hello to one stranger",
    suggestion: "\"Hello\" \"Hey\" \"Good Morning\""
  },
  {
    day: 2,
    name: "Weather Chat",
    description: "Comment on something you're both experiencing such as the weather",
    suggestion: "\"What a beautiful day\" \"So busy today\" \"Weather's been so cold lately 🥶\""
  },
  {
    day: 3,
    name: "Helping Hand",
    description: "Ask a stranger for a small favor — the time, directions, a photo",
    suggestion: "\"Do you know the time?\" \"Do you know where X is?\" \"Could you help me take a photo?\""
  },
  {
    day: 4,
    name: "Compliment",
    description: "Give a stranger a genuine compliment",
    suggestion: "\"Love your jacket\" \"Nice shoes\" \"Cool shirt!\""
  },
  {
    day: 5,
    name: "How Are You?",
    description: "Ask one stranger how their day is going",
    suggestion: "\"Hey, how is your day going?\" \"How are you?\""
  },
  {
    day: 6,
    name: "Getting Personal",
    description: "Ask a stranger a personal question to get to know them",
    suggestion: "\"Where are you from?\" \"What brings you here?\" \"What do you do?\""
  },
  {
    day: 7,
    name: "Taking Names",
    description: "Get the name of someone new. Log it here so you don't forget 🦝",
    suggestion: "\"I'm Remi, nice to meet you — what's your name?\""
  }
];

export const challengeSections = [
  { title: "7-Day Challenge", range: [1, 7] as [number, number] }
];

export const getNextIncompleteChallenge = (completedDays: number[]): ThirtyDayChallenge | null => {
  for (const challenge of thirtyDayChallenge) {
    if (!completedDays.includes(challenge.day)) {
      return challenge;
    }
  }
  return null;
};

export const getChallengeByDay = (day: number): ThirtyDayChallenge | undefined => {
  return thirtyDayChallenge.find(c => c.day === day);
};

export const isAllChallengesComplete = (completedDays: number[]): boolean => {
  return completedDays.length >= 7;
};
