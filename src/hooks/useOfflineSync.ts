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
  getPendingDeletions,
  removeFromPendingDeletions,
  getPendingProgressUpdates,
  clearPendingProgressUpdates,
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
    const syncCount = getPendingSync().length;
    const deleteCount = getPendingDeletions().length;
    const progressCount = getPendingProgressUpdates().length;
    const count = syncCount + deleteCount + progressCount;
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
    const pendingDeletions = getPendingDeletions();
    const pendingProgress = getPendingProgressUpdates();
    if (pending.length === 0 && pendingDeletions.length === 0 && pendingProgress.length === 0) return;

    syncingRef.current = true;
    setSyncStatus('syncing');

    let syncedAny = false;

    // Sync pending inserts
    const entries = getCachedHellos();
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

        replaceCachedHelloId(localId, data.id);
        removeFromPendingSync(localId);
        syncedAny = true;
      } catch (err) {
        console.warn('Sync failed for entry, will retry:', localId, err);
        break;
      }
    }

    // Sync pending deletions
    for (const deletion of pendingDeletions) {
      try {
        await supabase
          .from('hello_logs')
          .update({ linked_to: null })
          .eq('linked_to', deletion.id)
          .eq('user_id', user.id);

        const { error } = await supabase
          .from('hello_logs')
          .delete()
          .eq('id', deletion.id)
          .eq('user_id', user.id);

        if (error) throw error;
        removeFromPendingDeletions(deletion.id);
        syncedAny = true;
      } catch (err) {
        console.warn('Delete sync failed, will retry:', deletion.id, err);
        break;
      }
    }

    // Sync pending progress updates (merge all into one update)
    if (pendingProgress.length > 0) {
      try {
        const merged = pendingProgress.reduce((acc, update) => ({ ...acc, ...update }), {});
        const { error } = await supabase
          .from('user_progress')
          .update(merged)
          .eq('user_id', user.id);

        if (error) throw error;
        clearPendingProgressUpdates();
        syncedAny = true;
      } catch (err) {
        console.warn('Progress sync failed, will retry:', err);
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
      const pending = getPendingSync().length + getPendingDeletions().length + getPendingProgressUpdates().length;
      if (pending > 0) {
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
