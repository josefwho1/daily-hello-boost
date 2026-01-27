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

    // Top 10 by lifetime hellos - count all hello_logs per user
    const { data: allHelloData } = await supabase
      .from('hello_logs')
      .select('user_id');
    
    // Count hellos per user (lifetime)
    const lifetimeHellosPerUser: Record<string, number> = {};
    (allHelloData || []).forEach((log) => {
      lifetimeHellosPerUser[log.user_id] = (lifetimeHellosPerUser[log.user_id] || 0) + 1;
    });
    
    // Sort by count, filter hidden users, and take top 10
    const sortedLifetimeLeaders = Object.entries(lifetimeHellosPerUser)
      .filter(([userId]) => {
        const profile = profileMap.get(userId);
        return !profile?.hide_from_leaderboard;
      })
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    
    // Enrich lifetime leaders with profile/progress data
    const enrichedLifetimeLeaders = await Promise.all(
      sortedLifetimeLeaders.map(async ([userId, count]) => {
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
          totalHellos: count,
          isGuest,
        };
      })
    );

    return new Response(
      JSON.stringify({
        collectiveImpact: {
          totalHellos: totalHellos || 0,
          totalNames: totalNames || 0,
          hellosThisWeek: hellosThisWeek || 0,
          hellosToday: hellosToday || 0,
        },
        leaderboards: {
          lifetimeLeaders: enrichedLifetimeLeaders,
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
