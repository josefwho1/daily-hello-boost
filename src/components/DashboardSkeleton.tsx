import { Skeleton } from "@/components/ui/skeleton";
import remiWaving4 from "@/assets/remi-waving-4.webp";

/**
 * Skeleton placeholder that mirrors the Dashboard layout.
 * Renders instantly (no data needed) so users see structure instead of a spinner.
 */
export const DashboardSkeleton = () => (
  <div className="bg-background page-container">
    <div className="max-w-md mx-auto px-4 pt-8 pb-2">
      {/* Header with Remi - show real image (preloaded) */}
      <div className="text-center mb-6">
        <img
          src={remiWaving4}
          alt="Remi"
          className="w-16 h-16 mx-auto mb-2 object-contain"
        />
        <Skeleton className="h-8 w-40 mx-auto" />
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
        <div className="rounded-2xl bg-card border border-border/40 p-4">
          <Skeleton className="h-4 w-32 mb-3" />
          <Skeleton className="h-2 w-full rounded-full mb-4" />
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
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
