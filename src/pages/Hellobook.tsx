import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mail, Globe, Bookmark } from "lucide-react";
import { useHelloLogs, HelloLog } from "@/hooks/useHelloLogs";
import { useTimezone } from "@/hooks/useTimezone";
import { useGuestMode } from "@/hooks/useGuestMode";
import { toast } from "sonner";
import hellobookIcon from "@/assets/hellobook-icon.webp";
import remiLogging6 from "@/assets/remi-logging-6.webp";
import ViewHelloDialog from "@/components/ViewHelloDialog";
import { SaveProgressDialog } from "@/components/SaveProgressDialog";
import HellobookPersonCard from "@/components/HellobookPersonCard";
import Community from "@/pages/Community";
import { HelloOfTheDay } from "@/components/HelloOfTheDay";

type FilterType = 'all' | 'names' | 'unknown' | 'favorites';
type ViewType = 'mybook' | 'global';

// Group logs by person - entries linked together are grouped
interface GroupedPerson {
  primaryLog: HelloLog;
  linkedLogs: HelloLog[];
}

// Shared toggle component
const ViewToggle = ({ 
  activeView, 
  setActiveView 
}: { 
  activeView: ViewType; 
  setActiveView: (view: ViewType) => void;
}) => (
  <div className="flex gap-2 mb-4">
    <button
      onClick={() => setActiveView('mybook')}
      className={`flex-1 py-2.5 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-2 ${
        activeView === 'mybook'
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
      }`}
    >
      <span className="text-sm font-medium">My Book</span>
    </button>
    <button
      onClick={() => setActiveView('global')}
      className={`flex-1 py-2.5 px-4 rounded-xl text-center transition-all flex items-center justify-center gap-2 ${
        activeView === 'global'
          ? 'bg-primary text-primary-foreground shadow-md'
          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
      }`}
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">Global</span>
    </button>
  </div>
);

const Hellobook = () => {
  const navigate = useNavigate();
  const { logs, loading, updateLog, deleteLog, toggleFavorite } = useHelloLogs();
  const { formatTimestamp } = useTimezone();
  const { isAnonymous } = useGuestMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingLog, setEditingLog] = useState<HelloLog | null>(null);
  const [editingLogIndex, setEditingLogIndex] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeView, setActiveView] = useState<ViewType>('mybook');

  const showGuestPrompt = isAnonymous;
  
  // Group logs by person - entries with same linked_to or that are linked to each other
  const groupedPeople = useMemo(() => {
    const groups: Map<string, GroupedPerson> = new Map();
    const processedIds = new Set<string>();

    // First pass: identify primary logs (ones that others link to, or standalone)
    logs.forEach(log => {
      if (processedIds.has(log.id)) return;

      // If this log is linked to another, skip it for now (it will be added as a linked log)
      if (log.linked_to) return;

      // Find all logs that link to this one
      const linkedLogs = logs.filter(l => l.linked_to === log.id);
      
      groups.set(log.id, {
        primaryLog: log,
        linkedLogs: linkedLogs
      });

      processedIds.add(log.id);
      linkedLogs.forEach(l => processedIds.add(l.id));
    });

    // Second pass: handle logs that are linked but their parent wasn't found
    // (edge case - treat them as standalone)
    logs.forEach(log => {
      if (processedIds.has(log.id)) return;
      
      groups.set(log.id, {
        primaryLog: log,
        linkedLogs: []
      });
      processedIds.add(log.id);
    });

    // Sort groups by most recent interaction (primary or linked)
    return Array.from(groups.values()).sort((a, b) => {
      const aLatest = Math.max(
        new Date(a.primaryLog.created_at).getTime(),
        ...a.linkedLogs.map((l) => new Date(l.created_at).getTime())
      );
      const bLatest = Math.max(
        new Date(b.primaryLog.created_at).getTime(),
        ...b.linkedLogs.map((l) => new Date(l.created_at).getTime())
      );
      return bLatest - aLatest;
    });
  }, [logs]);

  // Calculate stats for the toggle bar
  const stats = useMemo(() => {
    const withNames = groupedPeople.filter(g => g.primaryLog.name && g.primaryLog.name.trim() !== "");
    const withoutNames = groupedPeople.filter(g => !g.primaryLog.name || g.primaryLog.name.trim() === "");
    const favorites = groupedPeople.filter(g => g.primaryLog.is_favorite);
    return {
      all: groupedPeople.length,
      names: withNames.length,
      unknown: withoutNames.length,
      favorites: favorites.length
    };
  }, [groupedPeople]);
  
  // Flatten all logs for navigation (sorted by date, newest first)
  const allLogsFlat = useMemo(() => {
    return [...logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [logs]);

  const handleViewClick = (log: HelloLog) => {
    const index = allLogsFlat.findIndex(l => l.id === log.id);
    setEditingLog(log);
    setEditingLogIndex(index >= 0 ? index : 0);
    setIsEditDialogOpen(true);
  };

  const handleNavigate = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < allLogsFlat.length) {
      setEditingLog(allLogsFlat[newIndex]);
      setEditingLogIndex(newIndex);
    }
  };

  const handleSaveEdit = async (id: string, updates: {
    name?: string | null;
    location?: string | null;
    notes?: string | null;
    rating?: 'positive' | 'neutral' | 'negative' | null;
    difficulty_rating?: number | null;
  }) => {
    const result = await updateLog(id, updates);
    if (result) {
      toast.success("Hello updated!");
    } else {
      toast.error("Failed to update hello");
    }
    return result;
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await deleteLog(id);
      toast.success("Hello deleted");
    } catch {
      toast.error("Failed to delete hello");
    }
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    const result = await toggleFavorite(id, isFavorite);
    if (result) {
      toast.success(isFavorite ? "Added to favorites" : "Removed from favorites");
    }
  };

  // Apply toggle filter and search - all hellos are shown
  const filteredPeople = groupedPeople
    .filter(group => {
      if (activeFilter === 'names') {
        return group.primaryLog.name && group.primaryLog.name.trim() !== "";
      }
      if (activeFilter === 'unknown') {
        return !group.primaryLog.name || group.primaryLog.name.trim() === "";
      }
      if (activeFilter === 'favorites') {
        return group.primaryLog.is_favorite;
      }
      return true;
    })
    .filter(group => {
      const query = searchQuery.toLowerCase();
      if (!query) return true;
      
      // Search in primary log
      const nameMatch = group.primaryLog.name?.toLowerCase().includes(query);
      const notesMatch = group.primaryLog.notes?.toLowerCase().includes(query);
      const locationMatch = group.primaryLog.location?.toLowerCase().includes(query);
      const dateMatch = formatTimestamp(group.primaryLog.created_at, true).toLowerCase().includes(query);
      
      // Also search in linked logs
      const linkedMatch = group.linkedLogs.some(log => 
        log.notes?.toLowerCase().includes(query) ||
        log.location?.toLowerCase().includes(query) ||
        formatTimestamp(log.created_at, true).toLowerCase().includes(query)
      );
      
      return nameMatch || notesMatch || locationMatch || dateMatch || linkedMatch;
    });

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

  // If viewing global, render Community page content
  if (activeView === 'global') {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto px-4 py-6">
          {/* Header with toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src={hellobookIcon} alt="Hellobook" className="w-10 h-auto max-h-10 object-contain" />
              <h1 className="text-2xl font-bold text-foreground">Hellobook</h1>
            </div>
          <img src={remiLogging6} alt="Remi" className="w-10 h-10 object-contain" />
          </div>

          {/* View Toggle */}
          <ViewToggle activeView={activeView} setActiveView={setActiveView} />

          {/* Community Content */}
          <Community embedded />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <img src={hellobookIcon} alt="Hellobook" className="w-10 h-auto max-h-10 object-contain" />
          <h1 className="text-2xl font-bold text-foreground">Hellobook</h1>
        </div>

        {/* View Toggle */}
        <ViewToggle activeView={activeView} setActiveView={setActiveView} />

        {/* Guest save prompt - at the top */}
        {showGuestPrompt && (
          <Card className="mb-6 p-4 rounded-2xl border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Save your progress</p>
                <p className="text-xs text-muted-foreground">Add your email to keep your hellos safe</p>
              </div>
              <Button
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                className="rounded-xl"
              >
                Save
              </Button>
            </div>
          </Card>
        )}

        {/* Memory Section */}
        <div className="mb-6">
          <HelloOfTheDay 
            logs={logs} 
            onViewLog={handleViewClick}
          />
        </div>

        {/* Toggle Stats Bar */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 py-3 px-2 rounded-xl text-center transition-all ${
              activeFilter === 'all'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <div className="text-xl font-bold">{stats.all}</div>
            <div className="text-xs">All</div>
          </button>
          <button
            onClick={() => setActiveFilter('names')}
            className={`flex-1 py-3 px-2 rounded-xl text-center transition-all ${
              activeFilter === 'names'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <div className="text-xl font-bold">{stats.names}</div>
            <div className="text-xs">Names</div>
          </button>
          <button
            onClick={() => setActiveFilter('unknown')}
            className={`flex-1 py-3 px-2 rounded-xl text-center transition-all ${
              activeFilter === 'unknown'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <div className="text-xl font-bold">{stats.unknown}</div>
            <div className="text-xs">Unknown</div>
          </button>
          <button
            onClick={() => setActiveFilter('favorites')}
            className={`flex-1 py-3 px-2 rounded-xl text-center transition-all ${
              activeFilter === 'favorites'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            <div className="text-xl font-bold flex items-center justify-center gap-1">
              <Bookmark className="w-4 h-4" />
              {stats.favorites}
            </div>
            <div className="text-xs">Favorites</div>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search by name, location, notes or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border rounded-xl"
          />
        </div>

        {/* Logs */}
        {filteredPeople.length === 0 ? (
          <Card className="p-8 text-center rounded-2xl">
            <img src={hellobookIcon} alt="Hellobook" className="w-16 h-auto max-h-16 mx-auto mb-4 opacity-50 object-contain" />
            <p className="text-muted-foreground">
              {searchQuery ? "No hellos match your search." : "No hellos logged yet. Start saying hello!"}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredPeople.map((group) => (
              <HellobookPersonCard
                key={group.primaryLog.id}
                primaryLog={group.primaryLog}
                linkedLogs={group.linkedLogs}
                formatTimestamp={formatTimestamp}
                onViewClick={handleViewClick}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}

        {/* Stats footer */}
        {filteredPeople.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>📖 {stats.names} name{stats.names !== 1 ? 's' : ''} remembered · {logs.length} total hello{logs.length !== 1 ? 's' : ''}</p>
          </div>
        )}

      </div>

      <ViewHelloDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        log={editingLog}
        logs={allLogsFlat}
        currentIndex={editingLogIndex}
        onNavigate={handleNavigate}
        onSave={handleSaveEdit}
        onDelete={handleDeleteLog}
        onToggleFavorite={handleToggleFavorite}
      />

      <SaveProgressDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onDismiss={() => setShowSaveDialog(false)}
      />
    </div>
  );
};

export default Hellobook;
