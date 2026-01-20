/**
 * Streak Logic Tests - Validates streak and orb prompt logic per specification.
 */

import { describe, it, expect } from 'vitest';
import {
  getDaysSinceLastHello,
  hasHelloToday,
  getOrbPromptDecision,
  calculateStreakOnHello,
  useOrbToSaveStreak,
  normalizeDateKey,
  isValidDateKey,
  StreakState,
} from './streakLogic';

describe('getDaysSinceLastHello', () => {
  it('returns 0 when last hello was today', () => {
    expect(getDaysSinceLastHello('2024-01-15', '2024-01-15')).toBe(0);
  });

  it('returns 1 when last hello was yesterday', () => {
    expect(getDaysSinceLastHello('2024-01-14', '2024-01-15')).toBe(1);
  });

  it('returns 2 when last hello was 2 days ago', () => {
    expect(getDaysSinceLastHello('2024-01-13', '2024-01-15')).toBe(2);
  });

  it('returns Infinity when lastHelloDate is null', () => {
    expect(getDaysSinceLastHello(null, '2024-01-15')).toBe(Infinity);
  });
});

describe('getOrbPromptDecision - CRITICAL TESTS', () => {
  const today = '2024-01-15';

  it('should NOT prompt when streakCount is 0', () => {
    const state: StreakState = { streakCount: 0, lastHelloDate: '2024-01-13', orbUsedForDate: null, orbs: 2 };
    expect(getOrbPromptDecision(state, today).shouldPrompt).toBe(false);
  });

  it('should NOT prompt when already logged today (d === 0)', () => {
    const state: StreakState = { streakCount: 5, lastHelloDate: '2024-01-15', orbUsedForDate: null, orbs: 2 };
    expect(getOrbPromptDecision(state, today).shouldPrompt).toBe(false);
  });

  it('should NOT prompt when last hello was yesterday (d === 1) - CRITICAL BUG FIX', () => {
    const state: StreakState = { streakCount: 5, lastHelloDate: '2024-01-14', orbUsedForDate: null, orbs: 2 };
    expect(getOrbPromptDecision(state, today).shouldPrompt).toBe(false);
  });

  it('SHOULD prompt when missed 1 day (d === 2) with orbs', () => {
    const state: StreakState = { streakCount: 5, lastHelloDate: '2024-01-13', orbUsedForDate: null, orbs: 2 };
    const result = getOrbPromptDecision(state, today);
    expect(result.shouldPrompt).toBe(true);
    if (result.shouldPrompt) expect(result.scenario).toBe('can_save');
  });

  it('SHOULD prompt fresh_start when missed 3+ days (d >= 4)', () => {
    const state: StreakState = { streakCount: 5, lastHelloDate: '2024-01-11', orbUsedForDate: null, orbs: 3 };
    const result = getOrbPromptDecision(state, today);
    expect(result.shouldPrompt).toBe(true);
    if (result.shouldPrompt) expect(result.scenario).toBe('fresh_start');
  });
});

describe('calculateStreakOnHello', () => {
  it('returns streak 1 for first hello ever', () => {
    expect(calculateStreakOnHello(0, null, '2024-01-15').newStreakCount).toBe(1);
  });

  it('increments streak when last hello was yesterday', () => {
    expect(calculateStreakOnHello(5, '2024-01-14', '2024-01-15').newStreakCount).toBe(6);
  });

  it('keeps streak unchanged for additional hello same day', () => {
    expect(calculateStreakOnHello(5, '2024-01-15', '2024-01-15').newStreakCount).toBe(5);
  });

  it('resets streak to 1 when missed days', () => {
    expect(calculateStreakOnHello(5, '2024-01-13', '2024-01-15').newStreakCount).toBe(1);
  });
});

describe('normalizeDateKey', () => {
  it('extracts date from ISO timestamp', () => {
    expect(normalizeDateKey('2024-01-15T15:30:00Z')).toBe('2024-01-15');
  });

  it('returns date string unchanged', () => {
    expect(normalizeDateKey('2024-01-15')).toBe('2024-01-15');
  });
});

describe('isValidDateKey', () => {
  it('returns true for valid YYYY-MM-DD format', () => {
    expect(isValidDateKey('2024-01-15')).toBe(true);
  });

  it('returns false for ISO timestamp', () => {
    expect(isValidDateKey('2024-01-15T15:30:00Z')).toBe(false);
  });
});
