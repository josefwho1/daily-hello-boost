import { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { detectBrowserTimezoneOffset, normalizeTimezoneOffset } from '@/lib/timezone';

const TIMEZONE_QUERY_KEY = ['timezone-preference'];

export const useTimezone = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Single React Query for timezone — shared across ALL consumers
  const { data: tzData } = useQuery({
    queryKey: TIMEZONE_QUERY_KEY,
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('timezone_preference, timezone_auto_detect')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const isAutoDetect = data?.timezone_auto_detect !== false;
      const detected = detectBrowserTimezoneOffset();

      if (isAutoDetect) {
        // Auto-detect: use browser timezone, update DB if different (fire-and-forget)
        if (data?.timezone_preference !== detected) {
          supabase
            .from('profiles')
            .update({ timezone_preference: detected })
            .eq('id', user.id)
            .then(() => {});
        }
        return { timezoneOffset: detected, autoDetect: true };
      } else if (data?.timezone_preference) {
        const normalized = normalizeTimezoneOffset(data.timezone_preference);
        if (normalized !== data.timezone_preference) {
          supabase
            .from('profiles')
            .update({ timezone_preference: normalized })
            .eq('id', user.id)
            .then(() => {});
        }
        return { timezoneOffset: normalized, autoDetect: false };
      } else {
        supabase
          .from('profiles')
          .update({ timezone_preference: detected })
          .eq('id', user.id)
          .then(() => {});
        return { timezoneOffset: detected, autoDetect: true };
      }
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Fallback to browser-detected timezone when no user or query hasn't loaded
  const timezoneOffset = tzData?.timezoneOffset ?? detectBrowserTimezoneOffset();
  const autoDetect = tzData?.autoDetect ?? true;

  const updateTimezone = useCallback(async (newOffset: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({ timezone_preference: newOffset })
      .eq('id', user.id);

    if (error) throw error;
    queryClient.setQueryData(TIMEZONE_QUERY_KEY, { timezoneOffset: newOffset, autoDetect: false });
  }, [user, queryClient]);

  const updateAutoDetect = useCallback(async (enabled: boolean) => {
    if (!user) throw new Error('User not authenticated');

    const updates: Record<string, unknown> = { timezone_auto_detect: enabled };
    let newOffset = timezoneOffset;

    if (enabled) {
      const detected = detectBrowserTimezoneOffset();
      updates.timezone_preference = detected;
      newOffset = detected;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;
    queryClient.setQueryData(TIMEZONE_QUERY_KEY, { timezoneOffset: newOffset, autoDetect: enabled });
  }, [user, queryClient, timezoneOffset]);

  const getUserTimezoneOffset = useCallback(() => timezoneOffset, [timezoneOffset]);

  const formatTimestamp = useCallback((timestamp: string, includeDay = false) => {
    const date = new Date(timestamp);
    
    const offsetMatch = timezoneOffset.match(/([+-])(\d{2}):(\d{2})/);
    if (!offsetMatch) return date.toLocaleString();
    
    const sign = offsetMatch[1];
    const hours = parseInt(offsetMatch[2]);
    const minutes = parseInt(offsetMatch[3]);
    
    const offsetMinutes = (sign === '+' ? 1 : -1) * (hours * 60 + minutes);
    const localDate = new Date(date.getTime() + offsetMinutes * 60000);
    
    if (includeDay) {
      const weekday = localDate.toLocaleString('en-GB', { weekday: 'long' });
      const dateStr = localDate.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${weekday}, ${dateStr}`;
    }
    
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    };
    
    return localDate.toLocaleString('en-GB', options);
  }, [timezoneOffset]);

  return {
    timezoneOffset,
    autoDetect,
    loading: false, // Browser timezone is always available instantly
    updateTimezone,
    updateAutoDetect,
    getUserTimezoneOffset,
    formatTimestamp,
  };
};
