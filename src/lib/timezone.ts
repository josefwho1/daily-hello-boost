import { toZonedTime } from 'date-fns-tz';

export const getUserTimezone = (): string => {
  const stored = localStorage.getItem("timezone");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const getDateInUserTimezone = (date: Date | string = new Date()): Date => {
  const timezone = getUserTimezone();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return toZonedTime(dateObj, timezone);
};

export const isSameDayInTimezone = (date1: Date | string, date2: Date | string): boolean => {
  const d1 = getDateInUserTimezone(date1);
  const d2 = getDateInUserTimezone(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const getDaysDifferenceInTimezone = (date1: Date | string, date2: Date | string): number => {
  const d1 = getDateInUserTimezone(date1);
  const d2 = getDateInUserTimezone(date2);
  
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};
