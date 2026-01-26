import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

interface HelloLog {
  id: string;
  name: string | null;
  notes: string | null;
  hello_type: string | null;
  created_at: string;
}

interface HelloOfTheDayProps {
  logs: HelloLog[];
}

export const HelloOfTheDay = ({ logs }: HelloOfTheDayProps) => {
  const helloOfTheDay = useMemo(() => {
    // Filter logs with both name AND notes
    const logsWithNameAndNotes = logs.filter(log => 
      log.name && log.name.trim() && log.notes && log.notes.trim()
    );
    
    if (logsWithNameAndNotes.length === 0) return null;
    
    // Use today's date as seed for "random" but consistent selection per day
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % logsWithNameAndNotes.length;
    return logsWithNameAndNotes[index];
  }, [logs]);

  if (!helloOfTheDay) return null;

  return (
    <Card className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800/30">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-5 h-5 text-amber-500" />
        <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Memory of the Day</span>
      </div>
      <div className="pl-7">
        <p className="font-medium text-foreground">{helloOfTheDay.name}</p>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          "{helloOfTheDay.notes}"
        </p>
      </div>
    </Card>
  );
};
