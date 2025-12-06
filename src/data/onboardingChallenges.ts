export interface OnboardingChallenge {
  id: number;
  title: string;
  description: string;
  tip: string;
}

export const onboardingChallenges: OnboardingChallenge[] = [
  {
    id: 1,
    title: "First Hello",
    description: "Smile & say Hello to a stranger",
    tip: "A simple smile and 'Hello!' is all it takes. Make eye contact and be genuine."
  },
  {
    id: 2,
    title: "Well Wishes",
    description: "Wish a stranger a good day / good morning / good evening",
    tip: "Try 'Have a great day!' or 'Good morning!' as you pass someone."
  },
  {
    id: 3,
    title: "How Are You?",
    description: "Ask someone you haven't met how their day is going",
    tip: "A simple 'How's your day going?' can open up wonderful conversations."
  },
  {
    id: 4,
    title: "Nice Shoes!",
    description: "Give a stranger a genuine compliment",
    tip: "Notice something specific - their style, their energy, anything genuine."
  },
  {
    id: 5,
    title: "What's the Time?",
    description: "Ask a stranger for the time: 'Excuse me, do you know what the time is?'",
    tip: "A classic conversation starter. Even if you know the time, it's a great way to break the ice."
  },
  {
    id: 6,
    title: "Stranger Danger",
    description: "Learn the name of someone new. Turn a stranger into someone familiar.",
    tip: "Ask their name and remember to write it down so you don't forget!"
  },
  {
    id: 7,
    title: "Getting Personal",
    description: "Ask someone a personal question to get to know them better",
    tip: "Where are they from? What are they up to today? What's their favourite restaurant?"
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
