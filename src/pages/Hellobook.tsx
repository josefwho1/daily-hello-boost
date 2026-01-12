import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Trophy, MessageCircle, Calendar, Pencil, ChevronDown, ChevronUp, Mail } from "lucide-react";
import { useHelloLogs, HelloLog } from "@/hooks/useHelloLogs";
import { useTimezone } from "@/hooks/useTimezone";
import { useAuth } from "@/hooks/useAuth";
import { useGuestMode } from "@/hooks/useGuestMode";
import { toast } from "sonner";
import hellobookIcon from "@/assets/hellobook-icon.webp";
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

// Helper to check if it's a 7-day onboarding challenge type
const isOnboardingChallenge = (helloType: string | null) => {
  const onboardingTypes = [
    'First Hello', 'Well Wishes', 'Observation', 'Nice Shoes',
    'How Are You?', 'Name to the Face', 'Getting Personal', 'Weather Chat'
  ];
  return helloType && onboardingTypes.includes(helloType);
};

// Get icon and styling based on hello type
const getTypeDisplay = (helloType: string | null) => {
  if (helloType === 'todays_hello') {
    return {
      icon: <Sparkles className="w-5 h-5 text-primary" />,
      label: "Today's Hello",
      bgClass: "bg-primary/10 border-primary/20",
      textClass: "text-primary"
    };
  }
  if (helloType === 'remis_challenge') {
    return {
      icon: <Trophy className="w-5 h-5 text-amber-600" />,
      label: "Weekly Challenge",
      bgClass: "bg-amber-500/10 border-amber-500/20",
      textClass: "text-amber-600"
    };
  }
  if (isOnboardingChallenge(helloType)) {
    return {
      icon: <Calendar className="w-5 h-5 text-emerald-600" />,
      label: helloType,
      bgClass: "bg-emerald-500/10 border-emerald-500/20",
      textClass: "text-emerald-600"
    };
  }
  // Regular hello
  return {
    icon: <MessageCircle className="w-5 h-5 text-muted-foreground" />,
    label: "Regular Hello",
    bgClass: "bg-muted border-border",
    textClass: "text-muted-foreground"
  };
};

const Hellobook = () => {
  const { logs, loading, updateLog } = useHelloLogs();
  const { formatTimestamp } = useTimezone();
  const { user } = useAuth();
  const { isGuest } = useGuestMode();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingLog, setEditingLog] = useState<HelloLog | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const showGuestPrompt = isGuest && !user && logs.length > 0;
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

  // Filter logs based on search query (includes day of week in timestamp)
  const filteredLogs = logs.filter(log => {
    const query = searchQuery.toLowerCase();
    const nameMatch = log.name?.toLowerCase().includes(query);
    const notesMatch = log.notes?.toLowerCase().includes(query);
    const dateMatch = formatTimestamp(log.created_at, true).toLowerCase().includes(query);
    return nameMatch || notesMatch || dateMatch || !query;
  });

  // Get rating label with color classes
  const getRatingLabel = (rating: string | null) => {
    switch (rating) {
      case 'positive': return { label: "Positive", emoji: "😊", className: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30" };
      case 'neutral': return { label: "Neutral", emoji: "😐", className: "bg-gray-500/20 text-gray-600 border-gray-500/30" };
      case 'negative': return { label: "Negative", emoji: "😔", className: "bg-red-500/20 text-red-700 border-red-500/30" };
      default: return null;
    }
  };

  // Get difficulty label with color classes
  const getDifficultyLabel = (difficultyRating: number | null) => {
    switch (difficultyRating) {
      case 1: return { label: "Easy", emoji: "😌", className: "bg-gray-500/20 text-gray-600 border-gray-500/30" };
      case 2: return { label: "Just right", emoji: "👍", className: "bg-gray-500/20 text-gray-600 border-gray-500/30" };
      case 3: return { label: "Hard", emoji: "💪", className: "bg-gray-500/20 text-gray-600 border-gray-500/30" };
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
          <img src={hellobookIcon} alt="Hellobook" className="w-10 h-auto max-h-10 object-contain" />
          <h1 className="text-2xl font-bold text-foreground">Hellobook</h1>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search by name, notes or date..."
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
              const typeDisplay = getTypeDisplay(log.hello_type);
              const difficultyInfo = getDifficultyLabel(log.difficulty_rating);
              const ratingInfo = getRatingLabel(log.rating);
              
              return (
                <Card 
                  key={log.id} 
                  className="p-4 rounded-2xl hover:shadow-md transition-shadow duration-200 animate-fade-in"
                >
                  <div className="flex items-start gap-3">
                    {/* Type Icon */}
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${typeDisplay.bgClass}`}>
                      {typeDisplay.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Top row: Name, Tags, Edit button */}
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {log.name || "-"}
                        </h3>
                        
                        {/* Tags */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {ratingInfo && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${ratingInfo.className}`}>
                              {ratingInfo.emoji} {ratingInfo.label}
                            </span>
                          )}
                          {difficultyInfo && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${difficultyInfo.className}`}>
                              {difficultyInfo.emoji} {difficultyInfo.label}
                            </span>
                          )}
                        </div>

                        {/* Edit button - pushed to right */}
                        <button
                          onClick={() => handleEditClick(log)}
                          className="ml-auto p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
                          aria-label="Edit hello"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Timestamp */}
                      <p className="text-xs text-muted-foreground mt-0.5">
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
        {logs.length > 0 && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>📖 {logs.length} hello{logs.length !== 1 ? 's' : ''} in your book</p>
          </div>
        )}

        {/* Guest save prompt */}
        {showGuestPrompt && (
          <Card className="mt-6 p-4 rounded-2xl border-primary/20 bg-primary/5">
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
