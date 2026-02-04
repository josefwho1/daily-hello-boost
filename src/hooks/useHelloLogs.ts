import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useGuestMode } from './useGuestMode';
import { formatInTimeZone } from 'date-fns-tz';
import { startOfWeek, parseISO } from 'date-fns';
import { normalizeTimezoneOffset } from '@/lib/timezone';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { helloLogSchema, validateSafe } from '@/lib/validation';

export interface HelloLog {
  id: string;
  user_id: string;
  name: string | null;
  location: string | null;
  notes: string | null;
  rating: 'positive' | 'neutral' | 'negative' | null;
  difficulty_rating: number | null;
  no_name_flag: boolean;
  created_at: string;
  timezone_offset: string;
  linked_to?: string | null;
  is_favorite?: boolean;
  hello_type?: string | null;
}

export const useHelloLogs = () => {
  const { user } = useAuth();
  const { isGuest, updateLog: updateGuestLog } = useGuestMode();
  const queryClient = useQueryClient();

  // Use React Query for caching - prevents refetch on tab switch
  const { data: logs = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['hello-logs', user?.id],
    queryFn: async () => {
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('hello_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as HelloLog[]) || [];
    },
    // Keep data fresh for 5 minutes - prevents refetch on every tab switch
    staleTime: 5 * 60 * 1000,
    // Keep cached data for 10 minutes even when component unmounts
    gcTime: 10 * 60 * 1000,
    // Enable when we have a user (both regular and anonymous users have user sessions)
    enabled: !!user,
  });

  const addLog = async (log: {
    name?: string;
    location?: string;
    notes?: string;
    rating?: 'positive' | 'neutral' | 'negative';
    difficulty_rating?: number;
    no_name_flag?: boolean;
    linked_to?: string;
    hello_type?: string;
  }) => {
    if (!user) return null;

    // Validate input before database insert
    const validation = validateSafe(helloLogSchema, log);
    if (!validation.success) {
      console.error('Hello log validation failed:', validation.error);
      throw new Error(validation.error);
    }

    try {
      // Get user's timezone preference
      const { data: profile } = await supabase
        .from('profiles')
        .select('timezone_preference')
        .eq('id', user.id)
        .maybeSingle();

      const timezoneOffset = normalizeTimezoneOffset(profile?.timezone_preference);
      const validatedLog = validation.data;

      const { data, error } = await supabase
        .from('hello_logs')
        .insert({
          user_id: user.id,
          name: validatedLog.name || null,
          location: validatedLog.location || null,
          notes: validatedLog.notes || null,
          rating: validatedLog.rating || null,
          difficulty_rating: validatedLog.difficulty_rating || null,
          no_name_flag: validatedLog.no_name_flag || false,
          timezone_offset: timezoneOffset,
          linked_to: validatedLog.linked_to || null,
          hello_type: validatedLog.hello_type || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Invalidate and refetch to ensure sync across all components
      await queryClient.invalidateQueries({ queryKey: ['hello-logs'] });
      // Also invalidate user-progress since total_hellos may need updating
      await queryClient.invalidateQueries({ queryKey: ['user-progress'] });
      
      return data;
    } catch (error) {
      console.error('Error adding hello log:', error);
      return null;
    }
  };

  const updateLog = async (id: string, updates: {
    name?: string | null;
    location?: string | null;
    notes?: string | null;
    rating?: 'positive' | 'neutral' | 'negative' | null;
    difficulty_rating?: number | null;
    is_favorite?: boolean;
  }) => {
    // Handle guest log updates
    if (isGuest && !user) {
      try {
        await updateGuestLog(id, updates);
        // Invalidate to refetch guest logs
        queryClient.invalidateQueries({ queryKey: ['hello-logs'] });
        return { id, ...updates };
      } catch (error) {
        console.error('Error updating guest hello log:', error);
        return null;
      }
    }

    if (!user) return null;

    try {
      const updatePayload: Record<string, any> = {};
      if (updates.name !== undefined) updatePayload.name = updates.name;
      if (updates.location !== undefined) updatePayload.location = updates.location;
      if (updates.notes !== undefined) updatePayload.notes = updates.notes;
      if (updates.rating !== undefined) updatePayload.rating = updates.rating;
      if (updates.difficulty_rating !== undefined) updatePayload.difficulty_rating = updates.difficulty_rating;
      if (updates.is_favorite !== undefined) updatePayload.is_favorite = updates.is_favorite;

      const { data, error } = await supabase
        .from('hello_logs')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Immediately update cache with new data for instant UI update
      queryClient.setQueryData(['hello-logs', user.id], (old: HelloLog[] = []) =>
        old.map(log => log.id === id ? data as HelloLog : log)
      );
      
      // Also invalidate to ensure consistency across all views
      await queryClient.invalidateQueries({ queryKey: ['hello-logs'] });
      
      return data;
    } catch (error) {
      console.error('Error updating hello log:', error);
      return null;
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    return updateLog(id, { is_favorite: isFavorite });
  };

  const deleteLog = async (id: string) => {
    if (!user) return;

    try {
      // First, update any logs that link to this one to unlink them
      await supabase
        .from('hello_logs')
        .update({ linked_to: null })
        .eq('linked_to', id)
        .eq('user_id', user.id);

      // Then delete the log
      const { error } = await supabase
        .from('hello_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Immediately update cache for instant UI update
      queryClient.setQueryData(['hello-logs', user.id], (old: HelloLog[] = []) =>
        old.filter(log => log.id !== id).map(log => 
          log.linked_to === id ? { ...log, linked_to: null } : log
        )
      );
      
      // Also invalidate to ensure consistency
      await queryClient.invalidateQueries({ queryKey: ['hello-logs'] });
    } catch (error) {
      console.error('Error deleting hello log:', error);
      throw error;
    }
  };

  const getLogsThisWeek = (timezoneOffset: string = '+00:00') => {
    // Calculate week start in user's timezone
    const nowInTz = formatInTimeZone(new Date(), timezoneOffset, "yyyy-MM-dd");
    const mondayInTz = startOfWeek(parseISO(nowInTz), { weekStartsOn: 1 });
    const mondayStr = formatInTimeZone(mondayInTz, timezoneOffset, "yyyy-MM-dd");

    return logs.filter(log => {
      const logDateInTz = formatInTimeZone(new Date(log.created_at), timezoneOffset, "yyyy-MM-dd");
      return logDateInTz >= mondayStr;
    });
  };

  const getLogsTodayCount = (timezoneOffset: string = '+00:00') => {
    const todayInTz = formatInTimeZone(new Date(), timezoneOffset, "yyyy-MM-dd");
    return logs.filter(log => {
      const logDateInTz = formatInTimeZone(new Date(log.created_at), timezoneOffset, "yyyy-MM-dd");
      return logDateInTz === todayInTz;
    }).length;
  };

  return {
    logs,
    loading,
    addLog,
    updateLog,
    deleteLog,
    toggleFavorite,
    refetch,
    getLogsThisWeek,
    getLogsTodayCount,
  };
};