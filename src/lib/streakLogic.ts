/**
 * Streak Logic Module
 * 
 * Core Concept:
 * - Daily streak increments when user logs at least one Hello per calendar day
 * - Days are defined by user's local timezone (00:00 to 23:59:59)
 * - Orbs are used ONLY after missed day(s) to save streak
 * - 2-day forgiveness window: orb can save if missed 1 or 2 full calendar days
 * - All logic is calendar-based, not rolling 24 hours
 */

import { getDayKeyInOffset, getDayKeyDifference, getYesterdayKeyInOffset } from './timezone';

// ============================================================================
// TYPES
// ============================================================================

export interface StreakState {
  streakCount: number;           // Current daily streak
  lastHelloDate: string | null;  // YYYY-MM-DD of last hello (user's local date)
  orbUsedForDate: string | null; // YYYY-MM-DD to prevent repeated orb prompts
  orbs: number;                  // Available orbs (0-3)
}

export type OrbPromptDecision = 
  | { shouldPrompt: false; reason: string }
  | { shouldPrompt: true; scenario: 'can_save' | 'no_orbs' | 'fresh_start'; missedDays: number };

export interface StreakIncrementResult {
  newStreakCount: number;
  wasIncremented: boolean;
  reason: string;
}

export interface OrbUseResult {
  newOrbs: number;
  newLastHelloDate: string;
  reason: string;
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Calculate the number of days since the last hello.
 * 
 * Returns:
 * - 0: last hello was today
 * - 1: last hello was yesterday (still safe)
 * - 2: last hello was 2 days ago (missed yesterday) 
 * - 3: last hello was 3 days ago (missed 2 days)
 * - etc.
 */
export function getDaysSinceLastHello(
  lastHelloDate: string | null,
  today: string
): number {
  if (!lastHelloDate) return Infinity;
  
  // Normalize to date-only format if it includes time
  const normalizedLastDate = lastHelloDate.includes('T') 
    ? lastHelloDate.split('T')[0] 
    : lastHelloDate;
  
  return getDayKeyDifference(normalizedLastDate, today);
}

/**
 * Check if the user has logged a hello today.
 */
export function hasHelloToday(
  lastHelloDate: string | null,
  today: string
): boolean {
  if (!lastHelloDate) return false;
  
  const normalizedLastDate = lastHelloDate.includes('T') 
    ? lastHelloDate.split('T')[0] 
    : lastHelloDate;
  
  return normalizedLastDate === today;
}

/**
 * Determine whether to show the orb prompt and which scenario.
 * 
 * RULES:
 * - Do NOT show if streakCount === 0 (nothing to save)
 * - Do NOT show if lastHelloDate === today (already logged today)
 * - Do NOT show if d === 1 (last hello was yesterday, still safe)
 * - Do NOT show if already prompted for this missed period
 * - SHOW if d === 2 (missed 1 day - yesterday)
 * - SHOW if d === 3 (missed 2 days)
 * - If d >= 4: streak must reset (fresh_start)
 */
export function getOrbPromptDecision(
  state: StreakState,
  today: string
): OrbPromptDecision {
  const { streakCount, lastHelloDate, orbUsedForDate, orbs } = state;

  // Rule 1: No streak to save
  if (streakCount === 0) {
    return { shouldPrompt: false, reason: 'No streak to save (streakCount is 0)' };
  }

  // Rule 2: No last hello date recorded
  if (!lastHelloDate) {
    return { shouldPrompt: false, reason: 'No lastHelloDate recorded' };
  }

  const d = getDaysSinceLastHello(lastHelloDate, today);

  // Rule 3: Already logged today
  if (d === 0) {
    return { shouldPrompt: false, reason: 'Already logged a hello today' };
  }

  // Rule 4: Last hello was yesterday - still safe, no prompt needed
  if (d === 1) {
    return { shouldPrompt: false, reason: 'Last hello was yesterday, still safe to log today' };
  }

  // Rule 5: Already prompted for this period
  if (orbUsedForDate === today) {
    return { shouldPrompt: false, reason: 'Already offered orb prompt for this period' };
  }

  // Calculate missed days for display
  // d=2 means 1 missed day, d=3 means 2 missed days
  const missedDays = d - 1;

  // Rule 6: Beyond 2-day forgiveness window (d >= 4 means 3+ missed days)
  if (d >= 4) {
    return { 
      shouldPrompt: true, 
      scenario: 'fresh_start',
      missedDays
    };
  }

  // Rule 7: Within forgiveness window (d === 2 or d === 3)
  if (orbs > 0) {
    return { 
      shouldPrompt: true, 
      scenario: 'can_save',
      missedDays
    };
  } else {
    return { 
      shouldPrompt: true, 
      scenario: 'no_orbs',
      missedDays
    };
  }
}

/**
 * Calculate the new streak when logging a hello.
 * 
 * RULES:
 * - If first hello ever: streak = 1
 * - If first hello TODAY and lastHelloDate was yesterday (d === 1): increment streak
 * - If first hello TODAY and lastHelloDate was before yesterday (d >= 2): reset to 1
 * - If already logged today: keep current streak (no change)
 */
export function calculateStreakOnHello(
  currentStreak: number,
  lastHelloDate: string | null,
  today: string
): StreakIncrementResult {
  // First hello ever
  if (!lastHelloDate) {
    return {
      newStreakCount: 1,
      wasIncremented: true,
      reason: 'First hello ever, starting streak at 1'
    };
  }

  const d = getDaysSinceLastHello(lastHelloDate, today);

  // Already logged today - no change
  if (d === 0) {
    return {
      newStreakCount: currentStreak,
      wasIncremented: false,
      reason: 'Additional hello today, streak unchanged'
    };
  }

  // Last hello was yesterday - increment streak
  if (d === 1) {
    return {
      newStreakCount: currentStreak + 1,
      wasIncremented: true,
      reason: 'Logged yesterday, incrementing streak'
    };
  }

  // Missed days - reset to 1 (this hello starts a new streak)
  return {
    newStreakCount: 1,
    wasIncremented: true,
    reason: `Missed ${d - 1} day(s), resetting streak to 1`
  };
}

/**
 * Process orb usage to save streak.
 * 
 * Sets lastHelloDate to YESTERDAY to re-establish continuity.
 * When user logs their next hello today, d will be 1, allowing streak to continue.
 */
export function useOrbToSaveStreak(
  currentOrbs: number,
  today: string,
  timezoneOffset: string
): OrbUseResult | null {
  if (currentOrbs < 1) {
    return null;
  }

  const yesterday = getYesterdayKeyInOffset(new Date(), timezoneOffset);

  return {
    newOrbs: currentOrbs - 1,
    newLastHelloDate: yesterday,
    reason: 'Orb used, lastHelloDate set to yesterday to preserve streak continuity'
  };
}

/**
 * Get today's date key in the user's timezone.
 */
export function getTodayKey(timezoneOffset: string): string {
  return getDayKeyInOffset(new Date(), timezoneOffset);
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate that a date string is in YYYY-MM-DD format.
 */
export function isValidDateKey(dateKey: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey);
}

/**
 * Normalize a date string to YYYY-MM-DD format.
 * Handles both YYYY-MM-DD and ISO timestamp formats.
 */
export function normalizeDateKey(date: string | null): string | null {
  if (!date) return null;
  if (date.includes('T')) {
    return date.split('T')[0];
  }
  return date;
}
