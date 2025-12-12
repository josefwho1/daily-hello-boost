import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, SmilePlus, Meh, Frown, Sparkles, Trophy, MessageCircle, Calendar } from "lucide-react";
import { useHelloLogs } from "@/hooks/useHelloLogs";
import { useTimezone } from "@/hooks/useTimezone";
import remiMascot from "@/assets/remi-waving.webp";

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
  const { logs, loading } = useHelloLogs();
  const { formatTimestamp } = useTimezone();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logs based on search query (includes day of week in timestamp)
  const filteredLogs = logs.filter(log => {
    const query = searchQuery.toLowerCase();
    const nameMatch = log.name?.toLowerCase().includes(query);
    const notesMatch = log.notes?.toLowerCase().includes(query);
    const dateMatch = formatTimestamp(log.created_at, true).toLowerCase().includes(query);
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

  // Get difficulty label
  const getDifficultyLabel = (difficultyRating: number | null) => {
    switch (difficultyRating) {
      case 1: return { label: "Easy", emoji: "😌" };
      case 2: return { label: "Just right", emoji: "👍" };
      case 3: return { label: "Hard", emoji: "💪" };
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
            placeholder="Search by name, notes or date..."
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
            {filteredLogs.map((log) => {
              const typeDisplay = getTypeDisplay(log.hello_type);
              const difficultyInfo = getDifficultyLabel(log.difficulty_rating);
              
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
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground truncate">
                            {log.name || "Hello"}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(log.created_at, true)}
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

                      {/* Difficulty */}
                      {difficultyInfo && (
                        <div className="mt-2">
                          <span className="text-xs bg-secondary/50 text-secondary-foreground px-2 py-0.5 rounded-full border border-secondary">
                            {difficultyInfo.emoji} {difficultyInfo.label}
                          </span>
                        </div>
                      )}
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
      </div>
    </div>
  );
};

export default Hellobook;
