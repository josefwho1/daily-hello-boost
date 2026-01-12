export interface FirstHello {
  id: number;
  title: string;
  description: string;
  suggestion: string;
  tips?: string;
}

export const firstHellos: FirstHello[] = [
  {
    id: 1,
    title: "Simple Greeting",
    description: "Say hello to someone nearby",
    suggestion: "\"Hello\" \"Hey\" \"Good Morning\"",
    tips: "A smile goes a long way!"
  },
  {
    id: 2,
    title: "Observation",
    description: "Comment on something you're both experiencing right now, the weather, the time of year, the atmosphere",
    suggestion: "\"What a beautiful day\" \"So busy today\" \"Weather's been so cold lately 🥶\"",
    tips: "Works great when you're both waiting for something"
  },
  {
    id: 3,
    title: "Compliment",
    description: "Give someone a genuine compliment",
    suggestion: "\"I like your shirt\" \"Nice shoes\" \"Love your jacket\"",
    tips: "Keep it genuine and about something they chose"
  },
  {
    id: 4,
    title: "Question",
    description: "Ask someone a question",
    suggestion: "\"How's your day going?\" \"Is this the line?\" \"What are you getting?\"",
    tips: "Open questions work best - they invite conversation"
  },
  {
    id: 5,
    title: "Name",
    description: "Start a conversation then get the person's name (write it down in here after so you don't forget)",
    suggestion: "\"I'm Remi, by the way\" \"I didn't catch your name. I'm Remi\" \"Nice to meet you, I'm Remi\"",
    tips: "Introduce yourself first - it's only fair!"
  }
];
