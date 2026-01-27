import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useGuestMode } from './useGuestMode';
import { formatInTimeZone } from 'date-fns-tz';
import { startOfWeek, parseISO } from 'date-fns';
import { normalizeTimezoneOffset } from '@/lib/timezone';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
}

export const useHelloLogs = () => {
  const { user } = useAuth();
  const { isGuest, guestLogs, updateLog: updateGuestLog } = useGuestMode();
  const queryClient = useQueryClient();

  // Use React Query for caching - prevents refetch on tab switch
  const { data: logs = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['hello-logs', user?.id, isGuest],
    queryFn: async () => {
      // If guest, use guest logs from IndexedDB
      if (isGuest && !user) {
        const formattedGuestLogs: HelloLog[] = guestLogs.map(log => ({
          id: log.id,
          user_id: 'guest',
          name: log.name || null,
          location: (log as any).location || null,
          notes: log.notes || null,
          rating: (log.rating as 'positive' | 'neutral' | 'negative' | null) || null,
          difficulty_rating: log.difficulty_rating || null,
          no_name_flag: (log as any).no_name_flag || false,
          created_at: log.created_at,
          timezone_offset: log.timezone_offset || '+00:00',
          linked_to: (log as any).linked_to || null
        }));
        return formattedGuestLogs;
      }

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
    // Enable when we have a user or guest logs
    enabled: !!(user || (isGuest && guestLogs)),
  });

  const addLog = async (log: {
    name?: string;
    location?: string;
    notes?: string;
    rating?: 'positive' | 'neutral' | 'negative';
    difficulty_rating?: number;
    no_name_flag?: boolean;
    linked_to?: string;
  }) => {
    if (!user) return null;

    try {
      // Get user's timezone preference
      const { data: profile } = await supabase
        .from('profiles')
        .select('timezone_preference')
        .eq('id', user.id)
        .maybeSingle();

      const timezoneOffset = normalizeTimezoneOffset(profile?.timezone_preference);

      const { data, error } = await supabase
        .from('hello_logs')
        .insert({
          user_id: user.id,
          name: log.name || null,
          location: log.location || null,
          notes: log.notes || null,
          rating: log.rating || null,
          difficulty_rating: log.difficulty_rating || null,
          no_name_flag: log.no_name_flag || false,
          timezone_offset: timezoneOffset,
          linked_to: log.linked_to || null
        })
        .select()
        .single();

      if (error) throw error;
      
      // Optimistically update cache
      queryClient.setQueryData(['hello-logs', user.id, isGuest], (old: HelloLog[] = []) => 
        [data as HelloLog, ...old]
      );
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
      const { data, error } = await supabase
        .from('hello_logs')
        .update({
          name: updates.name,
          location: updates.location,
          notes: updates.notes,
          rating: updates.rating,
          difficulty_rating: updates.difficulty_rating
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Optimistically update cache
      queryClient.setQueryData(['hello-logs', user.id, isGuest], (old: HelloLog[] = []) =>
        old.map(log => log.id === id ? data as HelloLog : log)
      );
      return data;
    } catch (error) {
      console.error('Error updating hello log:', error);
      return null;
    }
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
      
      // Optimistically update cache
      queryClient.setQueryData(['hello-logs', user.id, isGuest], (old: HelloLog[] = []) =>
        old.filter(log => log.id !== id).map(log => 
          log.linked_to === id ? { ...log, linked_to: null } : log
        )
      );
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
    refetch,
    getLogsThisWeek,
    getLogsTodayCount,
  };
};