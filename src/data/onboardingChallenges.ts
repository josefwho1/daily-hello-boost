export interface OnboardingChallenge {
  id: number;
  title: string;
  description: string;
  suggestion: string;
  tips: string;
}

export const onboardingChallenges: OnboardingChallenge[] = [
  {
    id: 1,
    title: "First Hello",
    description: "Smile & say Hello to one stranger",
    suggestion: "\"Hello\" \"Hey\" \"Good Morning\"",
    tips: "Don't forget to smile :)"
  },
  {
    id: 2,
    title: "Weather Chat",
    description: "Comment on something you're both experiencing such as the weather",
    suggestion: "\"What a beautiful day\" \"So busy today\" \"Weather's been so cold lately 🥶\"",
    tips: "Great when standing and waiting for something"
  },
  {
    id: 3,
    title: "Helping Hand",
    description: "Ask a stranger for a small favor — the time, directions, a photo",
    suggestion: "\"Do you know the time?\" \"Do you know where X is?\" \"Could you help me take a photo?\"",
    tips: "People love being helpful (Benjamin Franklin effect)"
  },
  {
    id: 4,
    title: "Compliment",
    description: "Give a stranger a genuine compliment",
    suggestion: "\"Love your jacket\" \"Nice shoes\" \"Cool shirt!\"",
    tips: "Clothing or accessories work great"
  },
  {
    id: 5,
    title: "How Are You?",
    description: "Ask one stranger how their day is going",
    suggestion: "\"Hey, how is your day going?\" \"How are you?\"",
    tips: "Cool and casual. Staff and cashiers love getting this one"
  },
  {
    id: 6,
    title: "Getting Personal",
    description: "Ask a stranger a personal question to get to know them",
    suggestion: "\"Where are you from?\" \"What brings you here?\" \"What do you do?\"",
    tips: "Start with a hello, if you get good reception, try to get to know them"
  },
  {
    id: 7,
    title: "Taking Names",
    description: "Get the name of someone new. Log it here so you don't forget 🦝",
    suggestion: "\"I'm Remi, nice to meet you — what's your name?\"",
    tips: "Names turn strangers into people. Save it in your Hellobook!"
  }
];
