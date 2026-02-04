import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ClampedNotesProps {
  text: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  lines?: number;
  className?: string;
  buttonClassName?: string;
}

/**
 * Notes text that is clamped to N lines by default.
 * If the content exceeds N lines, shows a bottom-right chevron to expand/collapse.
 * When expanded, the text scrolls within the current container height (so parent card size can stay fixed).
 */
export function ClampedNotes({
  text,
  expanded,
  onExpandedChange,
  lines = 2,
  className,
  buttonClassName,
}: ClampedNotesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLParagraphElement | null>(null);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const measureEl = measureRef.current;
    if (!container || !measureEl) return;

    const compute = () => {
      // Ensure the measurement element matches the container width.
      // (It is absolutely positioned and invisible; this only affects its layout width.)
      measureEl.style.width = `${container.clientWidth}px`;

      const styles = window.getComputedStyle(measureEl);
      const lineHeightRaw = styles.lineHeight;
      const lineHeight = Number.isFinite(parseFloat(lineHeightRaw)) ? parseFloat(lineHeightRaw) : 0;
      if (!lineHeight) {
        // Fallback: be permissive (show toggle) rather than hiding it incorrectly.
        setCanExpand(text.length > 0);
        return;
      }

      const maxHeight = lineHeight * lines;
      // scrollHeight is the full content height for the un-clamped measurement element.
      setCanExpand(measureEl.scrollHeight > maxHeight + 1);
    };

    // Initial compute after layout.
    const raf = window.requestAnimationFrame(compute);

    const ro = new ResizeObserver(() => compute());
    ro.observe(container);

    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [text, lines]);

  if (!text) return null;

  return (
    <div ref={containerRef} className={cn("relative h-full", className)}>
      <p
        className={cn(
          "text-sm text-muted-foreground whitespace-pre-wrap",
          expanded ? "h-full overflow-auto pr-10" : `line-clamp-${lines} pr-10`,
        )}
      >
        {text}
      </p>

      {/* Hidden measurement element (unclamped) */}
      <p
        ref={measureRef}
        className="absolute left-0 top-0 opacity-0 pointer-events-none -z-10 text-sm text-muted-foreground whitespace-pre-wrap"
        aria-hidden="true"
      >
        {text}
      </p>

      {canExpand && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onExpandedChange(!expanded);
          }}
          className={cn(
            "absolute bottom-0 right-0 h-9 w-9 p-0 text-muted-foreground hover:text-foreground",
            buttonClassName,
          )}
          aria-label={expanded ? "Collapse notes" : "Expand notes"}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
}
