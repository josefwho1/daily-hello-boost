import { memo } from 'react';
import { Check, Loader2, WifiOff, CloudUpload } from 'lucide-react';
import type { SyncStatus } from '@/hooks/useOfflineSync';

interface SyncStatusBadgeProps {
  status: SyncStatus;
  pendingCount: number;
}

const SyncStatusBadgeComponent = ({ status, pendingCount }: SyncStatusBadgeProps) => {
  if (status === 'synced') return null;

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
      {status === 'offline' && (
        <>
          <WifiOff className="w-3 h-3 text-destructive" />
          <span className="text-muted-foreground">{pendingCount} offline</span>
        </>
      )}
    </div>
  );
};

export const SyncStatusBadge = memo(SyncStatusBadgeComponent);
