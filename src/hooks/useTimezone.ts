import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useTimezone = () => {
  const { user } = useAuth();
  const [timezoneOffset, setTimezoneOffset] = useState<string>('+00:00');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimezone = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('timezone_preference')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data?.timezone_preference) {
          setTimezoneOffset(data.timezone_preference);
        }
      } catch (error) {
        console.error('Error fetching timezone:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimezone();
  }, [user]);

  const updateTimezone = async (newOffset: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({ timezone_preference: newOffset })
      .eq('id', user.id);

    if (error) throw error;
    setTimezoneOffset(newOffset);
  };

  const getUserTimezoneOffset = () => {
    return timezoneOffset;
  };

  const formatTimestamp = (timestamp: string, includeDay = false) => {
    const date = new Date(timestamp);
    
    // Parse the offset (e.g., "+05:30" or "-08:00")
    const offsetMatch = timezoneOffset.match(/([+-])(\d{2}):(\d{2})/);
    if (!offsetMatch) return date.toLocaleString();
    
    const sign = offsetMatch[1];
    const hours = parseInt(offsetMatch[2]);
    const minutes = parseInt(offsetMatch[3]);
    
    // Apply the offset
    const offsetMinutes = (sign === '+' ? 1 : -1) * (hours * 60 + minutes);
    const localDate = new Date(date.getTime() + offsetMinutes * 60000);
    
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    if (includeDay) {
      options.weekday = 'long';
    }
    
    return localDate.toLocaleString('en-GB', options);
  };

  return {
    timezoneOffset,
    loading,
    updateTimezone,
    getUserTimezoneOffset,
    formatTimestamp,
  };
};