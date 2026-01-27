import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, MapPin, Trash2 } from "lucide-react";
import { HelloLog } from "@/hooks/useHelloLogs";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";

interface HellobookPersonCardProps {
  primaryLog: HelloLog;
  linkedLogs: HelloLog[];
  formatTimestamp: (timestamp: string, includeTime?: boolean) => string;
  onViewClick: (log: HelloLog) => void;
  onDelete?: (id: string) => void;
}

// Expandable text component for long notes
const ExpandableText = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const needsExpansion = text.length > 80;

  if (!needsExpansion) {
    return <p className="text-sm text-muted-foreground">{text}</p>;
  }

  return (
    <div>
      <p className={`text-sm text-muted-foreground ${!isExpanded ? 'line-clamp-2' : ''}`}>
        {text}
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-1 transition-colors"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-3 h-3" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="w-3 h-3" />
            Read more
          </>
        )}
      </button>
    </div>
  );
};

const HellobookPersonCard = ({ 
  primaryLog, 
  linkedLogs, 
  formatTimestamp, 
  onViewClick,
  onDelete
}: HellobookPersonCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const hasName = primaryLog.name && primaryLog.name.trim() !== "";
  const allInteractions = [primaryLog, ...linkedLogs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const interactionCount = allInteractions.length;
  const hasMultipleInteractions = interactionCount > 1;

  // For the card header, show the most recent interaction's details
  const mostRecent = allInteractions[0];

  // Swipe gesture handling
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-100, -60], [1, 0]);
  const deleteScale = useTransform(x, [-100, -60], [1, 0.8]);
  const SWIPE_THRESHOLD = -80;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < SWIPE_THRESHOLD && onDelete) {
      setIsDeleting(true);
    }
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(primaryLog.id);
    }
    setIsDeleting(false);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(false);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete action background */}
      <motion.div 
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 bg-destructive rounded-2xl"
        style={{ opacity: deleteOpacity, scale: deleteScale }}
      >
        <Trash2 className="w-5 h-5 text-destructive-foreground" />
      </motion.div>

      {/* Confirmation overlay */}
      {isDeleting && (
        <div 
          className="absolute inset-0 z-10 flex items-center justify-center gap-3 bg-destructive/95 rounded-2xl px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-sm text-destructive-foreground font-medium">Delete?</span>
          <button
            onClick={handleConfirmDelete}
            className="px-4 py-2 bg-destructive-foreground text-destructive rounded-xl text-sm font-medium"
          >
            Yes
          </button>
          <button
            onClick={handleCancelDelete}
            className="px-4 py-2 bg-destructive-foreground/20 text-destructive-foreground rounded-xl text-sm font-medium"
          >
            No
          </button>
        </div>
      )}

      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        whileTap={{ cursor: "grabbing" }}
      >
        <Card 
          className={`p-4 rounded-2xl hover:shadow-md transition-all duration-200 animate-fade-in cursor-pointer active:scale-[0.98] ${
            !hasName ? 'opacity-75' : ''
          }`}
          onClick={() => !isDeleting && onViewClick(primaryLog)}
        >
      {hasMultipleInteractions ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {/* Top row: Name, interaction count, Location, and Edit button */}
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">
                  {primaryLog.name || "Unknown"}
                </h3>
                
                {/* Interaction count badge */}
                <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full flex-shrink-0">
                  {interactionCount} hellos
                </span>
                
                {/* Location - inline with name */}
                {mostRecent.location && (
                  <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                    <MapPin className="w-3 h-3" />
                    <span className="text-sm">{mostRecent.location}</span>
                  </div>
                )}

              </div>

              {/* Latest timestamp */}
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                Last seen: {formatTimestamp(mostRecent.created_at, false)}
              </p>

              {/* Latest notes preview */}
              {mostRecent.notes && (
                <div className="mt-2">
                  <ExpandableText text={mostRecent.notes} />
                </div>
              )}

              {/* Expand/Collapse trigger */}
              <CollapsibleTrigger asChild>
                <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-2 transition-colors">
                  {isOpen ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      Hide all interactions
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      View all {interactionCount} interactions
                    </>
                  )}
                </button>
              </CollapsibleTrigger>
            </div>
          </div>

          <CollapsibleContent className="mt-3">
            <div className="space-y-3 pt-3 border-t border-border">
              {allInteractions.map((interaction, index) => (
                <div 
                  key={interaction.id} 
                  className="pl-3 border-l-2 border-primary/20"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      {formatTimestamp(interaction.created_at, false)}
                    </p>
                    {interaction.location && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs">{interaction.location}</span>
                      </div>
                    )}
                    {index === 0 && (
                      <span className="text-xs text-primary font-medium">(Latest)</span>
                    )}
                  </div>
                  {interaction.notes && (
                    <p className="text-sm text-muted-foreground mt-1">{interaction.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        // Single interaction - simple card
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Top row: Name, Location, and Edit button */}
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {primaryLog.name || "Unknown"}
              </h3>
              
              {/* Location - inline with name */}
              {primaryLog.location && (
                <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                  <MapPin className="w-3 h-3" />
                  <span className="text-sm">{primaryLog.location}</span>
                </div>
              )}

              {/* Add Name badge for entries without names */}
              {!hasName && (
                <span className="ml-auto px-2 py-1 text-xs rounded-lg bg-primary/10 text-primary flex-shrink-0">
                  Tap to add name
                </span>
              )}
            </div>

            {/* Timestamp - date only */}
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              {formatTimestamp(primaryLog.created_at, false)}
            </p>

            {/* Notes */}
            {primaryLog.notes && (
              <div className="mt-2">
                <ExpandableText text={primaryLog.notes} />
              </div>
            )}
          </div>
        </div>
      )}
        </Card>
      </motion.div>
    </div>
  );
};

export default HellobookPersonCard;
