import { useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';
import {
  getCachedHellos,
  getPendingSync,
  removeFromPendingSync,
  replaceCachedHelloId,
  clearPendingSync,
} from '@/lib/offlineCache';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'pending';

export const useOfflineSync = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const syncingRef = useRef(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [pendingCount, setPendingCount] = useState(0);

  // Update pending count
  const refreshPendingCount = useCallback(() => {
    const count = getPendingSync().length;
    setPendingCount(count);
    if (count === 0 && navigator.onLine) {
      setSyncStatus('synced');
    } else if (count > 0 && !navigator.onLine) {
      setSyncStatus('offline');
    } else if (count > 0) {
      setSyncStatus('pending');
    }
  }, []);

  const syncPendingHellos = useCallback(async () => {
    if (!user || syncingRef.current) return;
    
    const pending = getPendingSync();
    if (pending.length === 0) return;

    syncingRef.current = true;
    setSyncStatus('syncing');

    const entries = getCachedHellos();
    let syncedAny = false;

    for (const localId of pending) {
      const entry = entries.find(e => e.id === localId || e._localId === localId);
      if (!entry || entry._synced) {
        removeFromPendingSync(localId);
        continue;
      }

      try {
        const { data, error } = await supabase
          .from('hello_logs')
          .insert({
            user_id: user.id,
            name: entry.name || null,
            location: entry.location || null,
            notes: entry.notes || null,
            rating: entry.rating || null,
            difficulty_rating: entry.difficulty_rating || null,
            no_name_flag: entry.no_name_flag || false,
            timezone_offset: entry.timezone_offset,
            linked_to: entry.linked_to || null,
            hello_type: entry.hello_type || null,
          })
          .select()
          .single();

        if (error) throw error;

        // Replace local ID with server ID in cache
        replaceCachedHelloId(localId, data.id);
        removeFromPendingSync(localId);
        syncedAny = true;
      } catch (err) {
        console.warn('Sync failed for entry, will retry:', localId, err);
        // Stop syncing on failure - will retry later
        break;
      }
    }

    syncingRef.current = false;
    refreshPendingCount();

    // Refresh React Query cache if we synced anything
    if (syncedAny) {
      await queryClient.invalidateQueries({ queryKey: ['hello-logs'] });
      await queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    }
  }, [user, queryClient, refreshPendingCount]);

  // Sync on online event
  useEffect(() => {
    const handleOnline = () => {
      syncPendingHellos();
    };

    const handleOffline = () => {
      const pending = getPendingSync();
      if (pending.length > 0) {
        setSyncStatus('offline');
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        syncPendingHellos();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [syncPendingHellos]);

  // Initial sync attempt on mount
  useEffect(() => {
    refreshPendingCount();
    if (navigator.onLine && user) {
      syncPendingHellos();
    }
  }, [user, syncPendingHellos, refreshPendingCount]);

  return {
    syncStatus,
    pendingCount,
    syncPendingHellos,
    refreshPendingCount,
  };
};
