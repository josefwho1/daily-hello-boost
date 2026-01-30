import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Trophy, Hand, User, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SaveProgressDialog } from "@/components/SaveProgressDialog";

interface LeaderEntry {
  displayName: string;
  count: number;
  isGuest?: boolean;
}

interface CommunityStats {
  collectiveImpact: {
    totalHellos: number;
    totalNames: number;
    hellosThisMonth: number;
    hellosThisWeek: number;
    hellosToday: number;
  };
  leaderboards: {
    hellos: {
      allTime: LeaderEntry[];
      thisMonth: LeaderEntry[];
      thisWeek: LeaderEntry[];
      today: LeaderEntry[];
    };
    names: {
      allTime: LeaderEntry[];
      thisMonth: LeaderEntry[];
      thisWeek: LeaderEntry[];
      today: LeaderEntry[];
    };
    dailyStreak: LeaderEntry[];
  };
}

type TimeFilter = 'allTime' | 'thisMonth' | 'thisWeek' | 'today';
type LeaderboardType = 'hellos' | 'names';

interface CommunityProps {
  embedded?: boolean;
}

const Community = ({ embedded = false }: CommunityProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('allTime');
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('hellos');

  // Check if user is anonymous (guest)
  const isGuest = user?.is_anonymous === true;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('community-stats');
        if (error) throw error;
        setStats(data);
      } catch (err: any) {
        console.error('Error fetching community stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24 pt-6 px-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Community</h1>
            <p className="text-muted-foreground">Loading stats...</p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-24" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-background pb-24 pt-6 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Community</h1>
          <p className="text-muted-foreground">Unable to load community stats. Please try again later.</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number | undefined | null) => {
    return (num ?? 0).toLocaleString();
  };

  const getLeaders = (): LeaderEntry[] => {
    const category = stats.leaderboards?.[leaderboardType];
    return category?.[timeFilter] || [];
  };

  const renderLeaderboard = (
    leaders: LeaderEntry[],
    icon: React.ReactNode,
    emptyMessage: string
  ) => {
    if (leaders.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
      );
    }

    return (
      <div className="space-y-2">
        {leaders.map((leader, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-between py-2 px-3 rounded-lg ${
              index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' :
              index === 1 ? 'bg-gradient-to-r from-gray-300/10 to-gray-400/10' :
              index === 2 ? 'bg-gradient-to-r from-amber-600/10 to-amber-700/10' :
              'bg-muted/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                index === 0 ? 'bg-yellow-500 text-yellow-950' :
                index === 1 ? 'bg-gray-400 text-gray-900' :
                index === 2 ? 'bg-amber-600 text-amber-950' :
                'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </span>
              <span className="text-sm font-medium text-foreground">{leader.displayName}</span>
            </div>
            <div className="flex items-center gap-1 text-primary">
              {icon}
              <span className="font-semibold">{leader.count}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const timeFilterLabels: Record<TimeFilter, string> = {
    allTime: 'All',
    thisMonth: 'Month',
    thisWeek: 'Week',
    today: 'Today',
  };

  const leaderboardTypeLabels: Record<LeaderboardType, string> = {
    hellos: 'Hellos',
    names: 'Names',
  };

  return (
    <div className={embedded ? "space-y-6" : "min-h-screen bg-background pb-24 pt-6 px-4"}>
      <div className={embedded ? "space-y-6" : "max-w-md mx-auto space-y-6"}>
        {/* Header - only show when not embedded */}
        {!embedded && (
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Community
            </h1>
            <p className="text-muted-foreground text-sm">Hello's from around the world</p>
          </div>
        )}

        {/* Section 1: Collective Impact */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Global Hellos
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-3xl font-bold text-primary">{formatNumber(stats.collectiveImpact.totalHellos)}</p>
                <p className="text-sm text-muted-foreground">hellos logged</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-secondary/30 to-secondary/10 border-secondary/20">
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-3xl font-bold text-foreground">{formatNumber(stats.collectiveImpact.totalNames)}</p>
                <p className="text-sm text-muted-foreground">names remembered</p>
              </CardContent>
            </Card>
            
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Card className="bg-gradient-to-br from-accent/30 to-accent/10 border-accent/20">
              <CardContent className="pt-3 pb-3 text-center px-2">
                <p className="text-xl font-bold text-foreground">{formatNumber(stats.collectiveImpact.hellosThisMonth)}</p>
                <p className="text-[10px] text-muted-foreground">this month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/30 to-accent/10 border-accent/20">
              <CardContent className="pt-3 pb-3 text-center px-2">
                <p className="text-xl font-bold text-foreground">{formatNumber(stats.collectiveImpact.hellosThisWeek)}</p>
                <p className="text-[10px] text-muted-foreground">this week</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-accent/30 to-accent/10 border-accent/20">
              <CardContent className="pt-3 pb-3 text-center px-2">
                <p className="text-xl font-bold text-foreground">{formatNumber(stats.collectiveImpact.hellosToday)}</p>
                <p className="text-[10px] text-muted-foreground">today</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 2: Consolidated Leaderboard */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Community Leaders
          </h2>

          {/* Combined Hellos/Names Leaderboard */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                {/* Leaderboard Type Toggle */}
                <div className="flex bg-muted/50 rounded-lg p-0.5">
                  {(Object.keys(leaderboardTypeLabels) as LeaderboardType[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => setLeaderboardType(key)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        leaderboardType === key
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {key === 'hellos' ? <Hand className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      {leaderboardTypeLabels[key]}
                    </button>
                  ))}
                </div>
                
                {/* Time Filter Toggle */}
                <div className="flex bg-muted/50 rounded-lg p-0.5">
                  {(Object.keys(timeFilterLabels) as TimeFilter[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => setTimeFilter(key)}
                      className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                        timeFilter === key
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {timeFilterLabels[key]}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {renderLeaderboard(
                getLeaders(),
                leaderboardType === 'hellos' ? <Hand className="w-4 h-4" /> : <User className="w-4 h-4" />,
                leaderboardType === 'hellos' 
                  ? "No hellos logged yet. Be the first!"
                  : "No names logged yet. Be the first!"
              )}
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Daily Mode Streak Leaderboard */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Daily Mode Best Streaks
          </h2>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                🔥 Top 10 All-Time Streaks
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {renderLeaderboard(
                stats.leaderboards?.dailyStreak || [],
                <Flame className="w-4 h-4 text-orange-500" />,
                "No daily streaks yet. Start your streak today!"
              )}
            </CardContent>
          </Card>
        </div>

        {/* Encouraging Footer */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Every hello counts. Keep making the world a brighter place ✨
          </p>
        </div>
      </div>

      {/* Save Progress Dialog */}
      <SaveProgressDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onDismiss={() => setShowSaveDialog(false)}
      />
    </div>
  );
};

export default Community;