export interface Challenge {
  id: number;
  day: number;
  title: string;
  description: string;
  icon: string;
  tips: string;
  tag: string; // Unique tag for tracking completions
}

export interface CompletedChallenge {
  id: number;
  completedAt: string;
  name?: string;
  note: string;
  rating: 'positive' | 'neutral' | 'negative';
}
