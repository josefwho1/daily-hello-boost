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

    // Users who completed today's hello
    const { data: todayUsers } = await supabase
      .from('hello_logs')
      .select('user_id')
      .gte('created_at', todayStart)
      .lt('created_at', todayEnd);
    
    const uniqueTodayUsers = new Set(todayUsers?.map(u => u.user_id) || []).size;

    // Get current weekly challenge info
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weekNumber = Math.floor((now.getTime() - startOfYear.getTime()) / msPerWeek) + 1;

    const { data: weeklyChallenge } = await supabase
      .from('weekly_challenges')
      .select('title, description')
      .eq('week_number', weekNumber)
      .single();

    // Weekly challenge completions this week
    const { count: weeklyChallengeCompletions } = await supabase
      .from('challenge_completions')
      .select('*', { count: 'exact', head: true })
      .gte('completed_at', weekStartStr);

    // Get today's daily challenge
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    const { data: dailyChallenge } = await supabase
      .from('daily_challenges')
      .select('title, description')
      .eq('day_of_year', dayOfYear)
      .single();

    // Top 10 by current streak
    const { data: streakLeaders } = await supabase
      .from('user_progress')
      .select('user_id, current_streak, username')
      .gt('current_streak', 0)
      .order('current_streak', { ascending: false })
      .limit(10);

    // Enrich streak leaders with profile data
    const enrichedStreakLeaders = await Promise.all(
      (streakLeaders || []).map(async (leader) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', leader.user_id)
          .single();
        
        return {
          displayName: leader.username || profile?.username || 'Anonymous',
          streak: leader.current_streak,
        };
      })
    );

    // Top 10 by hellos this week
    const { data: weeklyLeaders } = await supabase
      .from('user_progress')
      .select('user_id, hellos_this_week, username')
      .gt('hellos_this_week', 0)
      .order('hellos_this_week', { ascending: false })
      .limit(10);

    // Enrich weekly leaders with profile data
    const enrichedWeeklyLeaders = await Promise.all(
      (weeklyLeaders || []).map(async (leader) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', leader.user_id)
          .single();
        
        return {
          displayName: leader.username || profile?.username || 'Anonymous',
          hellosThisWeek: leader.hellos_this_week,
        };
      })
    );

    return new Response(
      JSON.stringify({
        collectiveImpact: {
          totalHellos: totalHellos || 0,
          totalNames: totalNames || 0,
          hellosThisWeek: hellosThisWeek || 0,
          weeklyChallengeCompletions: weeklyChallengeCompletions || 0,
          weeklyChallenge: weeklyChallenge || { title: 'No challenge this week', description: '' },
        },
        todayStats: {
          hellosToday: hellosToday || 0,
          usersToday: uniqueTodayUsers,
          dailyChallenge: dailyChallenge || { title: 'No challenge today', description: '' },
        },
        leaderboards: {
          streakLeaders: enrichedStreakLeaders,
          weeklyLeaders: enrichedWeeklyLeaders,
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
