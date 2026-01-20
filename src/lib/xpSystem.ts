// XP System Constants and Calculations

export interface RankInfo {
  name: string;
  minLevel: number;
  maxLevel: number;
  xpThreshold: number;
  color: string;
  emoji: string;
}

export const RANKS: RankInfo[] = [
  { name: "Stranger", minLevel: 1, maxLevel: 1, xpThreshold: 0, color: "#FF6B35", emoji: "👤" },
  { name: "Familiar Face", minLevel: 2, maxLevel: 2, xpThreshold: 20, color: "#FF6B35", emoji: "🙂" },
  { name: "Acquaintance", minLevel: 3, maxLevel: 3, xpThreshold: 40, color: "#FF6B35", emoji: "🤝" },
  { name: "New Friend", minLevel: 4, maxLevel: 4, xpThreshold: 95, color: "#FF6B35", emoji: "👋" },
  { name: "Amigo", minLevel: 5, maxLevel: 5, xpThreshold: 150, color: "#FF6B35", emoji: "🌟" },
  { name: "Mate", minLevel: 6, maxLevel: 6, xpThreshold: 210, color: "#FF6B35", emoji: "🍻" },
  { name: "Compadre", minLevel: 7, maxLevel: 7, xpThreshold: 270, color: "#FF6B35", emoji: "🎯" },
  { name: "Homie", minLevel: 8, maxLevel: 8, xpThreshold: 350, color: "#FF6B35", emoji: "🏠" },
  { name: "Good Dude", minLevel: 9, maxLevel: 9, xpThreshold: 440, color: "#FF6B35", emoji: "👍" },
  { name: "Friend", minLevel: 10, maxLevel: 11, xpThreshold: 550, color: "#FF6B35", emoji: "💪" },
  { name: "Good Friend", minLevel: 12, maxLevel: 14, xpThreshold: 750, color: "#FF6B35", emoji: "🤗" },
  { name: "Great Friend", minLevel: 15, maxLevel: 17, xpThreshold: 1150, color: "#FF6B35", emoji: "⭐" },
  { name: "Fantastic Friend", minLevel: 18, maxLevel: 19, xpThreshold: 1650, color: "#FF6B35", emoji: "🔥" },
  { name: "Semi Pro", minLevel: 20, maxLevel: 29, xpThreshold: 2000, color: "#FF6B35", emoji: "🎯" },
  { name: "Social Butterfly", minLevel: 30, maxLevel: 39, xpThreshold: 5000, color: "#FF6B35", emoji: "🦋" },
  { name: "Social Eagle", minLevel: 40, maxLevel: 49, xpThreshold: 10000, color: "#FF6B35", emoji: "🦅" },
  { name: "Social Pterodactyl", minLevel: 50, maxLevel: 59, xpThreshold: 25000, color: "#FF6B35", emoji: "🦖" },
  { name: "Sensei", minLevel: 60, maxLevel: 69, xpThreshold: 50000, color: "#FF6B35", emoji: "🥋" },
  { name: "Hello Hero", minLevel: 70, maxLevel: 79, xpThreshold: 100000, color: "#FF6B35", emoji: "🦸" },
  { name: "World Connecter", minLevel: 80, maxLevel: 89, xpThreshold: 300000, color: "#FF6B35", emoji: "🌍" },
  { name: "Legend Status", minLevel: 90, maxLevel: 99, xpThreshold: 7500000, color: "#FF6B35", emoji: "🏆" },
  { name: "Immortal", minLevel: 100, maxLevel: 100, xpThreshold: 1000000, color: "#FF6B35", emoji: "✨" },
];

// XP thresholds for each level (exact values from spec)
export const LEVEL_XP_THRESHOLDS: number[] = [
  0,      // Level 1 - Stranger
  20,     // Level 2 - Familiar Face
  40,     // Level 3 - Acquaintance
  95,     // Level 4 - New Friend
  150,    // Level 5 - Amigo
  210,    // Level 6 - Mate
  270,    // Level 7 - Compadre
  350,    // Level 8 - Homie
  440,    // Level 9 - Good Dude
  550,    // Level 10 - Friend
  650,    // Level 11 - Friend
  750,    // Level 12 - Good Friend
  870,    // Level 13 - Good Friend
  1000,   // Level 14 - Good Friend
  1150,   // Level 15 - Great Friend
  1310,   // Level 16 - Great Friend
  1470,   // Level 17 - Great Friend
  1650,   // Level 18 - Fantastic Friend
  1850,   // Level 19 - Fantastic Friend
  2000,   // Level 20 - Semi Pro
  // Levels 21-29: interpolate from 2000 to 5000
  ...Array.from({ length: 9 }, (_, i) => Math.floor(2000 + ((5000 - 2000) / 10) * (i + 1))),
  5000,   // Level 30 - Social Butterfly
  // Levels 31-39: interpolate from 5000 to 10000
  ...Array.from({ length: 9 }, (_, i) => Math.floor(5000 + ((10000 - 5000) / 10) * (i + 1))),
  10000,  // Level 40 - Social Eagle
  // Levels 41-49: interpolate from 10000 to 25000
  ...Array.from({ length: 9 }, (_, i) => Math.floor(10000 + ((25000 - 10000) / 10) * (i + 1))),
  25000,  // Level 50 - Social Pterodactyl
  // Levels 51-59: interpolate from 25000 to 50000
  ...Array.from({ length: 9 }, (_, i) => Math.floor(25000 + ((50000 - 25000) / 10) * (i + 1))),
  50000,  // Level 60 - Sensei
  // Levels 61-69: interpolate from 50000 to 100000
  ...Array.from({ length: 9 }, (_, i) => Math.floor(50000 + ((100000 - 50000) / 10) * (i + 1))),
  100000, // Level 70 - Hello Hero
  // Levels 71-79: interpolate from 100000 to 300000
  ...Array.from({ length: 9 }, (_, i) => Math.floor(100000 + ((300000 - 100000) / 10) * (i + 1))),
  300000, // Level 80 - World Connecter
  // Levels 81-89: interpolate from 300000 to 7500000
  ...Array.from({ length: 9 }, (_, i) => Math.floor(300000 + ((7500000 - 300000) / 10) * (i + 1))),
  7500000, // Level 90 - Legend Status
  // Levels 91-99: interpolate from 7500000 to 1000000
  ...Array.from({ length: 9 }, (_, i) => Math.floor(7500000 + ((10000000 - 7500000) / 10) * (i + 1))),
  1000000, // Level 100 - Immortal
];

export const getLevelFromXp = (totalXp: number): number => {
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_XP_THRESHOLDS[i]) {
      return Math.min(i + 1, 100);
    }
  }
  return 1;
};

export const getRankFromLevel = (level: number): RankInfo => {
  for (const rank of RANKS) {
    if (level >= rank.minLevel && level <= rank.maxLevel) {
      return rank;
    }
  }
  return RANKS[0];
};

export const getXpForNextLevel = (currentLevel: number): number => {
  if (currentLevel >= 100) return LEVEL_XP_THRESHOLDS[100] || 1000000;
  return LEVEL_XP_THRESHOLDS[currentLevel] || 0;
};

export const getXpProgress = (totalXp: number, currentLevel: number): { current: number; needed: number; percent: number } => {
  if (currentLevel >= 100) {
    return { current: totalXp, needed: 1000000, percent: 100 };
  }
  
  const currentLevelXp = LEVEL_XP_THRESHOLDS[currentLevel - 1] || 0;
  const nextLevelXp = LEVEL_XP_THRESHOLDS[currentLevel] || 0;
  const xpIntoLevel = totalXp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  const percent = xpNeededForLevel > 0 ? Math.min((xpIntoLevel / xpNeededForLevel) * 100, 100) : 100;
  
  return {
    current: xpIntoLevel,
    needed: xpNeededForLevel,
    percent
  };
};

// XP calculation for different actions
export interface XpCalculationResult {
  baseXp: number;
  bonusXp: number;
  multiplier: number;
  totalXp: number;
  breakdown: string[];
}

export const calculateHelloXp = (
  hellosToday: number,
  namesToday: number,
  notesToday: number,
  hasName: boolean,
  hasNotes: boolean,
  isTodaysHello: boolean,
  isWeeklyChallenge: boolean,
  isWeeklyGoalComplete: boolean,
  mode: 'daily' | 'chill' | 'first_hellos',
  dailyStreak: number,
  weeklyStreak: number
): XpCalculationResult => {
  let baseXp = 0;
  const breakdown: string[] = [];
  
  // Base XP for hello (decreasing returns)
  const helloXpValues = [10, 8, 6, 4, 2, 1, 1, 1, 1, 1];
  const helloXp = hellosToday < helloXpValues.length ? helloXpValues[hellosToday] : 0;
  if (helloXp > 0) {
    baseXp += helloXp;
    breakdown.push(`Hello: +${helloXp} XP`);
  }
  
  // Name XP (decreasing returns)
  if (hasName) {
    const nameXpValues = [4, 2, 1, 0];
    const nameXp = namesToday < nameXpValues.length ? nameXpValues[namesToday] : 0;
    if (nameXp > 0) {
      baseXp += nameXp;
      breakdown.push(`Name logged: +${nameXp} XP`);
    }
  }
  
  // Notes XP (decreasing returns)
  if (hasNotes) {
    const notesXpValues = [2, 1, 0.5, 0];
    const notesXp = notesToday < notesXpValues.length ? notesXpValues[notesToday] : 0;
    if (notesXp > 0) {
      baseXp += notesXp;
      breakdown.push(`Notes logged: +${notesXp} XP`);
    }
  }
  
  // Bonus XP
  let bonusXp = 0;
  
  if (isTodaysHello) {
    bonusXp += 5;
    breakdown.push(`Today's Hello bonus: +5 XP`);
  }
  
  if (isWeeklyChallenge) {
    bonusXp += 42;
    breakdown.push(`Remi's Challenge: +42 XP`);
  }
  
  if (isWeeklyGoalComplete) {
    bonusXp += 20;
    breakdown.push(`Weekly goal complete: +20 XP`);
  }
  
  // Calculate multiplier
  let multiplier = 1;
  
  if ((mode === 'daily' || mode === 'first_hellos') && dailyStreak > 0) {
    // Daily mode & first_hellos: 1.02× per consecutive day (compounds)
    multiplier = Math.pow(1.02, dailyStreak - 1);
    if (multiplier > 1) {
      breakdown.push(`Daily streak (${dailyStreak} days): ×${multiplier.toFixed(2)}`);
    }
  } else if (mode === 'chill' && weeklyStreak >= 5) {
    // Chill mode: 1.20× flat from week 5 onward
    multiplier = 1.20;
    breakdown.push(`Chill mode week ${weeklyStreak}: ×1.20`);
  }
  
  const totalXp = Math.floor((baseXp + bonusXp) * multiplier);
  
  return {
    baseXp,
    bonusXp,
    multiplier,
    totalXp,
    breakdown
  };
};

export const formatXp = (xp: number): string => {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
};
