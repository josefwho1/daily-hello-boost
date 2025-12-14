export interface RemisChallenge {
  id: number;
  title: string;
  description: string;
  suggestion: string;
}

export const remisWeeklyChallenges: RemisChallenge[] = [
  {
    id: 1,
    title: "Future Friend",
    description: "Get the contact of someone new and suggest to go for a coffee, walk or bite to eat",
    suggestion: "You seem cool - want to grab a coffee sometime?"
  },
  {
    id: 2,
    title: "Forget & Forgive",
    description: "Ask for someone's name that you should already know",
    suggestion: "I'm so sorry, I've forgotten your name, I'm Remi"
  },
  {
    id: 3,
    title: "Old Flame",
    description: "Reach out to someone (friend, family or colleague) that you haven't spoken to in a while. (You can use your phone for this one)",
    suggestion: "Hey X, it's been a while - how have you been?"
  },
  {
    id: 4,
    title: "Free Coffee",
    description: "Buy someone a coffee, tis the season of giving.",
    suggestion: "Pre-pay for the person behind you in line"
  },
  {
    id: 5,
    title: "Neighborino",
    description: "Introduce yourself to a neighbour you've never met properly and get their name",
    suggestion: "Hey, I think we're neighbours, wanted to introduce myself..."
  },
  {
    id: 6,
    title: "Name to the Face",
    description: "Introduce yourself to someone you've seen many times before but never got their name",
    suggestion: "Hey I see you around all the time, I'm Remi"
  }
];

// Reference date: Monday Dec 8, 2025 = "Future Friend" (index 0)
// Week of Dec 15, 2025 = "Forget & Forgive" (index 1)
// Week of Dec 22, 2025 = "Old Flame" (index 2) etc.
const REFERENCE_DATE = new Date(Date.UTC(2025, 11, 8)); // Dec 8, 2025 (Monday)

// Get this week's challenge - resets every Monday at midnight UTC
export const getThisWeeksChallenge = (): RemisChallenge => {
  const now = new Date();
  
  // Calculate weeks since reference date
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksSinceReference = Math.floor((now.getTime() - REFERENCE_DATE.getTime()) / msPerWeek);
  
  // Handle dates before reference (loop backwards)
  const index = ((weeksSinceReference % remisWeeklyChallenges.length) + remisWeeklyChallenges.length) % remisWeeklyChallenges.length;
  
  return remisWeeklyChallenges[index];
};
