import { Card } from "@/components/ui/card";
import { User, MapPin, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface HelloLog {
  id: string;
  name: string | null;
  notes: string | null;
  created_at: string;
}

interface RecentHellosSectionProps {
  logs: HelloLog[];
  onViewAll?: () => void;
}

export const RecentHellosSection = ({ logs, onViewAll }: RecentHellosSectionProps) => {
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
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
        {recentLogs.map((log) => (
          <Card 
            key={log.id} 
            className="p-3 border-border/30 bg-card/50 hover:bg-card/80 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {log.name}
                </p>
                {log.notes && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                    <p className="text-sm text-muted-foreground truncate">
                      {log.notes}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Clock className="w-3 h-3" />
                <span>
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
