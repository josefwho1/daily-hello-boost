import { Pack } from "@/types/pack";
import { challenges } from "./challenges";

export const packs: Pack[] = [
  {
    id: "7-day-hello",
    name: "One Hello Intro Series",
    description: "Perfect for beginners. Helping you turn faces into friends. Taking you from a simple hello to getting a strangers name in 7 days.",
    icon: "👋",
    challenges: challenges.slice(0, 7),
    isFree: true,
  },
];

export const getPackById = (id: string): Pack | undefined => {
  return packs.find((pack) => pack.id === id);
};
