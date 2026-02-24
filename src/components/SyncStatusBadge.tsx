import { memo, useState, useEffect } from 'react';
import { Loader2, WifiOff, CloudUpload } from 'lucide-react';
import type { SyncStatus } from '@/hooks/useOfflineSync';

interface SyncStatusBadgeProps {
  status: SyncStatus;
  pendingCount: number;
  /** When true, shows an offline indicator even when status is 'synced' but navigator is offline */
  showOfflineIndicator?: boolean;
}

const SyncStatusBadgeComponent = ({ status, pendingCount, showOfflineIndicator = false }: SyncStatusBadgeProps) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Show offline badge even when synced if user is offline
  if (status === 'synced' && !isOffline) return null;

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-card border border-border/40 shadow-sm">
      {status === 'syncing' && (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
          <span className="text-muted-foreground">Syncing {pendingCount}…</span>
        </>
      )}
      {status === 'pending' && (
        <>
          <CloudUpload className="w-3 h-3 text-amber-500" />
          <span className="text-muted-foreground">{pendingCount} pending</span>
        </>
      )}
      {(status === 'offline' || (status === 'synced' && isOffline)) && (
        <>
          <WifiOff className="w-3 h-3 text-destructive" />
          <span className="text-muted-foreground">{pendingCount > 0 ? `${pendingCount} offline` : 'Offline'}</span>
        </>
      )}
    </div>
  );
};

export const SyncStatusBadge = memo(SyncStatusBadgeComponent);
