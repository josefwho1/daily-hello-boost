import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Users, Heart, Calendar, Trophy, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CommunityStats {
  collectiveImpact: {
    totalHellos: number;
    totalNames: number;
    hellosThisWeek: number;
    hellosToday: number;
    weeklyChallengeCompletions: number;
    weeklyChallenge: { title: string; description: string };
  };
  todayStats: {
    hellosToday: number;
    usersCompletedTodaysHello: number;
    dailyChallenge: { title: string; description: string };
  };
  leaderboards: {
    streakLeaders: { displayName: string; streak: number }[];
    weeklyLeaders: { displayName: string; hellosThisWeek: number }[];
  };
}

const Community = () => {
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Community
          </h1>
          <p className="text-muted-foreground text-sm">Hello's from around the world</p>
        </div>

        {/* Section 1: Collective Impact */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Collective Impact
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
            
            <Card className="bg-gradient-to-br from-accent/30 to-accent/10 border-accent/20">
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-3xl font-bold text-foreground">{formatNumber(stats.collectiveImpact.hellosToday)}</p>
                <p className="text-sm text-muted-foreground">hellos today</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-accent/30 to-accent/10 border-accent/20">
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-3xl font-bold text-foreground">{formatNumber(stats.collectiveImpact.hellosThisWeek)}</p>
                <p className="text-sm text-muted-foreground">hellos this week</p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Challenge Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Remi's Weekly Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm font-medium text-foreground mb-1">{stats.collectiveImpact.weeklyChallenge.title}</p>
              <p className="text-xs text-muted-foreground mb-2">{stats.collectiveImpact.weeklyChallenge.description}</p>
              <div className="flex items-center gap-1 text-primary">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-semibold">{formatNumber(stats.collectiveImpact.weeklyChallengeCompletions)}</span>
                <span className="text-xs text-muted-foreground">users completed this week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Today's Hello */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Today's Hello
          </h2>
          
          {/* Today's Hello Card (similar style to weekly challenge) */}
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                {stats.todayStats.dailyChallenge.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground mb-2">{stats.todayStats.dailyChallenge.description}</p>
              <div className="flex items-center gap-1 text-primary">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-semibold">{formatNumber(stats.todayStats.usersCompletedTodaysHello)}</span>
                <span className="text-xs text-muted-foreground">users completed today</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Community Leaders */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Community Leaders
          </h2>

          {/* Streak Leaderboard */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Longest Active Streaks
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {stats.leaderboards.streakLeaders.length > 0 ? (
                <div className="space-y-2">
                  {stats.leaderboards.streakLeaders.map((leader, index) => (
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
                      <div className="flex items-center gap-1 text-orange-500">
                        <Flame className="w-4 h-4" />
                        <span className="font-semibold">{leader.streak}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No active streaks yet. Be the first!</p>
              )}
            </CardContent>
          </Card>

          {/* Weekly Leaderboard */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Most Active This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {stats.leaderboards.weeklyLeaders.length > 0 ? (
                <div className="space-y-2">
                  {stats.leaderboards.weeklyLeaders.map((leader, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                        index === 0 ? 'bg-gradient-to-r from-primary/10 to-primary/5' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300/10 to-gray-400/10' :
                        index === 2 ? 'bg-gradient-to-r from-amber-600/10 to-amber-700/10' :
                        'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-primary text-primary-foreground' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                          index === 2 ? 'bg-amber-600 text-amber-950' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-foreground">{leader.displayName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <Heart className="w-4 h-4" />
                        <span className="font-semibold">{leader.hellosThisWeek}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hellos logged this week yet. Be the first!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Encouraging Footer */}
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Every hello matters. Keep spreading kindness! 💛
          </p>
        </div>
      </div>
    </div>
  );
};

export default Community;
