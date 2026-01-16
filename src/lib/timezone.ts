import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

/**
 * Detects the browser's timezone offset and returns it in ±HH:MM format.
 * Example: For EST (UTC-5), returns "-05:00"
 */
export const detectBrowserTimezoneOffset = (): string => {
  const now = new Date();
  const offsetMinutes = now.getTimezoneOffset(); // Returns offset in minutes (e.g., 300 for EST)
  
  // getTimezoneOffset returns the difference between UTC and local time in minutes
  // If local time is behind UTC (like EST), it returns positive value
  // We need to invert the sign for our format
  const sign = offsetMinutes <= 0 ? '+' : '-';
  const absMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absMinutes / 60).toString().padStart(2, '0');
  const minutes = (absMinutes % 60).toString().padStart(2, '0');
  
  return `${sign}${hours}:${minutes}`;
};

/**
 * Normalizes a timezone offset string to ensure it has proper ±HH:MM format.
 * Falls back to browser detection if input is invalid.
 */
export const normalizeTimezoneOffset = (offset?: string | null): string => {
  if (!offset) return detectBrowserTimezoneOffset();
  
  // Check if already properly formatted with sign
  if (/^[+-]\d{2}:\d{2}$/.test(offset)) {
    return offset;
  }
  
  // Try to parse malformed offset like "05:00" without sign
  const match = offset.match(/^(\d{2}):(\d{2})$/);
  if (match) {
    // Ambiguous - fall back to browser detection
    console.warn(`Ambiguous timezone offset "${offset}" - using browser detection`);
    return detectBrowserTimezoneOffset();
  }
  
  // Invalid format - use browser detection
  return detectBrowserTimezoneOffset();
};

export const getUserTimezone = (timezoneOffset: string = '+00:00'): string => {
  // Convert offset format (+05:30) to timezone
  // For simplicity, we'll use the offset directly
  return timezoneOffset;
};

export const getDateInUserTimezone = (date: Date | string = new Date(), timezoneOffset?: string): Date => {
  const timezone = normalizeTimezoneOffset(timezoneOffset);
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return toZonedTime(dateObj, timezone);
};

/**
 * Gets the current date as YYYY-MM-DD in the specified timezone offset.
 */
export const getDayKeyInOffset = (date: Date, offset: string): string => {
  const normalizedOffset = normalizeTimezoneOffset(offset);
  return formatInTimeZone(date, normalizedOffset, "yyyy-MM-dd");
};

export const isSameDayInTimezone = (date1: Date | string, date2: Date | string, timezoneOffset?: string): boolean => {
  const d1 = getDateInUserTimezone(date1, timezoneOffset);
  const d2 = getDateInUserTimezone(date2, timezoneOffset);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const getDaysDifferenceInTimezone = (date1: Date | string, date2: Date | string, timezoneOffset?: string): number => {
  const d1 = getDateInUserTimezone(date1, timezoneOffset);
  const d2 = getDateInUserTimezone(date2, timezoneOffset);
  
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};
