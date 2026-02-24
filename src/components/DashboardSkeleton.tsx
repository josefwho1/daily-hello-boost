import { Skeleton } from "@/components/ui/skeleton";
import remiWaving4 from "@/assets/remi-waving-4.webp";
import { getCachedProgress } from "@/lib/offlineCache";

/**
 * Skeleton placeholder that mirrors the Dashboard layout.
 * Shows cached username if available, otherwise a skeleton placeholder.
 */
export const DashboardSkeleton = () => {
  const cached = getCachedProgress<Record<string, unknown>>();
  const cachedUsername = (cached?.username as string) || null;

  return (
    <div className="bg-background page-container">
      <div className="max-w-md mx-auto px-4 pt-8 pb-2">
        {/* Header with Remi - show real image (preloaded) */}
        <div className="text-center mb-6">
          <img
            src={remiWaving4}
            alt="Remi"
            className="w-16 h-16 mx-auto mb-2 object-contain"
          />
          {cachedUsername ? (
            <h1 className="text-2xl font-bold text-foreground tracking-wide" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <span className="text-primary">Hello</span> {cachedUsername}
            </h1>
          ) : (
            <Skeleton className="h-8 w-40 mx-auto" />
          )}
        </div>

        {/* Stats bar skeleton */}
        <div className="grid grid-cols-[1fr_1px_1fr_1px_1fr] items-center rounded-2xl bg-card border border-border/40 shadow-sm px-2 py-3 mb-6">
          <div className="flex items-center justify-center gap-2.5">
            <Skeleton className="w-9 h-9 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="h-8 bg-border/40" />
          <div className="flex items-center justify-center">
            <Skeleton className="h-5 w-8" />
          </div>
          <div className="h-8 bg-border/40" />
          <div className="flex items-center justify-center gap-1.5">
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>

        {/* Challenge card skeleton */}
        <div className="space-y-4">
          <div className="rounded-xl bg-card border border-border/50 p-4 min-h-[260px] flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-2 w-full rounded-full mb-4" />
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="mt-auto flex gap-2">
              <Skeleton className="h-10 flex-1 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
          </div>

          {/* Log button skeleton */}
          <Skeleton className="h-14 w-full rounded-2xl" />

          {/* Quote skeleton */}
          <div className="mt-6">
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
};
