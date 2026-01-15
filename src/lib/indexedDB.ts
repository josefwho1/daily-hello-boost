// IndexedDB storage for guest mode
// Handles offline data persistence for users without accounts

const DB_NAME = 'onehello_guest_db';
const DB_VERSION = 1;

export interface GuestProgress {
  device_id: string;
  guest_user_id: string;
  current_streak: number;
  current_day: number;
  last_completed_date: string | null;
  target_hellos_per_week: number;
  hellos_this_week: number;
  weekly_streak: number;
  daily_streak: number;
  longest_streak: number;
  is_onboarding_week: boolean;
  onboarding_week_start: string | null;
  week_start_date: string | null;
  has_completed_onboarding: boolean;
  orbs: number;
  has_received_first_orb: boolean;
  total_hellos: number;
  total_xp: number;
  current_level: number;
  hellos_today_count: number;
  names_today_count: number;
  notes_today_count: number;
  last_xp_reset_date: string | null;
  mode: string;
  why_here: string | null;
  selected_pack_id: string;
  username: string;
  comfort_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface GuestHelloLog {
  id: string;
  name: string | null;
  notes: string | null;
  hello_type: string | null;
  rating: 'positive' | 'neutral' | 'negative' | null;
  difficulty_rating: number | null;
  created_at: string;
  timezone_offset: string;
}

export interface GuestState {
  device_id: string;
  guest_user_id: string;
  account_linked: boolean;
  prompt_dismissed_count: number;
  last_prompt_shown_at: string | null;
  total_hellos_logged: number;
  created_at: string;
}

let dbInstance: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Guest state store
      if (!db.objectStoreNames.contains('guest_state')) {
        db.createObjectStore('guest_state', { keyPath: 'device_id' });
      }
      
      // Guest progress store
      if (!db.objectStoreNames.contains('guest_progress')) {
        db.createObjectStore('guest_progress', { keyPath: 'device_id' });
      }
      
      // Hello logs store
      if (!db.objectStoreNames.contains('hello_logs')) {
        const logsStore = db.createObjectStore('hello_logs', { keyPath: 'id' });
        logsStore.createIndex('created_at', 'created_at', { unique: false });
      }
    };
  });
};

// Generate a random UUID
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

// Guest State operations
export const getGuestState = async (): Promise<GuestState | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('guest_state', 'readonly');
    const store = transaction.objectStore('guest_state');
    const request = store.getAll();
    
    request.onsuccess = () => {
      const states = request.result;
      resolve(states.length > 0 ? states[0] : null);
    };
    request.onerror = () => reject(request.error);
  });
};

export const createGuestState = async (): Promise<GuestState> => {
  const db = await openDB();
  const now = new Date().toISOString();
  
  const state: GuestState = {
    device_id: generateUUID(),
    guest_user_id: generateUUID(),
    account_linked: false,
    prompt_dismissed_count: 0,
    last_prompt_shown_at: null,
    total_hellos_logged: 0,
    created_at: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('guest_state', 'readwrite');
    const store = transaction.objectStore('guest_state');
    const request = store.add(state);
    
    request.onsuccess = () => resolve(state);
    request.onerror = () => reject(request.error);
  });
};

export const updateGuestState = async (updates: Partial<GuestState>): Promise<void> => {
  const db = await openDB();
  const current = await getGuestState();
  if (!current) return;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('guest_state', 'readwrite');
    const store = transaction.objectStore('guest_state');
    const request = store.put({ ...current, ...updates });
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Guest Progress operations
export const getGuestProgress = async (): Promise<GuestProgress | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('guest_progress', 'readonly');
    const store = transaction.objectStore('guest_progress');
    const request = store.getAll();
    
    request.onsuccess = () => {
      const progress = request.result;
      resolve(progress.length > 0 ? progress[0] : null);
    };
    request.onerror = () => reject(request.error);
  });
};

export const createGuestProgress = async (deviceId: string, guestUserId: string): Promise<GuestProgress> => {
  const db = await openDB();
  const now = new Date().toISOString();
  const today = now.split('T')[0];
  
  const progress: GuestProgress = {
    device_id: deviceId,
    guest_user_id: guestUserId,
    current_streak: 0,
    current_day: 1,
    last_completed_date: null,
    target_hellos_per_week: 7,
    hellos_this_week: 0,
    weekly_streak: 0,
    daily_streak: 0,
    longest_streak: 0,
    is_onboarding_week: true,
    onboarding_week_start: today,
    week_start_date: null,
    has_completed_onboarding: false,
    orbs: 0,
    has_received_first_orb: false,
    total_hellos: 0,
    total_xp: 0,
    current_level: 1,
    hellos_today_count: 0,
    names_today_count: 0,
    notes_today_count: 0,
    last_xp_reset_date: today,
    mode: 'first_hellos',
    why_here: null,
    selected_pack_id: 'starter-pack',
    username: 'Friend',
    comfort_rating: null,
    created_at: now,
    updated_at: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('guest_progress', 'readwrite');
    const store = transaction.objectStore('guest_progress');
    const request = store.add(progress);
    
    request.onsuccess = () => resolve(progress);
    request.onerror = () => reject(request.error);
  });
};

export const updateGuestProgress = async (updates: Partial<GuestProgress>): Promise<void> => {
  const db = await openDB();
  const current = await getGuestProgress();
  if (!current) return;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('guest_progress', 'readwrite');
    const store = transaction.objectStore('guest_progress');
    const request = store.put({ 
      ...current, 
      ...updates, 
      updated_at: new Date().toISOString() 
    });
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Hello Logs operations
export const getGuestHelloLogs = async (): Promise<GuestHelloLog[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('hello_logs', 'readonly');
    const store = transaction.objectStore('hello_logs');
    const request = store.getAll();
    
    request.onsuccess = () => {
      const logs = request.result as GuestHelloLog[];
      // Sort by created_at descending
      logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      resolve(logs);
    };
    request.onerror = () => reject(request.error);
  });
};

export const addGuestHelloLog = async (log: Omit<GuestHelloLog, 'id' | 'created_at'>): Promise<GuestHelloLog> => {
  const db = await openDB();
  const now = new Date().toISOString();
  
  const newLog: GuestHelloLog = {
    ...log,
    id: generateUUID(),
    created_at: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction('hello_logs', 'readwrite');
    const store = transaction.objectStore('hello_logs');
    const request = store.add(newLog);
    
    request.onsuccess = () => resolve(newLog);
    request.onerror = () => reject(request.error);
  });
};

export const updateGuestHelloLog = async (id: string, updates: Partial<GuestHelloLog>): Promise<void> => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('hello_logs', 'readwrite');
    const store = transaction.objectStore('hello_logs');
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const current = getRequest.result;
      if (!current) {
        resolve();
        return;
      }
      
      const putRequest = store.put({ ...current, ...updates });
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
};

// Clear all guest data (after syncing to cloud or on sign out)
export const clearGuestData = async (): Promise<void> => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['guest_state', 'guest_progress', 'hello_logs'], 'readwrite');
    
    transaction.objectStore('guest_state').clear();
    transaction.objectStore('guest_progress').clear();
    transaction.objectStore('hello_logs').clear();
    
    transaction.oncomplete = () => {
      // Close the database connection and clear the cached instance
      db.close();
      dbInstance = null;
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
};

// Check if IndexedDB is available
export const isIndexedDBAvailable = (): boolean => {
  try {
    return 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
};
