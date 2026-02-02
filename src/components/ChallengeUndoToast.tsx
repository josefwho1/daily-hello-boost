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
      className="w-full cursor-pointer select-none rounded-xl border border-border bg-background px-4 py-3 text-left shadow-lg"
      style={{ touchAction: "manipulation" }}
      onPointerUp={(e) => {
        // Prevent Sonner swipe-to-dismiss logic from eating the tap on mobile.
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
        <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success">
          <Check className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">"{challengeName}" Completed!</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Tap to undo</p>
        </div>
      </div>
    </button>
  );
}
