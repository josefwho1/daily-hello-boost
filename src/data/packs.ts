import { Pack } from "@/types/pack";
import { challenges } from "./challenges";

export const packs: Pack[] = [
  {
    id: "7-day-hello",
    name: "One Hello Intro Series",
    description: "How to turn faces into friends, in just 7 days. Taking you from a simple hello to getting a strangers name.",
    icon: "👋",
    challenges: challenges.slice(0, 7),
  },
  {
    id: "pack-1",
    name: "More packs coming soon",
    description: "New challenges to expand your social circle.",
    icon: "🚀",
    challenges: [],
  },
];

export const getPackById = (id: string): Pack | undefined => {
  return packs.find((pack) => pack.id === id);
};
