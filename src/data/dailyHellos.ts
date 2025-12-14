export interface DailyHello {
  id: number;
  title: string;
  description: string;
}

export const dailyHellos: DailyHello[] = [
  { id: 1, title: "Dream Ask", description: "Ask a stranger 'If money was no object, what would you do tomorrow?'" },
  { id: 2, title: "Secret Share", description: "Tell a stranger one harmless secret ('I'm terrified of elevators')" },
  { id: 3, title: "Biceps.", description: "Say hello to someone in your gym or on your run or walk if it's a rest day" },
  { id: 4, title: "Old timer", description: "Say hello to someone older than you" },
  { id: 5, title: "Long lines suck", description: "Start small talk in a queue" },
  { id: 6, title: "Super random", description: "Start with: 'Mind if I say something random?' then give a compliment" },
  { id: 7, title: "I appreciate you", description: "Tell someone you appreciate them 'thanks, appreciate you!'" },
  { id: 8, title: "Love your energy", description: "Tell someone they have great energy" },
  { id: 9, title: "Happy Monday!", description: "Wish someone 'Happy [day of the week]!'" },
  { id: 10, title: "Fit Checkkkk", description: "Ask for an opinion on your outfit" },
  { id: 11, title: "Learn & Repeat", description: "Get someone's name and use it during your interaction." },
  { id: 12, title: "Shameless plug", description: "Name drop One Hello and use it as an excuse to meet someone. 'Hey I'm doing this challenge where I'm trying to meet new people, it's called One Hello'" },
  { id: 13, title: "Opposites attract", description: "Meet someone new from the opposite gender" },
  { id: 14, title: "Influenceerrrrr", description: "Ask someone to take a photo of you. Post & tag @onehelloapp if you dare 🦝" },
  { id: 15, title: "High Five", description: "Get a highfive from a stranger" },
  { id: 16, title: "Bump it 🤜🤛", description: "Get a fist bump" },
  { id: 17, title: "Recommendation", description: "Ask someone for a recommendation, café, lunch spot, anything" },
  { id: 18, title: "Cute dog", description: "Ask someone about their pet (if they have one)" },
  { id: 19, title: "Staff favourite", description: "When ordering something from a store, ask the staff what is their favourite item?" },
  { id: 20, title: "Small favour", description: "Ask someone for a small favour (napkin, direction, time)" },
  { id: 21, title: "Feeling Thirsty", description: "Ask someone what they're drinking (if in a café or bar)" },
  { id: 22, title: "Weekend feels", description: "Ask someone what their weekend plans are" },
  { id: 23, title: "Mondays am I right?", description: "Make a comment on the day of the week" },
  { id: 24, title: "Good morning?", description: "Ask someone how their morning has been" },
  { id: 25, title: "Local or nah", description: "Ask someone if they're from around here" },
  { id: 26, title: "Book Club", description: "Talk to someone about the book they are reading (or simply ask about it)" },
  { id: 27, title: "What brings?", description: "Ask someone what brings them here" },
  { id: 28, title: "Orange obviously", description: "Ask someone what their favourite colour is" },
  { id: 29, title: "Raccoons obviously", description: "Ask someone what their favourite animal is" },
  { id: 30, title: "Feeling snacky", description: "Ask someone what they're eating/drinking & where they got it from" },
  { id: 31, title: "Keyboard warrior", description: "Ask someone what they're working on (if they're on a laptop)" },
  { id: 32, title: "I want a Remi Tee", description: "Ask someone where they got their shirt from" },
  { id: 33, title: "Style points", description: "Compliment someone's style" },
  { id: 34, title: "Lone wolf", description: "Greet someone sitting alone" },
  { id: 35, title: "Doorman (or woman)", description: "Hold the door for someone & say something" },
  { id: 36, title: "Vibin", description: "Tell someone random that you like their vibe (helps if you actually do)" },
  { id: 37, title: "Cool Glasses", description: "Compliment someone's sunglasses (or regular glasses)" },
  { id: 38, title: "Awkward Elevator", description: "Break the silence & say hello to someone in an elevator" }
];

// Seeded random shuffle - same seed = same order for all users
const seededShuffle = (array: DailyHello[], seed: number): DailyHello[] => {
  const shuffled = [...array];
  let currentSeed = seed;
  
  // Simple seeded random number generator (mulberry32)
  const random = () => {
    currentSeed = (currentSeed + 0x6D2B79F5) | 0;
    let t = currentSeed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  
  // Fisher-Yates shuffle with seeded random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

// Get today's hello - same for all users on the same day
export const getTodaysHello = (): DailyHello => {
  const now = new Date();
  
  // Use year as seed for consistent yearly shuffle
  const yearSeed = now.getFullYear();
  const shuffledHellos = seededShuffle(dailyHellos, yearSeed);
  
  // Get day of year (1-365/366)
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Cycle through shuffled list
  const index = dayOfYear % shuffledHellos.length;
  return shuffledHellos[index];
};
