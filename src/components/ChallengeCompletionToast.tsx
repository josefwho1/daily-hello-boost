import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast as sonnerToast } from "sonner";

type Props = {
  id: string | number;
  challengeNumber: number;
  challengeName: string;
  onUndo: () => Promise<void> | void;
  onAddDetails: () => void;
  onUndoExpired: () => void;
};

const UNDO_WINDOW_MS = 5000;

export function ChallengeCompletionToast({
  id,
  challengeNumber,
  challengeName,
  onUndo,
  onAddDetails,
  onUndoExpired,
}: Props) {
  const [showUndo, setShowUndo] = React.useState(true);
  const [countdown, setCountdown] = React.useState(5);
  const runningRef = React.useRef(false);
  const expiredRef = React.useRef(false);

  React.useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // After 5 seconds, hide undo, trigger entry creation, and dismiss toast
    const undoTimer = setTimeout(() => {
      setShowUndo(false);
      if (!expiredRef.current) {
        expiredRef.current = true;
        onUndoExpired();
      }
      // Auto-dismiss the toast when undo window expires
      sonnerToast.dismiss(id);
    }, UNDO_WINDOW_MS);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(undoTimer);
    };
  }, [onUndoExpired]);

  const handleUndo = React.useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (runningRef.current || !showUndo) return;
      runningRef.current = true;

      try {
        await onUndo();
      } catch (error) {
        console.error("Failed to undo:", error);
      } finally {
        runningRef.current = false;
      }
    },
    [onUndo, showUndo]
  );

  const handleAddDetails = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // If undo hasn't expired yet, this will also trigger the hello creation
      if (!expiredRef.current) {
        expiredRef.current = true;
        onUndoExpired();
      }
      onAddDetails();
    },
    [onAddDetails, onUndoExpired]
  );

  return (
    <div
      className="w-full rounded-lg border border-border bg-background p-4 shadow-lg"
      style={{ touchAction: "manipulation" }}
    >
      <div className="flex items-start gap-3">
        <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">
            Challenge {challengeNumber} complete! 🦝
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        {/* Undo button - small, subtle */}
        {showUndo && (
          <button
            type="button"
            onClick={handleUndo}
            className="text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors px-2 py-1"
            aria-label={`Undo completion for ${challengeName}`}
          >
            Undo ({countdown}s)
          </button>
        )}

        {/* Add Details button - large, prominent */}
        <Button
          size="sm"
          onClick={handleAddDetails}
          className={cn(
            "ml-auto rounded-full font-semibold min-w-[100px]",
            "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          Add Details
        </Button>
      </div>
    </div>
  );
}
