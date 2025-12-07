export interface RemisChallenge {
  id: number;
  title: string;
  description: string;
}

export const remisWeeklyChallenges: RemisChallenge[] = [
  {
    id: 1,
    title: "Fit Checkkkk",
    description: "Ask for an opinion on your outfit"
  },
  {
    id: 2,
    title: "Learn & Repeat",
    description: "Get someone's name and use it during your interaction"
  },
  {
    id: 3,
    title: "Shameless Plug",
    description: "Name drop One Hello and use it as an excuse to meet someone. 'Hey I'm doing this challenge where I'm trying to meet new people, it's called One Hello'"
  },
  {
    id: 4,
    title: "Jokester",
    description: "Make someone laugh by telling them a joke"
  },
  {
    id: 5,
    title: "Aliens",
    description: "Ask someone whether they believe in aliens?"
  },
  {
    id: 6,
    title: "Opposites Attract",
    description: "Get the name of someone from the opposite gender"
  },
  {
    id: 7,
    title: "Old Timer",
    description: "Get the name of someone older than you"
  },
  {
    id: 8,
    title: "Forget & Forgive",
    description: "Ask for someone's name that you should already know"
  },
  {
    id: 9,
    title: "Name to the Face",
    description: "Get the name of someone you've seen before but never met, maybe at your coffee spot, gym or work place"
  },
  {
    id: 10,
    title: "Photo Please",
    description: "Ask someone to take a photo of you. Tag #onehello"
  },
  {
    id: 11,
    title: "High Five",
    description: "Get a high five from a stranger"
  }
];

// Get this week's challenge - resets every Sunday at midnight
export const getThisWeeksChallenge = (): RemisChallenge => {
  const now = new Date();
  // Get the ISO week number of the year
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  const index = weekNumber % remisWeeklyChallenges.length;
  return remisWeeklyChallenges[index];
};
