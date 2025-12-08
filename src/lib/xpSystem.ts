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
  { name: "New Friend", minLevel: 1, maxLevel: 9, xpThreshold: 0, color: "#8B5CF6", emoji: "👋" },
  { name: "Hello Rookie", minLevel: 10, maxLevel: 19, xpThreshold: 2000, color: "#3B82F6", emoji: "🌱" },
  { name: "Social Caterpillar", minLevel: 20, maxLevel: 29, xpThreshold: 10000, color: "#10B981", emoji: "🐛" },
  { name: "Social Butterfly", minLevel: 30, maxLevel: 39, xpThreshold: 30000, color: "#F59E0B", emoji: "🦋" },
  { name: "Social Eagle", minLevel: 40, maxLevel: 49, xpThreshold: 75000, color: "#EF4444", emoji: "🦅" },
  { name: "Kindaroo", minLevel: 50, maxLevel: 59, xpThreshold: 150000, color: "#EC4899", emoji: "🦘" },
  { name: "Cooala", minLevel: 60, maxLevel: 69, xpThreshold: 350000, color: "#8B5CF6", emoji: "🐨" },
  { name: "Legend Status", minLevel: 70, maxLevel: 79, xpThreshold: 700000, color: "#F97316", emoji: "🏆" },
  { name: "Hello Hero", minLevel: 80, maxLevel: 89, xpThreshold: 1500000, color: "#14B8A6", emoji: "🦸" },
  { name: "World (Re)Connector", minLevel: 90, maxLevel: 99, xpThreshold: 3500000, color: "#6366F1", emoji: "🌍" },
  { name: "One Hello Immortal", minLevel: 100, maxLevel: 100, xpThreshold: 7500000, color: "#FFD700", emoji: "✨" },
];

// XP thresholds for each level (cumulative)
export const LEVEL_XP_THRESHOLDS: number[] = (() => {
  const thresholds: number[] = [0]; // Level 1 starts at 0
  
  // Calculate XP needed for each level based on rank thresholds
  const rankXpRanges = [
    { start: 1, end: 9, startXp: 0, endXp: 2000 },
    { start: 10, end: 19, startXp: 2000, endXp: 10000 },
    { start: 20, end: 29, startXp: 10000, endXp: 30000 },
    { start: 30, end: 39, startXp: 30000, endXp: 75000 },
    { start: 40, end: 49, startXp: 75000, endXp: 150000 },
    { start: 50, end: 59, startXp: 150000, endXp: 350000 },
    { start: 60, end: 69, startXp: 350000, endXp: 700000 },
    { start: 70, end: 79, startXp: 700000, endXp: 1500000 },
    { start: 80, end: 89, startXp: 1500000, endXp: 3500000 },
    { start: 90, end: 99, startXp: 3500000, endXp: 7500000 },
    { start: 100, end: 100, startXp: 7500000, endXp: 15000000 },
  ];

  for (const range of rankXpRanges) {
    const levelsInRange = range.end - range.start + 1;
    const xpPerLevel = (range.endXp - range.startXp) / levelsInRange;
    
    for (let i = 0; i < levelsInRange; i++) {
      const levelXp = Math.floor(range.startXp + (xpPerLevel * i));
      if (thresholds.length <= range.start + i) {
        thresholds.push(levelXp);
      }
    }
  }
  
  thresholds.push(15000000); // Level 100 completion
  return thresholds;
})();

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
  if (currentLevel >= 100) return LEVEL_XP_THRESHOLDS[100] || 15000000;
  return LEVEL_XP_THRESHOLDS[currentLevel] || 0;
};

export const getXpProgress = (totalXp: number, currentLevel: number): { current: number; needed: number; percent: number } => {
  if (currentLevel >= 100) {
    return { current: totalXp, needed: 15000000, percent: 100 };
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
  mode: 'daily' | 'chill',
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
  
  if (mode === 'daily' && dailyStreak > 0) {
    // Daily mode: 1.02× per consecutive day (compounds)
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
