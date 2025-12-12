import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface HelloLog {
  id: string;
  user_id: string;
  name: string | null;
  notes: string | null;
  hello_type: string | null;
  rating: 'positive' | 'neutral' | 'negative' | null;
  difficulty_rating: number | null;
  created_at: string;
  timezone_offset: string;
}

export const useHelloLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<HelloLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchLogs();
  }, [user]);

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
    notes?: string;
    hello_type?: string;
    rating?: 'positive' | 'neutral' | 'negative';
    difficulty_rating?: number;
  }) => {
    if (!user) return null;

    try {
      // Get user's timezone preference
      const { data: profile } = await supabase
        .from('profiles')
        .select('timezone_preference')
        .eq('id', user.id)
        .maybeSingle();

      const timezoneOffset = profile?.timezone_preference || '+00:00';

      const { data, error } = await supabase
        .from('hello_logs')
        .insert({
          user_id: user.id,
          name: log.name || null,
          notes: log.notes || null,
          hello_type: log.hello_type || null,
          rating: log.rating || null,
          difficulty_rating: log.difficulty_rating || null,
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
    notes?: string | null;
    rating?: 'positive' | 'neutral' | 'negative' | null;
    difficulty_rating?: number | null;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('hello_logs')
        .update({
          name: updates.name,
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

  const getLogsThisWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    // Get Monday of current week (Monday = 1, Sunday = 0)
    const monday = new Date(now);
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    return logs.filter(log => new Date(log.created_at) >= monday);
  };

  const getLogsTodayCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return logs.filter(log => new Date(log.created_at) >= today).length;
  };

  return {
    logs,
    loading,
    addLog,
    updateLog,
    refetch: fetchLogs,
    getLogsThisWeek,
    getLogsTodayCount,
    hellosThisWeek: getLogsThisWeek().length
  };
};