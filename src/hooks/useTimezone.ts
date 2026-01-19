import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { detectBrowserTimezoneOffset, normalizeTimezoneOffset } from '@/lib/timezone';

export const useTimezone = () => {
  const { user } = useAuth();
  // Initialize with browser-detected timezone instead of hardcoded UTC
  const [timezoneOffset, setTimezoneOffset] = useState<string>(detectBrowserTimezoneOffset());
  const [autoDetect, setAutoDetect] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimezone = async () => {
      if (!user) {
        // For non-authenticated users, use browser-detected timezone
        setTimezoneOffset(detectBrowserTimezoneOffset());
        setAutoDetect(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('timezone_preference, timezone_auto_detect')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        const isAutoDetect = data?.timezone_auto_detect !== false; // default true
        setAutoDetect(isAutoDetect);
        
        if (isAutoDetect) {
          // Auto-detect mode: always use browser timezone and save it
          const detected = detectBrowserTimezoneOffset();
          setTimezoneOffset(detected);
          
          // Update in DB if different
          if (data?.timezone_preference !== detected) {
            await supabase
              .from('profiles')
              .update({ timezone_preference: detected })
              .eq('id', user.id);
          }
        } else if (data?.timezone_preference) {
          // Manual mode: use stored timezone
          const normalized = normalizeTimezoneOffset(data.timezone_preference);
          setTimezoneOffset(normalized);
          
          // If the stored value was malformed, update it in the database
          if (normalized !== data.timezone_preference) {
            console.log(`Fixing malformed timezone: "${data.timezone_preference}" -> "${normalized}"`);
            await supabase
              .from('profiles')
              .update({ timezone_preference: normalized })
              .eq('id', user.id);
          }
        } else {
          // No timezone set - use browser detection and save it
          const detected = detectBrowserTimezoneOffset();
          setTimezoneOffset(detected);
          await supabase
            .from('profiles')
            .update({ timezone_preference: detected })
            .eq('id', user.id);
        }
      } catch (error) {
        console.error('Error fetching timezone:', error);
        // Fall back to browser detection on error
        setTimezoneOffset(detectBrowserTimezoneOffset());
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

  const updateAutoDetect = async (enabled: boolean) => {
    if (!user) throw new Error('User not authenticated');

    const updates: Record<string, unknown> = { timezone_auto_detect: enabled };
    
    // If enabling auto-detect, also update the timezone to current browser value
    if (enabled) {
      const detected = detectBrowserTimezoneOffset();
      updates.timezone_preference = detected;
      setTimezoneOffset(detected);
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;
    setAutoDetect(enabled);
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
    
    if (includeDay) {
      // Format: "Day of week time, date" (e.g., "Monday 14:30, 15 Jan 2025")
      const weekday = localDate.toLocaleString('en-GB', { weekday: 'long' });
      const time = localDate.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const dateStr = localDate.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${weekday} ${time}, ${dateStr}`;
    }
    
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    
    return localDate.toLocaleString('en-GB', options);
  };

  return {
    timezoneOffset,
    autoDetect,
    loading,
    updateTimezone,
    updateAutoDetect,
    getUserTimezoneOffset,
    formatTimestamp,
  };
};
