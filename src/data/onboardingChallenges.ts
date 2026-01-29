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
    description: "Smile + say \"Hello / Hey / Good morning\" to one stranger",
    suggestion: "\"Hello\" \"Hey\" \"Good Morning\"",
    tips: "Don't forget to smile :)"
  },
  {
    id: 2,
    title: "Well Wishes",
    description: "Wish one stranger a great day / evening / weekend",
    suggestion: "\"Hope you have a great day\" \"Have a good night\"",
    tips: "A smile and positive tone will make this one sing"
  },
  {
    id: 3,
    title: "Weather Chat",
    description: "Share an observation about the weather, traffic, anything to one stranger",
    suggestion: "\"Nice/terrible/strange weather today\" \"So cold this morning 🥶\"",
    tips: "Great when standing and waiting for something"
  },
  {
    id: 4,
    title: "Nice Shoes",
    description: "Give someone a genuine compliment",
    suggestion: "\"Love your jacket\" \"Nice shoes\" \"Cool shirt!\"",
    tips: "Clothing works best, try make sure its genuine"
  },
  {
    id: 5,
    title: "How Are You?",
    description: "Ask one stranger how their day is going.",
    suggestion: "\"Hey, how is your day going?\"",
    tips: "Cool and casual. Staff and cashiers love getting this one"
  },
  {
    id: 6,
    title: "Taking Names",
    description: "Get the name of someone new (& remember it) PS: log it in here straight away so you don't forget 🦝",
    suggestion: "\"Hi, I'm Remi, nice to meet you - whats your name?\"",
    tips: "After a positive hello, try introducing yourself first"
  },
  {
    id: 7,
    title: "Getting Personal",
    description: "Ask someone a personal question to get to know them, anything at all",
    suggestion: "\"Where are you from?\" \"What brings you to X?\"",
    tips: "Start with a hello, if you get good reception, try to get to know them"
  }
];

