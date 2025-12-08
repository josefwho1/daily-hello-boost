import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Hand, SmilePlus, Meh, Frown } from "lucide-react";
import { useHelloLogs } from "@/hooks/useHelloLogs";
import { useTimezone } from "@/hooks/useTimezone";
import remiMascot from "@/assets/remi-waving.webp";

const Hellobook = () => {
  const { logs, loading } = useHelloLogs();
  const { formatTimestamp } = useTimezone();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logs based on search query
  const filteredLogs = logs.filter(log => {
    const query = searchQuery.toLowerCase();
    const nameMatch = log.name?.toLowerCase().includes(query);
    const notesMatch = log.notes?.toLowerCase().includes(query);
    const dateMatch = formatTimestamp(log.created_at).toLowerCase().includes(query);
    return nameMatch || notesMatch || dateMatch || !query;
  });

  // Get Remi reaction emoji based on rating
  const getRemiEmoji = (rating: string | null) => {
    switch (rating) {
      case 'positive': return '🦝✨';
      case 'neutral': return '🦝👍';
      case 'negative': return '🦝💪';
      default: return '🦝';
    }
  };

  const getRatingIcon = (rating: string | null) => {
    switch (rating) {
      case 'positive': return <SmilePlus className="w-4 h-4 text-success" />;
      case 'neutral': return <Meh className="w-4 h-4 text-yellow-500" />;
      case 'negative': return <Frown className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your hellos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <img src={remiMascot} alt="Remi" className="w-10 h-auto max-h-10 object-contain" />
          <h1 className="text-2xl font-bold text-foreground">Your Hellobook</h1>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search by name or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border rounded-xl"
          />
        </div>

        {/* Logs */}
        {filteredLogs.length === 0 ? (
          <Card className="p-8 text-center rounded-2xl">
            <img src={remiMascot} alt="Remi" className="w-16 h-auto max-h-16 mx-auto mb-4 opacity-50 object-contain" />
            <p className="text-muted-foreground">
              {searchQuery ? "No hellos match your search." : "No hellos logged yet. Start saying hello!"}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <Card 
                key={log.id} 
                className="p-4 rounded-2xl hover:shadow-md transition-shadow duration-200 animate-fade-in"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Hand className="text-primary w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-foreground truncate">
                          {log.name || "Hello"}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(log.created_at)}
                        </p>
                      </div>
                      
                      {/* Remi reaction */}
                      <div className="flex items-center gap-1">
                        {getRatingIcon(log.rating)}
                        <span className="text-lg">{getRemiEmoji(log.rating)}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {log.notes && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {log.notes}
                      </p>
                    )}

                    {/* Type badge */}
                    {log.hello_type && log.hello_type !== 'Standard Hello' && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {log.hello_type}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Stats footer */}
        {logs.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>📖 {logs.length} hello{logs.length !== 1 ? 's' : ''} in your book</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hellobook;
