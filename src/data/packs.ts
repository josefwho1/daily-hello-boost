import { Pack } from "@/types/pack";
import { challenges } from "./challenges";

export const packs: Pack[] = [
  {
    id: "7-day-hello",
    name: "7-Day Hello Challenge",
    description: "How to turn faces into friends. Taking you from a simple hello to getting a strangers name.",
    icon: "👋",
    challenges: challenges.slice(0, 7),
  },
  {
    id: "pack-1",
    name: "Pack 1",
    description: "Coming soon - More challenges to expand your social circle.",
    icon: "🚀",
    challenges: [],
  },
  {
    id: "pack-2",
    name: "Pack 2",
    description: "Coming soon - Advanced social interaction challenges.",
    icon: "💎",
    challenges: [],
  },
];

export const getPackById = (id: string): Pack | undefined => {
  return packs.find((pack) => pack.id === id);
};
