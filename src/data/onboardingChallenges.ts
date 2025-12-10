export interface OnboardingChallenge {
  id: number;
  title: string;
  description: string;
  suggestion: string;
}

export const onboardingChallenges: OnboardingChallenge[] = [
  {
    id: 1,
    title: "First Hello",
    description: "Smile and say hello to one stranger today",
    suggestion: "\"Hello\" \"Hey\" \"Good morning\""
  },
  {
    id: 2,
    title: "Well Wishes",
    description: "Wish one stranger a great day, evening, or weekend",
    suggestion: "\"Hope you have a great day\" \"Enjoy your evening\""
  },
  {
    id: 3,
    title: "Weather Chat",
    description: "Share an observation about the weather to one stranger",
    suggestion: "\"Nice/terrible/strange weather today\" \"So cold this morning 🥶\""
  },
  {
    id: 4,
    title: "Nice Shoes",
    description: "Give one stranger a genuine compliment",
    suggestion: "\"Love your jacket\" \"Nice shoes\""
  },
  {
    id: 5,
    title: "How Are You?",
    description: "Ask one stranger how their day is going",
    suggestion: "\"How's your day going?\" \"How are you?\""
  },
  {
    id: 6,
    title: "Name to the Face",
    description: "Ask one stranger their name and remember it",
    suggestion: "\"Hi, I'm [name], nice to meet you - what's your name?\""
  },
  {
    id: 7,
    title: "Getting Personal",
    description: "Ask one stranger a follow-up question about themselves",
    suggestion: "\"Where are you from?\" \"What do you do for fun?\""
  }
];

export const sevenWaysToSayHello = [
  {
    category: "Simple Hello",
    scripts: [
      "Hi there! How's it going?",
      "Hey! Nice to meet you.",
      "Hello! Beautiful day, isn't it?"
    ]
  },
  {
    category: "Compliment",
    scripts: [
      "I love your style! Where did you get that?",
      "You have such great energy!",
      "That's a really cool [item they have]!"
    ]
  },
  {
    category: "Question",
    scripts: [
      "Do you know any good coffee spots around here?",
      "What brings you here today?",
      "Have you been to this place before?"
    ]
  },
  {
    category: "Observation",
    scripts: [
      "This weather is perfect today!",
      "This place is so busy today!",
      "I love the vibe in here."
    ]
  },
  {
    category: "Helper",
    scripts: [
      "Can I help you with that?",
      "Would you like me to hold the door?",
      "Need any help finding something?"
    ]
  },
  {
    category: "Curious",
    scripts: [
      "What are you reading? Looks interesting!",
      "What do you recommend here?",
      "Are you from around here?"
    ]
  },
  {
    category: "Well Wishes",
    scripts: [
      "Have an amazing day!",
      "Hope the rest of your day is great!",
      "Enjoy your [coffee/meal/day]!"
    ]
  }
];
