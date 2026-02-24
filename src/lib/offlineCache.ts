// Offline-first cache layer
// Stores hello logs and user stats in localStorage for instant loads + offline support

export interface CachedHelloEntry {
  id: string;
  user_id: string;
  name: string | null;
  location: string | null;
  notes: string | null;
  rating: 'positive' | 'neutral' | 'negative' | null;
  difficulty_rating: number | null;
  no_name_flag: boolean;
  created_at: string;
  timezone_offset: string;
  linked_to?: string | null;
  is_favorite?: boolean;
  hello_type?: string | null;
  // Offline-first fields
  _localId?: string;
  _synced: boolean;
}

export interface CachedUserStats {
  current_streak: number;
  total_hellos: number;
  hellos_this_week: number;
  current_day: number;
  last_completed_date: string | null;
  last_updated: string;
}

const KEYS = {
  HELLO_ENTRIES: 'offline_hello_entries',
  PENDING_SYNC: 'offline_pending_sync',
  USER_STATS: 'offline_user_stats',
  USER_PROGRESS: 'offline_user_progress',
  LAST_FULL_SYNC: 'offline_last_full_sync',
} as const;

// --- Hello Entries ---

export const getCachedHellos = (): CachedHelloEntry[] => {
  try {
    const raw = localStorage.getItem(KEYS.HELLO_ENTRIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const setCachedHellos = (entries: CachedHelloEntry[]): void => {
  try {
    localStorage.setItem(KEYS.HELLO_ENTRIES, JSON.stringify(entries));
  } catch (e) {
    console.warn('Failed to cache hellos:', e);
  }
};

export const addCachedHello = (entry: CachedHelloEntry): void => {
  const entries = getCachedHellos();
  entries.unshift(entry);
  setCachedHellos(entries);
};

export const updateCachedHello = (id: string, updates: Partial<CachedHelloEntry>): void => {
  const entries = getCachedHellos();
  const idx = entries.findIndex(e => e.id === id || e._localId === id);
  if (idx !== -1) {
    entries[idx] = { ...entries[idx], ...updates };
    setCachedHellos(entries);
  }
};

export const removeCachedHello = (id: string): void => {
  const entries = getCachedHellos();
  setCachedHellos(entries.filter(e => e.id !== id && e._localId !== id));
};

// Replace a local ID with a server ID after sync
export const replaceCachedHelloId = (localId: string, serverId: string): void => {
  const entries = getCachedHellos();
  const idx = entries.findIndex(e => e.id === localId || e._localId === localId);
  if (idx !== -1) {
    entries[idx].id = serverId;
    entries[idx]._localId = undefined;
    entries[idx]._synced = true;
    setCachedHellos(entries);
  }
};

// --- Pending Sync Queue ---

export const getPendingSync = (): string[] => {
  try {
    const raw = localStorage.getItem(KEYS.PENDING_SYNC);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addToPendingSync = (localId: string): void => {
  const pending = getPendingSync();
  if (!pending.includes(localId)) {
    pending.push(localId);
    localStorage.setItem(KEYS.PENDING_SYNC, JSON.stringify(pending));
  }
};

export const removeFromPendingSync = (localId: string): void => {
  const pending = getPendingSync().filter(id => id !== localId);
  localStorage.setItem(KEYS.PENDING_SYNC, JSON.stringify(pending));
};

export const clearPendingSync = (): void => {
  localStorage.setItem(KEYS.PENDING_SYNC, JSON.stringify([]));
};

// --- Pending Deletions Queue ---

const DELETION_KEY = 'offline_pending_deletions';

export interface PendingDeletion {
  id: string;
  timestamp: string;
}

export const getPendingDeletions = (): PendingDeletion[] => {
  try {
    const raw = localStorage.getItem(DELETION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addToPendingDeletions = (id: string): void => {
  const pending = getPendingDeletions();
  if (!pending.some(d => d.id === id)) {
    pending.push({ id, timestamp: new Date().toISOString() });
    localStorage.setItem(DELETION_KEY, JSON.stringify(pending));
  }
};

export const removeFromPendingDeletions = (id: string): void => {
  const pending = getPendingDeletions().filter(d => d.id !== id);
  localStorage.setItem(DELETION_KEY, JSON.stringify(pending));
};

// --- Pending Progress Updates Queue ---

const PROGRESS_SYNC_KEY = 'offline_pending_progress';

export const getPendingProgressUpdates = (): Record<string, unknown>[] => {
  try {
    const raw = localStorage.getItem(PROGRESS_SYNC_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addPendingProgressUpdate = (updates: Record<string, unknown>): void => {
  const pending = getPendingProgressUpdates();
  pending.push(updates);
  localStorage.setItem(PROGRESS_SYNC_KEY, JSON.stringify(pending));
};

export const clearPendingProgressUpdates = (): void => {
  localStorage.setItem(PROGRESS_SYNC_KEY, JSON.stringify([]));
};

// --- User Progress Cache ---

export const getCachedProgress = <T = Record<string, unknown>>(userId?: string): T | null => {
  try {
    const raw = localStorage.getItem(KEYS.USER_PROGRESS);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // If userId provided, validate cache belongs to this user
    if (userId && parsed?.user_id && parsed.user_id !== userId) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const setCachedProgress = (progress: Record<string, unknown>): void => {
  try {
    localStorage.setItem(KEYS.USER_PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to cache progress:', e);
  }
};

// --- Full sync tracking ---

export const getLastFullSync = (): string | null => {
  return localStorage.getItem(KEYS.LAST_FULL_SYNC);
};

export const setLastFullSync = (): void => {
  localStorage.setItem(KEYS.LAST_FULL_SYNC, new Date().toISOString());
};

// --- Utility ---

export const hasCachedData = (): boolean => {
  return !!localStorage.getItem(KEYS.HELLO_ENTRIES) || !!localStorage.getItem(KEYS.USER_PROGRESS);
};

export const generateLocalId = (): string => {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};
