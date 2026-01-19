import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles, Trophy, Users, Calendar, TrendingUp, Star } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { normalizeTimezoneOffset } from "@/lib/timezone";

interface HelloLog {
  id: string;
  name: string | null;
  notes: string | null;
  hello_type: string | null;
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
    
    // Count by type
    const todaysHelloCount = logs.filter(log => log.hello_type === 'todays_hello').length;
    const remisWeeklyCount = logs.filter(log => log.hello_type === 'remis_challenge').length;
    
    // Most hellos in one day
    const offset = normalizeTimezoneOffset(timezoneOffset);
    const dayCountMap = new Map<string, number>();
    logs.forEach(log => {
      const dayKey = formatInTimeZone(new Date(log.created_at), offset, 'yyyy-MM-dd');
      dayCountMap.set(dayKey, (dayCountMap.get(dayKey) || 0) + 1);
    });
    const mostInOneDay = Math.max(0, ...Array.from(dayCountMap.values()));
    
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
      todaysHelloCount,
      remisWeeklyCount,
      mostInOneDay,
      helloOfTheDay
    };
  }, [logs, timezoneOffset]);

  if (logs.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Hellos */}
        <Card className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Hellos</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalHellos}</p>
        </Card>
        
        {/* Names Remembered */}
        <Card className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-muted-foreground">Names Remembered</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.namesRemembered}</p>
        </Card>
        
        {/* Today's Hello Count */}
        <Card className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Today's Hello</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.todaysHelloCount}</p>
        </Card>
        
        {/* Remi's Weekly Count */}
        <Card className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-muted-foreground">Weekly Challenges</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.remisWeeklyCount}</p>
        </Card>
      </div>
      
      {/* Most in One Day */}
      <Card className="p-4 rounded-2xl border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Most hellos in one day</span>
          </div>
          <span className="text-xl font-bold text-foreground">{stats.mostInOneDay}</span>
        </div>
      </Card>
      
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
