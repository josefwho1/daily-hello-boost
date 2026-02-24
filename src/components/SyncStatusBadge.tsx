import { memo } from 'react';
import { Loader2, WifiOff, CloudUpload } from 'lucide-react';
import type { SyncStatus } from '@/hooks/useOfflineSync';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface SyncStatusBadgeProps {
  status: SyncStatus;
  pendingCount: number;
}

const SyncStatusBadgeComponent = ({ status, pendingCount }: SyncStatusBadgeProps) => {
  const isOnline = useOnlineStatus();

  // Nothing to show when synced and online
  if (status === 'synced' && isOnline) return null;

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
      {(status === 'offline' || (status === 'synced' && !isOnline)) && (
        <>
          <WifiOff className="w-3 h-3 text-destructive" />
          <span className="text-muted-foreground">{pendingCount > 0 ? `${pendingCount} offline` : 'Offline'}</span>
        </>
      )}
    </div>
  );
};

export const SyncStatusBadge = memo(SyncStatusBadgeComponent);
