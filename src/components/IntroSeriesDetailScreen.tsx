import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type PackStatus = "not-started" | "active" | "paused" | "completed";

interface IntroSeriesDetailScreenProps {
  status: PackStatus;
  completedCount: number;
  totalCount: number;
  completionDate?: string | null;
  onBack: () => void;
  onBegin: () => void;
  onResume: () => void;
  onRestart: () => void;
  onPause: () => void;
}

export const IntroSeriesDetailScreen = ({
  status,
  completedCount,
  totalCount,
  completionDate,
  onBack,
  onBegin,
  onResume,
  onRestart,
  onPause,
}: IntroSeriesDetailScreenProps) => {
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isActive = status === "active";
  const isCompleted = status === "completed";
  const isPaused = status === "paused";
  const isNotStarted = status === "not-started";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xl">👋</span>
            <h1 className="text-xl font-bold text-foreground">One Hello Intro Series</h1>
          </div>
        </div>

        {/* Description Card - Moved to top */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h2 className="font-bold text-foreground mb-3">
              The Original One Hello 7-Day Challenge
            </h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                New to meeting strangers? Start here. This free 7-step series takes you from a simple smile and greeting all the way to exchanging names with someone new.
              </p>
              <p>
                No time limits. No pressure. Complete these at your own pace - all in one day or spread across a week. Each step builds on the last, gradually increasing your comfort with starting conversations.
              </p>
              <p>
                By the end, you'll have the confidence to turn any stranger into a potential friend.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status & Progress Card - Moved below description */}
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
                isActive && "bg-primary text-primary-foreground",
                isPaused && "bg-muted-foreground/20 text-muted-foreground",
                isCompleted && "bg-success/20 text-success",
                isNotStarted && "bg-muted text-muted-foreground"
              )}>
                {isCompleted && <Check className="w-3 h-3" />}
                {isActive ? "Active" : isPaused ? "Paused" : isCompleted ? "Completed" : "Not Started"}
              </span>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-medium text-foreground">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Completion date if completed */}
            {isCompleted && completionDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed on</span>
                <span className="text-sm font-medium text-success">
                  {format(new Date(completionDate), "MMM d, yyyy")}
                </span>
              </div>
            )}

            {/* Free badge */}
            <div className="pt-2">
              <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                Free
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isNotStarted && (
            <Button onClick={onBegin} className="w-full" size="lg">
              <Play className="w-4 h-4 mr-2" />
              Begin Challenge
            </Button>
          )}

          {isActive && (
            <>
              <Button onClick={onBack} className="w-full" size="lg">
                Continue Challenge
              </Button>
              <Button onClick={onPause} variant="outline" className="w-full" size="lg">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            </>
          )}

          {isPaused && (
            <>
              <Button onClick={onResume} className="w-full" size="lg">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
              <Button onClick={onRestart} variant="outline" className="w-full" size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>
            </>
          )}

          {isCompleted && (
            <>
              <Button onClick={onResume} className="w-full" size="lg">
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
              <Button onClick={onRestart} variant="outline" className="w-full" size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
