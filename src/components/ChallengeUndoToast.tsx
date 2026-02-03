import * as React from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

type Props = {
  id: string | number;
  challengeName: string;
  onUndo: () => Promise<void> | void;
};

export function ChallengeUndoToast({ id, challengeName, onUndo }: Props) {
  const runningRef = React.useRef(false);

  const runUndo = React.useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;

    try {
      await onUndo();
      toast.dismiss(id);
    } catch (error) {
      console.error("Failed to undo:", error);
      toast.error("Could not undo. Please try again.");
    } finally {
      runningRef.current = false;
    }
  }, [id, onUndo]);

  return (
    <button
      type="button"
      className="w-full cursor-pointer select-none rounded-lg border border-border bg-background p-4 text-left shadow-lg"
      style={{ touchAction: "manipulation" }}
      onPointerDownCapture={(e) => {
        // Sonner listens for pointer gestures to enable swipe-to-dismiss.
        // If Sonner receives the pointer start but not the end (because we stop propagation),
        // it can effectively pause the auto-dismiss timer.
        // Capture + stop propagation prevents Sonner from treating this toast as an active gesture.
        e.preventDefault();
        e.stopPropagation();
      }}
      onPointerUpCapture={(e) => {
        // Tap anywhere on the banner to undo.
        e.preventDefault();
        e.stopPropagation();
        void runUndo();
      }}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        void runUndo();
      }}
      aria-label={`Undo completion for ${challengeName}`}
    >
      <div className="flex items-start gap-3">
        <Check className="h-5 w-5 text-success mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">"{challengeName}" Completed!</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Tap to undo</p>
        </div>
      </div>
    </button>
  );
}
