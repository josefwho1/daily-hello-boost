import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useGuestMode } from './useGuestMode';
import { formatInTimeZone } from 'date-fns-tz';
import { startOfWeek, parseISO } from 'date-fns';
import { normalizeTimezoneOffset } from '@/lib/timezone';

export interface HelloLog {
  id: string;
  user_id: string;
  name: string | null;
  location: string | null;
  notes: string | null;
  hello_type: string | null;
  rating: 'positive' | 'neutral' | 'negative' | null;
  difficulty_rating: number | null;
  no_name_flag: boolean;
  created_at: string;
  timezone_offset: string;
}

export const useHelloLogs = () => {
  const { user } = useAuth();
  const { isGuest, guestLogs, updateLog: updateGuestLog } = useGuestMode();
  const [logs, setLogs] = useState<HelloLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If guest, use guest logs from IndexedDB
    if (isGuest && !user) {
      const formattedGuestLogs: HelloLog[] = guestLogs.map(log => ({
        id: log.id,
        user_id: 'guest',
        name: log.name || null,
        location: (log as any).location || null,
        notes: log.notes || null,
        hello_type: log.hello_type || null,
        rating: (log.rating as 'positive' | 'neutral' | 'negative' | null) || null,
        difficulty_rating: log.difficulty_rating || null,
        no_name_flag: (log as any).no_name_flag || false,
        created_at: log.created_at,
        timezone_offset: log.timezone_offset || '+00:00'
      }));
      setLogs(formattedGuestLogs);
      setLoading(false);
      return;
    }

    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchLogs();
  }, [user, isGuest, guestLogs]);

  const fetchLogs = async () => {
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('hello_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs((data as HelloLog[]) || []);
    } catch (error) {
      console.error('Error fetching hello logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (log: {
    name?: string;
    location?: string;
    notes?: string;
    hello_type?: string;
    rating?: 'positive' | 'neutral' | 'negative';
    difficulty_rating?: number;
    no_name_flag?: boolean;
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
          hello_type: log.hello_type || null,
          rating: log.rating || null,
          difficulty_rating: log.difficulty_rating || null,
          no_name_flag: log.no_name_flag || false,
          timezone_offset: timezoneOffset
        })
        .select()
        .single();

      if (error) throw error;
      
      setLogs(prev => [data as HelloLog, ...prev]);
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
        setLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
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
      
      setLogs(prev => prev.map(log => log.id === id ? data as HelloLog : log));
      return data;
    } catch (error) {
      console.error('Error updating hello log:', error);
      return null;
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
    refetch: fetchLogs,
    getLogsThisWeek,
    getLogsTodayCount,
  };
};