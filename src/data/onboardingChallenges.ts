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
    description: "Smile + say \"Hello / Hey / Good morning\" to one stranger",
    tip: "\"Hello\" \"Hey\" \"Good morning\""
  },
  {
    id: 2,
    title: "Well Wishes",
    description: "Wish one stranger a great day / evening / weekend (\"Hope you have a great day\" \"Enjoy your evening\")",
    tip: "\"Hope you have a great day\" \"Enjoy your evening\""
  },
  {
    id: 3,
    title: "Observation",
    description: "Make a neutral observation to one stranger (\"Nice/terrible/strange weather today\" \"This line always takes ages\")",
    tip: "\"Nice weather today\" \"This line always takes ages\""
  },
  {
    id: 4,
    title: "Nice Shoes",
    description: "Give one stranger a genuine compliment (\"Love your jacket\" \"Nice shoes\")",
    tip: "\"Love your jacket\" \"Nice shoes\""
  },
  {
    id: 5,
    title: "How Are You?",
    description: "Ask one stranger \"How's your day going?\"",
    tip: "\"How's your day going?\" \"How are you?\""
  },
  {
    id: 6,
    title: "Name to the Face",
    description: "Ask one stranger their name (& remember it) \"Hi, I'm Remi, nice to meet you - what's your name?\" PS: log it in here straight away so you don't forget 🦝",
    tip: "\"Hi, I'm [name], nice to meet you - what's your name?\""
  },
  {
    id: 7,
    title: "Getting Personal",
    description: "Ask one stranger one follow-up question (where they're from / what they do for fun / what they are up to today)",
    tip: "\"Where are you from?\" \"What do you do for fun?\" \"What are you up to today?\""
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
