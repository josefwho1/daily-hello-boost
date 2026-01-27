import { Card } from "@/components/ui/card";
import { User, MapPin } from "lucide-react";
import { HelloLog } from "@/hooks/useHelloLogs";
import { formatDistanceToNow } from "date-fns";

interface RecentHellosSectionProps {
  logs: HelloLog[];
  onViewAll?: () => void;
  onViewLog?: (log: HelloLog) => void;
}

export const RecentHellosSection = ({ logs, onViewAll, onViewLog }: RecentHellosSectionProps) => {
  // Only show logs that have names (meaningful connections)
  const namedLogs = logs.filter(log => log.name && log.name.trim() !== '');
  
  // Take last 3 entries
  const recentLogs = namedLogs.slice(0, 3);

  if (recentLogs.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
          <User className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground">
          Your saved connections will appear here
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-foreground">Recent Hellos</h2>
        {namedLogs.length > 3 && onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-xs text-primary hover:underline"
          >
            View all
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {recentLogs.map((log) => {
          const timeAgo = formatDistanceToNow(new Date(log.created_at), { addSuffix: true });
          
          return (
            <Card 
              key={log.id} 
              className="p-3 border-border/30 bg-card/50 hover:bg-card/80 transition-colors cursor-pointer"
              onClick={() => onViewLog?.(log)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  {/* First row: Name + Location */}
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {log.name}
                    </p>
                    {log.location && (
                      <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                        <MapPin className="w-3 h-3" />
                        <span className="text-sm truncate max-w-[120px]">{log.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Second row: Notes (truncated) */}
                  {log.notes && (
                    <p className="text-sm text-muted-foreground truncate">
                      {log.notes}
                    </p>
                  )}
                </div>
                
                {/* Time ago */}
                <span className="text-xs text-muted-foreground/70 shrink-0 whitespace-nowrap">
                  {timeAgo}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
