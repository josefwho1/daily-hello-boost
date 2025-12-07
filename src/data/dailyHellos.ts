export interface DailyHello {
  id: number;
  title: string;
  description: string;
}

export const dailyHellos: DailyHello[] = [
  {
    id: 1,
    title: "Simple Smile",
    description: "Smile and say 'Hi' to someone you pass."
  },
  {
    id: 2,
    title: "Good Morning",
    description: "Say 'Good morning / good evening!' to a neighbour or passerby."
  },
  {
    id: 3,
    title: "Door Holder",
    description: "Hold the door open for someone and say hello."
  },
  {
    id: 4,
    title: "Style Compliment",
    description: "Compliment someone's shoes, bag, or style."
  },
  {
    id: 5,
    title: "Barista Chat",
    description: "Ask a barista or cashier how their day is going."
  },
  {
    id: 6,
    title: "Dog Hello",
    description: "Say hello to someone walking their dog."
  },
  {
    id: 7,
    title: "Ask for Advice",
    description: "Ask someone for a quick recommendation (coffee shop, restaurant)."
  },
  {
    id: 8,
    title: "Gym Hello",
    description: "Say hello to someone at the gym or class."
  },
  {
    id: 9,
    title: "Genuine Thanks",
    description: "Give a genuine thank you to a worker with eye contact."
  },
  {
    id: 10,
    title: "Weather Talk",
    description: "Make a small observational comment: 'Beautiful weather today, hey?'"
  },
  {
    id: 11,
    title: "Where From",
    description: "Ask someone where they're from if it comes up naturally."
  },
  {
    id: 12,
    title: "Coworker Connect",
    description: "Say hello to a coworker you don't usually talk to."
  },
  {
    id: 13,
    title: "Curious Question",
    description: "Ask someone what they're reading, drinking, or working on."
  },
  {
    id: 14,
    title: "Time Check",
    description: "Ask someone for the time or for directions."
  },
  {
    id: 15,
    title: "Wave Hello",
    description: "Wave or nod hello to someone nearby."
  },
  {
    id: 16,
    title: "Weekend Plans",
    description: "Ask someone what their plans are for the weekend."
  },
  {
    id: 17,
    title: "Energy Compliment",
    description: "Compliment someone's energy or smile."
  },
  {
    id: 18,
    title: "Product Question",
    description: "Ask someone in a store if they've tried a product before."
  },
  {
    id: 19,
    title: "Style Chat",
    description: "Share something small: 'I like your hat—where'd you get it?'"
  },
  {
    id: 20,
    title: "Familiar Face",
    description: "Say hello to someone you see regularly but haven't spoken to yet."
  }
];

// Get today's hello based on day of year
export const getTodaysHello = (): DailyHello => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = dayOfYear % dailyHellos.length;
  return dailyHellos[index];
};
