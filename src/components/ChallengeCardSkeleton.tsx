import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ChallengeCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Icon skeleton */}
          <Skeleton className="w-14 h-14 rounded-xl" />
          
          <div className="flex-1 space-y-2">
            {/* Title */}
            <Skeleton className="h-5 w-32" />
            {/* Progress bar */}
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>

        {/* Content area */}
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          {/* Button */}
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};
