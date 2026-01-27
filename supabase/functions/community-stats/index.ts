import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current dates
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
    
    // Calculate week start (Monday)
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);
    const weekStartStr = weekStart.toISOString();

    // Calculate month start (1st of current month)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartStr = monthStart.toISOString();

    // Total hellos logged
    const { count: totalHellos } = await supabase
      .from('hello_logs')
      .select('*', { count: 'exact', head: true });

    // Total names remembered (non-null names)
    const { count: totalNames } = await supabase
      .from('hello_logs')
      .select('*', { count: 'exact', head: true })
      .not('name', 'is', null)
      .neq('name', '');

    // Hellos this month
    const { count: hellosThisMonth } = await supabase
      .from('hello_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStartStr);

    // Hellos this week
    const { count: hellosThisWeek } = await supabase
      .from('hello_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStartStr);

    // Hellos today
    const { count: hellosToday } = await supabase
      .from('hello_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart)
      .lt('created_at', todayEnd);

    // Get all profiles to check hide_from_leaderboard and is_anonymous
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id, username, is_anonymous, hide_from_leaderboard');
    
    const profileMap = new Map(
      (allProfiles || []).map(p => [p.id, p])
    );

    // Get all hello logs for leaderboard calculations
    const { data: allHelloData } = await supabase
      .from('hello_logs')
      .select('user_id, name, created_at');
    
    // Helper function to count hellos per user with optional date filter
    const countHellosPerUser = (logs: typeof allHelloData, sinceDate?: string) => {
      const counts: Record<string, number> = {};
      (logs || []).forEach((log) => {
        if (sinceDate && log.created_at < sinceDate) return;
        counts[log.user_id] = (counts[log.user_id] || 0) + 1;
      });
      return counts;
    };

    // Helper function to count names per user with optional date filter
    const countNamesPerUser = (logs: typeof allHelloData, sinceDate?: string) => {
      const counts: Record<string, number> = {};
      (logs || []).forEach((log) => {
        if (sinceDate && log.created_at < sinceDate) return;
        if (log.name && log.name.trim() !== '') {
          counts[log.user_id] = (counts[log.user_id] || 0) + 1;
        }
      });
      return counts;
    };

    // Helper function to get top 10 leaders from counts
    const getTopLeaders = async (counts: Record<string, number>) => {
      const sorted = Object.entries(counts)
        .filter(([userId]) => {
          const profile = profileMap.get(userId);
          return !profile?.hide_from_leaderboard;
        })
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);
      
      return Promise.all(
        sorted.map(async ([userId, count]) => {
          const profile = profileMap.get(userId);
          
          const { data: progress } = await supabase
            .from('user_progress')
            .select('username')
            .eq('user_id', userId)
            .maybeSingle();
          
          const displayName = progress?.username || profile?.username || 'Anonymous';
          const isGuest = profile?.is_anonymous === true;
          
          return {
            displayName: isGuest ? `${displayName} (guest)` : displayName,
            count,
            isGuest,
          };
        })
      );
    };

    // Calculate all leaderboard variants
    const hellosAllTime = countHellosPerUser(allHelloData);
    const hellosMonth = countHellosPerUser(allHelloData, monthStartStr);
    const hellosWeek = countHellosPerUser(allHelloData, weekStartStr);
    const hellosTodays = countHellosPerUser(allHelloData, todayStart);

    const namesAllTime = countNamesPerUser(allHelloData);
    const namesMonth = countNamesPerUser(allHelloData, monthStartStr);
    const namesWeek = countNamesPerUser(allHelloData, weekStartStr);
    const namesToday = countNamesPerUser(allHelloData, todayStart);

    // Get top 10 for each category
    const [
      hellosAllTimeLeaders,
      hellosMonthLeaders,
      hellosWeekLeaders,
      hellosTodayLeaders,
      namesAllTimeLeaders,
      namesMonthLeaders,
      namesWeekLeaders,
      namesTodayLeaders,
    ] = await Promise.all([
      getTopLeaders(hellosAllTime),
      getTopLeaders(hellosMonth),
      getTopLeaders(hellosWeek),
      getTopLeaders(hellosTodays),
      getTopLeaders(namesAllTime),
      getTopLeaders(namesMonth),
      getTopLeaders(namesWeek),
      getTopLeaders(namesToday),
    ]);

    return new Response(
      JSON.stringify({
        collectiveImpact: {
          totalHellos: totalHellos || 0,
          totalNames: totalNames || 0,
          hellosThisMonth: hellosThisMonth || 0,
          hellosThisWeek: hellosThisWeek || 0,
          hellosToday: hellosToday || 0,
        },
        leaderboards: {
          hellos: {
            allTime: hellosAllTimeLeaders,
            thisMonth: hellosMonthLeaders,
            thisWeek: hellosWeekLeaders,
            today: hellosTodayLeaders,
          },
          names: {
            allTime: namesAllTimeLeaders,
            thisMonth: namesMonthLeaders,
            thisWeek: namesWeekLeaders,
            today: namesTodayLeaders,
          },
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching community stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
