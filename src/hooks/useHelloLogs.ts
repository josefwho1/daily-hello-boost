import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { formatInTimeZone } from 'date-fns-tz';
import { startOfWeek, parseISO } from 'date-fns';
import { normalizeTimezoneOffset } from '@/lib/timezone';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { helloLogSchema, validateSafe } from '@/lib/validation';
import {
  getCachedHellos,
  setCachedHellos,
  addCachedHello,
  updateCachedHello,
  removeCachedHello,
  addToPendingSync,
  removeFromPendingSync,
  addToPendingDeletions,
  generateLocalId,
  setLastFullSync,
  type CachedHelloEntry,
} from '@/lib/offlineCache';

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
  const queryClient = useQueryClient();

  const { data: logs = [], isPending: loading, refetch } = useQuery({
    queryKey: ['hello-logs', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Try fetching from server
      try {
        const { data, error } = await supabase
          .from('hello_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        const serverLogs = (data as HelloLog[]) || [];
        
        // Merge with any unsynced local entries
        const cached = getCachedHellos();
        const unsynced = cached.filter(e => !e._synced);
        
        // Build merged list: server logs + unsynced local entries (avoiding duplicates)
        const serverIds = new Set(serverLogs.map(l => l.id));
        const merged = [...serverLogs];
        for (const entry of unsynced) {
          if (!serverIds.has(entry.id)) {
            merged.push({
              id: entry.id,
              user_id: entry.user_id,
              name: entry.name,
              location: entry.location,
              notes: entry.notes,
              rating: entry.rating,
              difficulty_rating: entry.difficulty_rating,
              no_name_flag: entry.no_name_flag,
              created_at: entry.created_at,
              timezone_offset: entry.timezone_offset,
              linked_to: entry.linked_to,
              is_favorite: entry.is_favorite,
              hello_type: entry.hello_type,
            });
          }
        }
        
        // Sort by created_at descending
        merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        // Update cache with full server data + unsynced
        const cacheEntries: CachedHelloEntry[] = merged.map(l => ({
          ...l,
          no_name_flag: l.no_name_flag ?? false,
          _synced: !unsynced.some(u => u.id === l.id),
        }));
        setCachedHellos(cacheEntries);
        setLastFullSync();
        
        return merged;
      } catch (error) {
        // Offline fallback: return cached data
        console.warn('Failed to fetch logs, using cache:', error);
        const cached = getCachedHellos();
        if (cached.length > 0) {
          return cached.map(e => ({
            id: e.id,
            user_id: e.user_id,
            name: e.name,
            location: e.location,
            notes: e.notes,
            rating: e.rating,
            difficulty_rating: e.difficulty_rating,
            no_name_flag: e.no_name_flag,
            created_at: e.created_at,
            timezone_offset: e.timezone_offset,
            linked_to: e.linked_to,
            is_favorite: e.is_favorite,
            hello_type: e.hello_type,
          })) as HelloLog[];
        }
        throw error; // Re-throw if no cache
      }
    },
    // Serve cached data instantly, but mark as old so RQ always refetches in background
    initialData: () => {
      const cached = getCachedHellos();
      if (cached.length === 0) return undefined;
      return cached.map(e => ({
        id: e.id,
        user_id: e.user_id,
        name: e.name,
        location: e.location,
        notes: e.notes,
        rating: e.rating,
        difficulty_rating: e.difficulty_rating,
        no_name_flag: e.no_name_flag,
        created_at: e.created_at,
        timezone_offset: e.timezone_offset,
        linked_to: e.linked_to,
        is_favorite: e.is_favorite,
        hello_type: e.hello_type,
      })) as HelloLog[];
    },
    initialDataUpdatedAt: 0, // Forces background refetch immediately
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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

    // Validate input
    const validation = validateSafe(helloLogSchema, log);
    if (!validation.success) {
      console.error('Hello log validation failed:', (validation as { success: false; error: string }).error);
      throw new Error((validation as { success: false; error: string }).error);
    }
    const validatedLog = (validation as { success: true; data: typeof log }).data;

    const now = new Date().toISOString();
    const localId = generateLocalId();

    // Get timezone (use cached or browser fallback)
    let timezoneOffset = normalizeTimezoneOffset(null);
    if (navigator.onLine) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('timezone_preference')
          .eq('id', user.id)
          .maybeSingle();
        timezoneOffset = normalizeTimezoneOffset(profile?.timezone_preference);
      } catch {
        // Use browser-detected timezone if offline
      }
    }

    const localEntry: CachedHelloEntry = {
      id: localId,
      _localId: localId,
      _synced: false,
      user_id: user.id,
      name: validatedLog.name || null,
      location: validatedLog.location || null,
      notes: validatedLog.notes || null,
      rating: validatedLog.rating || null,
      difficulty_rating: validatedLog.difficulty_rating || null,
      no_name_flag: validatedLog.no_name_flag || false,
      created_at: now,
      timezone_offset: timezoneOffset,
      linked_to: validatedLog.linked_to || null,
      hello_type: validatedLog.hello_type || null,
    };

    // 1. Save locally FIRST for instant UI
    addCachedHello(localEntry);

    // 2. Update React Query cache immediately
    const helloLog: HelloLog = {
      id: localId,
      user_id: user.id,
      name: localEntry.name,
      location: localEntry.location,
      notes: localEntry.notes,
      rating: localEntry.rating,
      difficulty_rating: localEntry.difficulty_rating,
      no_name_flag: localEntry.no_name_flag,
      created_at: now,
      timezone_offset: timezoneOffset,
      linked_to: localEntry.linked_to,
      hello_type: localEntry.hello_type,
    };
    queryClient.setQueryData(['hello-logs', user.id], (old: HelloLog[] = []) => [helloLog, ...old]);

    // 3. Try to sync to server
    try {
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('hello_logs')
          .insert({
            user_id: user.id,
            name: localEntry.name,
            location: localEntry.location,
            notes: localEntry.notes,
            rating: localEntry.rating,
            difficulty_rating: localEntry.difficulty_rating,
            no_name_flag: localEntry.no_name_flag,
            timezone_offset: timezoneOffset,
            linked_to: localEntry.linked_to,
            hello_type: localEntry.hello_type,
          })
          .select()
          .single();

        if (error) throw error;

        // Update cache with server ID
        updateCachedHello(localId, { id: data.id, _synced: true, _localId: undefined });

        // Update React Query cache with server data
        queryClient.setQueryData(['hello-logs', user.id], (old: HelloLog[] = []) =>
          old.map(l => l.id === localId ? (data as HelloLog) : l)
        );
        
        await queryClient.invalidateQueries({ queryKey: ['user-progress'] });
        return data;
      } else {
        // Offline: add to sync queue
        addToPendingSync(localId);
        return helloLog;
      }
    } catch (error) {
      console.warn('Failed to sync hello, queued for later:', error);
      addToPendingSync(localId);
      return helloLog;
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
      
      // Update both local cache and React Query
      updateCachedHello(id, { ...updatePayload, _synced: true });
      queryClient.setQueryData(['hello-logs', user.id], (old: HelloLog[] = []) =>
        old.map(log => log.id === id ? data as HelloLog : log)
      );
      
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

    // 1. Update local cache and React Query immediately (optimistic)
    removeCachedHello(id);
    // Also remove from pending sync if it was an unsynced local entry
    removeFromPendingSync(id);
    queryClient.setQueryData(['hello-logs', user.id], (old: HelloLog[] = []) =>
      old.filter(log => log.id !== id).map(log => 
        log.linked_to === id ? { ...log, linked_to: null } : log
      )
    );

    // 2. Try to delete on server
    try {
      if (navigator.onLine) {
        await supabase
          .from('hello_logs')
          .update({ linked_to: null })
          .eq('linked_to', id)
          .eq('user_id', user.id);

        const { error } = await supabase
          .from('hello_logs')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        await queryClient.invalidateQueries({ queryKey: ['hello-logs'] });
      } else {
        // Queue deletion for sync when back online (only for server-synced entries)
        if (!id.startsWith('local_')) {
          addToPendingDeletions(id);
        }
      }
    } catch (error) {
      console.warn('Failed to delete on server, queued for later:', error);
      if (!id.startsWith('local_')) {
        addToPendingDeletions(id);
      }
    }
  };

  const getLogsThisWeek = (timezoneOffset: string = '+00:00') => {
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
