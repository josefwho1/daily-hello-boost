import { Pack } from "@/types/pack";
import { challenges } from "./challenges";

export const packs: Pack[] = [
  {
    id: "starter-pack",
    name: "7 Day Starter Pack",
    description: "To take you from Hello to getting a strangers name in one week.",
    icon: "🌟",
    challenges: challenges.slice(0, 7), // First 7 challenges
  },
  {
    id: "pack-1",
    name: "Pack 1",
    description: "Coming soon - More challenges to expand your social circle.",
    icon: "🚀",
    challenges: [], // Placeholder for future challenges
  },
  {
    id: "pack-2",
    name: "Pack 2",
    description: "Coming soon - Advanced social interaction challenges.",
    icon: "💎",
    challenges: [], // Placeholder for future challenges
  },
];

export const getPackById = (id: string): Pack | undefined => {
  return packs.find((pack) => pack.id === id);
};
