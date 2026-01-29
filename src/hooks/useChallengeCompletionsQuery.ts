import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChallengeCompletion {
  id: string;
  challenge_day: number;
  challenge_tag: string | null;
  completed_at: string;
  interaction_name: string | null;
  notes: string | null;
  rating: 'positive' | 'neutral' | 'negative';
  difficulty_rating: number | null;
}

const QUERY_KEY = ['challenge-completions'];

export const useChallengeCompletionsQuery = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: completions = [], isLoading: loading, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<ChallengeCompletion[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('challenge_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const addMutation = useMutation({
    mutationFn: async (completion: {
      challenge_day: number;
      challenge_tag: string;
      interaction_name: string | null;
      notes: string | null;
      rating: 'positive' | 'neutral' | 'negative';
      difficulty_rating: number | null;
    }) => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('challenge_completions')
        .insert({ user_id: user.id, ...completion })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<ChallengeCompletion[]>(QUERY_KEY, (old = []) => [data, ...old]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: {
      id: string;
      updates: {
        interaction_name?: string | null;
        notes?: string | null;
        rating?: 'positive' | 'neutral' | 'negative';
        difficulty_rating?: number | null;
      };
    }) => {
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('challenge_completions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<ChallengeCompletion[]>(QUERY_KEY, (old = []) =>
        old.map((c) => (c.id === data.id ? data : c))
      );
    },
  });

  const clearByTagsMutation = useMutation({
    mutationFn: async (challengeTags: string[]) => {
      if (!user) throw new Error('No user');
      const tags = challengeTags.filter(Boolean);
      if (tags.length === 0) return;

      const { error } = await supabase
        .from('challenge_completions')
        .delete()
        .eq('user_id', user.id)
        .in('challenge_tag', tags);

      if (error) throw error;
      return tags;
    },
    onSuccess: (tags) => {
      if (!tags) return;
      queryClient.setQueryData<ChallengeCompletion[]>(QUERY_KEY, (old = []) =>
        old.filter((c) => !c.challenge_tag || !tags.includes(c.challenge_tag))
      );
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('challenge_completions')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData<ChallengeCompletion[]>(QUERY_KEY, []);
    },
  });

  return {
    completions,
    loading,
    addCompletion: addMutation.mutateAsync,
    updateCompletion: (id: string, updates: Parameters<typeof updateMutation.mutateAsync>[0]['updates']) =>
      updateMutation.mutateAsync({ id, updates }),
    clearCompletions: clearAllMutation.mutateAsync,
    clearCompletionsByTags: clearByTagsMutation.mutateAsync,
    refetch,
  };
};
