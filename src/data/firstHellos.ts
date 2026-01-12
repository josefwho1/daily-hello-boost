export interface FirstHello {
  id: number;
  title: string;
  description: string;
  examples: string[];
  tip: string;
}

export const fourTypesOfHello: FirstHello[] = [
  {
    id: 1,
    title: "Greeting",
    description: "Say hello to someone nearby.",
    examples: ["Hello", "Hey", "Good morning"],
    tip: "A greeting opens the door. It's the best way to start almost any interaction."
  },
  {
    id: 2,
    title: "Observation",
    description: "Comment on something you're both experiencing right now.",
    examples: ["What a beautiful day.", "So busy today.", "The weather's been so cold lately 🥶"],
    tip: "Great when waiting for something or sharing the same space."
  },
  {
    id: 3,
    title: "Compliment",
    description: "Give someone a genuine compliment.",
    examples: ["I like your shirt.", "Nice shoes.", "Love your jacket."],
    tip: "Compliment choices, not bodies. Clothing and accessories work great."
  },
  {
    id: 4,
    title: "Question",
    description: "Ask someone a simple question.",
    examples: ["How's your day going?", "Is this the line?", "Do you know where I can find ____?"],
    tip: "Questions can be practical or personal. Start simple."
  }
];

// Keep backward compatibility
export const firstHellos = fourTypesOfHello;
