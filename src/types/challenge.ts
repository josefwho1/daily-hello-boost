export interface Challenge {
  id: number;
  day: number;
  title: string;
  description: string;
  icon: string;
}

export interface CompletedChallenge {
  id: number;
  completedAt: string;
  name?: string;
  note: string;
  rating: 'positive' | 'neutral' | 'negative';
}
