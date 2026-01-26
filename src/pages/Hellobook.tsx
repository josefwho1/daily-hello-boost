import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Pencil, ChevronDown, ChevronUp, Mail, MapPin } from "lucide-react";
import { useHelloLogs, HelloLog } from "@/hooks/useHelloLogs";
import { useTimezone } from "@/hooks/useTimezone";
import { useAuth } from "@/hooks/useAuth";
import { useGuestMode } from "@/hooks/useGuestMode";
import { toast } from "sonner";
import hellobookIcon from "@/assets/hellobook-icon.webp";
import vaultIcon from "@/assets/vault-icon.webp";
import EditHelloDialog from "@/components/EditHelloDialog";
import { SaveProgressDialog } from "@/components/SaveProgressDialog";


// Expandable text component for long notes
const ExpandableText = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const needsExpansion = text.length > 80;

  if (!needsExpansion) {
    return <p className="text-sm text-muted-foreground mt-2">{text}</p>;
  }

  return (
    <div className="mt-2">
      <p className={`text-sm text-muted-foreground ${!isExpanded ? 'line-clamp-2' : ''}`}>
        {text}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
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

// Filter out challenge-related entries - only show regular hellos
const isRegularHello = (helloType: string | null) => {
  // Exclude Today's Hello and Weekly Challenge completions
  const excludedTypes = ['todays_hello', 'remis_challenge'];
  return !helloType || !excludedTypes.includes(helloType);
};

const Hellobook = () => {
  const navigate = useNavigate();
  const { logs, loading, updateLog } = useHelloLogs();
  const { formatTimestamp, timezoneOffset } = useTimezone();
  const { user } = useAuth();
  const { isGuest, isAnonymous } = useGuestMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingLog, setEditingLog] = useState<HelloLog | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const showGuestPrompt = isAnonymous && logs.length > 0;
  
  const handleEditClick = (log: HelloLog) => {
    setEditingLog(log);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (id: string, updates: {
    name?: string | null;
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

  // Filter out challenge completions and apply search
  const filteredLogs = logs
    .filter(log => isRegularHello(log.hello_type))
    .filter(log => {
      const query = searchQuery.toLowerCase();
      const nameMatch = log.name?.toLowerCase().includes(query);
      const notesMatch = log.notes?.toLowerCase().includes(query);
      const locationMatch = log.location?.toLowerCase().includes(query);
      const dateMatch = formatTimestamp(log.created_at, true).toLowerCase().includes(query);
      return nameMatch || notesMatch || locationMatch || dateMatch || !query;
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

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <img src={hellobookIcon} alt="Hellobook" className="w-10 h-auto max-h-10 object-contain" />
          <h1 className="text-2xl font-bold text-foreground">Hellobook</h1>
        </div>

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
        {filteredLogs.length === 0 ? (
          <Card className="p-8 text-center rounded-2xl">
            <img src={hellobookIcon} alt="Hellobook" className="w-16 h-auto max-h-16 mx-auto mb-4 opacity-50 object-contain" />
            <p className="text-muted-foreground">
              {searchQuery ? "No hellos match your search." : "No hellos logged yet. Start saying hello!"}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              // Determine thumbnail: ? for no name, 👤 for named entries
              const hasName = log.name && log.name.trim() !== "";
              const thumbnail = hasName ? "👤" : "❓";
              
              return (
                <Card 
                  key={log.id} 
                  className="p-4 rounded-2xl hover:shadow-md transition-shadow duration-200 animate-fade-in"
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-xl border bg-muted border-border flex items-center justify-center flex-shrink-0 text-2xl">
                      {thumbnail}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Top row: Name and Edit button */}
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {log.name || "Unknown"}
                        </h3>

                        {/* Edit button - pushed to right */}
                        <button
                          onClick={() => handleEditClick(log)}
                          className="ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
                          aria-label="Edit hello"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Location */}
                      {log.location && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{log.location}</span>
                        </div>
                      )}

                      {/* Timestamp */}
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {formatTimestamp(log.created_at, true)}
                      </p>

                      {/* Notes */}
                      {log.notes && <ExpandableText text={log.notes} />}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats footer */}
        {filteredLogs.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>📖 {filteredLogs.length} hello{filteredLogs.length !== 1 ? 's' : ''} in your book</p>
          </div>
        )}

        {/* Vault Easter Egg */}
        <div className="mt-4 mb-2 flex justify-center">
          <button
            onClick={() => navigate('/vault')}
            className="opacity-40 hover:opacity-100 transition-opacity duration-300"
            aria-label="Open Remi's Vault"
          >
            <img 
              src={vaultIcon} 
              alt="Vault" 
              className="w-10 h-10 object-contain"
            />
          </button>
        </div>
      </div>

      <EditHelloDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        log={editingLog}
        onSave={handleSaveEdit}
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
