import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { HelloLog } from "@/hooks/useHelloLogs";

interface HellobookPersonCardProps {
  primaryLog: HelloLog;
  linkedLogs: HelloLog[];
  formatTimestamp: (timestamp: string, includeTime?: boolean) => string;
  onEditClick: (log: HelloLog) => void;
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
  onEditClick 
}: HellobookPersonCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasName = primaryLog.name && primaryLog.name.trim() !== "";
  const allInteractions = [primaryLog, ...linkedLogs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const interactionCount = allInteractions.length;
  const hasMultipleInteractions = interactionCount > 1;

  // For the card header, show the most recent interaction's details
  const mostRecent = allInteractions[0];

  return (
    <Card 
      className={`p-4 rounded-2xl hover:shadow-md transition-all duration-200 animate-fade-in cursor-pointer active:scale-[0.98] ${
        !hasName ? 'opacity-75' : ''
      }`}
      onClick={() => onEditClick(primaryLog)}
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
  );
};

export default HellobookPersonCard;
