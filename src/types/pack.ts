import { Challenge } from "./challenge";

export interface Pack {
  id: string;
  name: string;
  description: string;
  challenges: Challenge[];
  icon: string;
  isFree?: boolean;
}
