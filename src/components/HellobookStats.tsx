import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Users, Calendar, Star } from "lucide-react";

interface HelloLog {
  id: string;
  name: string | null;
  notes: string | null;
  location?: string | null;
  created_at: string;
  timezone_offset?: string | null;
}

interface HellobookStatsProps {
  logs: HelloLog[];
  timezoneOffset: string;
}

export const HellobookStats = ({ logs, timezoneOffset }: HellobookStatsProps) => {
  const stats = useMemo(() => {
    // Total hellos
    const totalHellos = logs.length;
    
    // Unique names remembered (non-empty names)
    const namesSet = new Set<string>();
    logs.forEach(log => {
      if (log.name && log.name.trim()) {
        namesSet.add(log.name.trim().toLowerCase());
      }
    });
    const namesRemembered = namesSet.size;
    
    // Hello of the Day - random log with both name AND notes
    const logsWithNameAndNotes = logs.filter(log => 
      log.name && log.name.trim() && log.notes && log.notes.trim()
    );
    let helloOfTheDay: HelloLog | null = null;
    if (logsWithNameAndNotes.length > 0) {
      // Use today's date as seed for "random" but consistent selection per day
      const today = new Date();
      const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
      const index = seed % logsWithNameAndNotes.length;
      helloOfTheDay = logsWithNameAndNotes[index];
    }
    
    return {
      totalHellos,
      namesRemembered,
      helloOfTheDay
    };
  }, [logs, timezoneOffset]);

  if (logs.length === 0) return null;

  return (
    <div className="space-y-3 mb-4">
      {/* Compact Stats Row */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-2 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex flex-col items-center text-center">
            <Calendar className="w-3.5 h-3.5 text-primary mb-0.5" />
            <p className="text-lg font-bold text-foreground leading-none">{stats.totalHellos}</p>
            <span className="text-[10px] text-muted-foreground">Hellos</span>
          </div>
        </Card>
        
        <Card className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <div className="flex flex-col items-center text-center">
            <Users className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
            <p className="text-lg font-bold text-foreground leading-none">{stats.namesRemembered}</p>
            <span className="text-[10px] text-muted-foreground">Names</span>
          </div>
        </Card>
      </div>
      
      {/* Hello of the Day */}
      {stats.helloOfTheDay && (
        <Card className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800/30">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Hello of the Day</span>
          </div>
          <div className="pl-7">
            <p className="font-medium text-foreground">{stats.helloOfTheDay.name}</p>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              "{stats.helloOfTheDay.notes}"
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
