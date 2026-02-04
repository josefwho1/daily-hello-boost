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

  /**
   * Optional callback so the parent can place its own toggle button.
   * Receives true only when the text exceeds the clamped line count.
   */
  onCanExpandChange?: (canExpand: boolean) => void;

  /** Whether to render the built-in toggle button (default: true). */
  showToggle?: boolean;

  /**
   * When expanded:
   * - "scroll": keep height and scroll within container (default)
   * - "grow": remove clamp and allow layout to grow naturally
   */
  expandedMode?: "scroll" | "grow";

  /** Where to anchor the built-in toggle button (default: bottom-right). */
  togglePosition?: "bottom-right" | "top-right";
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
  onCanExpandChange,
  showToggle = true,
  expandedMode = "scroll",
  togglePosition = "bottom-right",
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
        const next = text.length > 0;
        setCanExpand(next);
        onCanExpandChange?.(next);
        return;
      }

      const maxHeight = lineHeight * lines;
      // scrollHeight is the full content height for the un-clamped measurement element.
      const next = measureEl.scrollHeight > maxHeight + 1;
      setCanExpand(next);
      onCanExpandChange?.(next);
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

  // Tailwind can't statically detect `line-clamp-${lines}`. Keep this explicit.
  const clampClass = lines === 3 ? "line-clamp-3" : lines === 4 ? "line-clamp-4" : "line-clamp-2";

  const expandedClass =
    expandedMode === "grow" ? "pr-10" : "h-full overflow-auto pr-10";

  const toggleAnchorClass =
    togglePosition === "top-right" ? "top-0 right-0" : "bottom-0 right-0";

  return (
    <div ref={containerRef} className={cn("relative h-full", className)}>
      <p
        className={cn(
          "text-sm text-muted-foreground whitespace-pre-wrap",
          expanded ? expandedClass : `${clampClass} pr-10`,
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

      {showToggle && canExpand && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onExpandedChange(!expanded);
          }}
          className={cn(
            `absolute ${toggleAnchorClass} h-9 w-9 p-0 text-muted-foreground hover:text-foreground`,
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
