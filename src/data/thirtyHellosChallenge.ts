export interface ThirtyHelloChallenge {
  day: number;
  name: string;
  description: string;
  suggestion: string;
  section: 'initiation' | 'conversations' | 'names-connection';
}

export const thirtyHellosChallenge: ThirtyHelloChallenge[] = [
  // Section 1: Initiation (Days 1-10)
  {
    day: 1,
    name: "First Hello",
    description: "Smile & say Hello to one stranger",
    suggestion: "Don't forget to smile :) \"Hello\" or \"Good morning\" works great",
    section: 'initiation',
  },
  {
    day: 2,
    name: "Silent Hello",
    description: "Give someone the smile and nod, no words, just acknowledgment",
    suggestion: "Make eye contact, smile genuinely, and nod.",
    section: 'initiation',
  },
  {
    day: 3,
    name: "Well Wishes",
    description: "Wish one stranger a great day/evening/weekend",
    suggestion: "\"Hope you have a great day\" or \"Have a good night\"",
    section: 'initiation',
  },
  {
    day: 4,
    name: "Observation",
    description: "Comment on something you're both experiencing (weather, atmosphere, situation)",
    suggestion: "\"What a beautiful day\", \"So busy today\" or \"Weather's been so cold lately 🥶\"",
    section: 'initiation',
  },
  {
    day: 5,
    name: "Compliment",
    description: "Give a stranger a genuine compliment",
    suggestion: "\"Love your jacket\" \"Nice shoes\" \"Cool shirt!\" Keep it about their choices (outfit, accessories), not physical features.",
    section: 'initiation',
  },
  {
    day: 6,
    name: "Small Favor",
    description: "Ask someone for a small favor (napkin, directions, time)",
    suggestion: "People love being helpful. Try \"Excuse me, do you have the time?\" or \"Could you watch my stuff for a sec?\"",
    section: 'initiation',
  },
  {
    day: 7,
    name: "Staff Favorite",
    description: "When ordering, ask the staff what their favorite item is",
    suggestion: "At checkout or counter: \"What's YOUR favorite thing here?\" or \"Which would you recommend between these two?\"",
    section: 'initiation',
  },
  {
    day: 8,
    name: "Cute Dog",
    description: "Ask someone about their pet (if they have one)",
    suggestion: "Dogs are conversation magnets. Ask: \"What's their name? How old?\" People will talk about their pets forever.",
    section: 'initiation',
  },
  {
    day: 9,
    name: "Ask for a Recommendation",
    description: "Ask someone for a recommendation - cafe, lunch spot, anything",
    suggestion: "Spot someone with coffee/food: \"That looks good, where'd you get it?\" or \"I'm looking for a good lunch spot, any favorites?\"",
    section: 'initiation',
  },
  {
    day: 10,
    name: "Queue Chat",
    description: "Make waiting in line suck less by starting small talk",
    suggestion: "Make a relatable observation: \"This line is crazy, right? Must be good.\" or \"Have you been here before? What's good?\"",
    section: 'initiation',
  },

  // Section 2: Conversations (Days 11-20)
  {
    day: 11,
    name: "Weekend Plans?",
    description: "Ask someone what their weekend plans are",
    suggestion: "Friday or Thursday afternoon: \"Any fun plans for the weekend?\" People love talking about upcoming activities.",
    section: 'conversations',
  },
  {
    day: 12,
    name: "Weather Upgrade",
    description: "Take a boring weather comment one step further",
    suggestion: "Start with weather: \"Beautiful day, right?\" Then add: \"Are you headed somewhere fun?\" or \"Any plans to enjoy it?\"",
    section: 'conversations',
  },
  {
    day: 13,
    name: "How Are You?",
    description: "Ask a stranger how their day is going",
    suggestion: "\"Hey, how is your day going?\" or simply \"How are you?\"",
    section: 'conversations',
  },
  {
    day: 14,
    name: "What's Your Go-To?",
    description: "Ask someone what their default order is at this place",
    suggestion: "At a cafe/restaurant: \"You look like a regular, what's your go-to order here?\"",
    section: 'conversations',
  },
  {
    day: 15,
    name: "What Brings You Here?",
    description: "Ask someone what brought them to this place today",
    suggestion: "Works at coffee shops, parks, events. \"First time here? What brings you in?\" Genuine curiosity goes a long way.",
    section: 'conversations',
  },
  {
    day: 16,
    name: "What's Fun Around Here?",
    description: "Ask someone what they like to do for fun in the area",
    suggestion: "Great for new places: \"I'm new around here - what's fun to do on weekends?\" or \"Any hidden gems I should know about?\"",
    section: 'conversations',
  },
  {
    day: 17,
    name: "Help Me Decide",
    description: "Ask someone to help you decide something small",
    suggestion: "Hold up two items: \"Quick question, which one would you get?\" Works at stores, cafes, anywhere.",
    section: 'conversations',
  },
  {
    day: 18,
    name: "What Are You Up To?",
    description: "Ask what they're working on/reading/doing",
    suggestion: "Spot someone on a laptop, reading, or doing something: \"Working on something interesting?\" or \"What are you reading?\"",
    section: 'conversations',
  },
  {
    day: 19,
    name: "Awkward Silence",
    description: "Break awkward silence anywhere - elevator, waiting room, stuck in line",
    suggestion: "Smile and say: \"How's your day going?\" Don't overthink it.",
    section: 'conversations',
  },
  {
    day: 20,
    name: "Offer Help",
    description: "Offer to help someone with something small",
    suggestion: "Hold a door, offer to take someone's photo, help with heavy bags. Actions speak louder than words.",
    section: 'conversations',
  },

  // Section 3: Names & Connection (Days 21-30)
  {
    day: 21,
    name: "Staff Exchange",
    description: "Trade names with your local barista or shopkeeper",
    suggestion: "After they take your order: \"I'm here all the time but don't know your name, I'm [Name]!\" Use their name next time.",
    section: 'names-connection',
  },
  {
    day: 22,
    name: "Neighborino",
    description: "Introduce yourself to a neighbor you haven't met properly",
    suggestion: "Start with: \"I think we're neighbours, I don't think we've officially met, I'm [Your Name]!\" Ask how long they've lived here.",
    section: 'names-connection',
  },
  {
    day: 23,
    name: "Name to the Face",
    description: "Introduce yourself to someone you've seen many times but never got their name",
    suggestion: "Start with honesty: \"I see you here all the time but we've never properly met. I'm [Name]!\" Works great at the gym, coffee shop, park.",
    section: 'names-connection',
  },
  {
    day: 24,
    name: "Learn & Repeat",
    description: "Get the name of someone new and use it at least twice during your interaction",
    suggestion: "When they tell you their name, repeat it immediately: \"Nice to meet you, [Name]!\" Use it again when saying goodbye.",
    section: 'names-connection',
  },
  {
    day: 25,
    name: "Bold Introduction",
    description: "Walk up to someone and introduce yourself directly. No excuse, no icebreaker, just confidence.",
    suggestion: "\"Hi, I'm [Name], nice to meet you - what's your name?\"",
    section: 'names-connection',
  },
  {
    day: 26,
    name: "Getting Personal",
    description: "Ask someone new a personal question to get to know them, anything at all",
    suggestion: "\"Where are you from?\" \"What do you do for work?\"",
    section: 'names-connection',
  },
  {
    day: 27,
    name: "May I Join You?",
    description: "Ask to join someone's table or share a bench",
    suggestion: "Look for someone sitting alone: \"Mind if I join you?\" or \"This place is packed, okay if I sit here?\" Respect if they say no.",
    section: 'names-connection',
  },
  {
    day: 28,
    name: "Exchange Contact",
    description: "Meet someone new and exchange contacts with them",
    suggestion: "\"Great meeting you, want to exchange contacts?\" \"Do you have Instagram?\"",
    section: 'names-connection',
  },
  {
    day: 29,
    name: "Reconnect",
    description: "Reach out to someone you met in a previous challenge to reconnect",
    suggestion: "Send a simple text: \"Hey! It's been a while. How've you been?\" or call them out of the blue. Don't overthink it.",
    section: 'names-connection',
  },
  {
    day: 30,
    name: "Make Plans",
    description: "Meet someone new, if you connect, suggest doing something specific together",
    suggestion: "\"Want to grab coffee next week?\" or \"We should get a workout/run in together\". Be specific and follow through.",
    section: 'names-connection',
  },
];

export const thirtyHellosSections = [
  { title: "Initiation", range: [1, 10] as [number, number], section: 'initiation' as const },
  { title: "Conversations", range: [11, 20] as [number, number], section: 'conversations' as const },
  { title: "Names & Connection", range: [21, 30] as [number, number], section: 'names-connection' as const },
];

export const getThirtyHellosNextIncomplete = (completedDays: number[]): ThirtyHelloChallenge | null => {
  for (const challenge of thirtyHellosChallenge) {
    if (!completedDays.includes(challenge.day)) {
      return challenge;
    }
  }
  return null;
};

export const isThirtyHellosComplete = (completedDays: number[]): boolean => {
  return completedDays.length >= 30;
};
