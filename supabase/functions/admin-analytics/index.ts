import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get total users count
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get total hellos logged
    const { count: totalHellos } = await supabase
      .from("hello_logs")
      .select("*", { count: "exact", head: true });

    // Get users with at least one hello
    const { data: activeUsersData } = await supabase
      .from("hello_logs")
      .select("user_id");
    
    const uniqueActiveUsers = new Set(activeUsersData?.map(h => h.user_id) || []);
    const activeUsers = uniqueActiveUsers.size;

    // Get hellos logged today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: hellosToday } = await supabase
      .from("hello_logs")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Get hellos logged this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const { count: hellosThisWeek } = await supabase
      .from("hello_logs")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekStart.toISOString());

    // Get users who signed up this week
    const { count: newUsersThisWeek } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekStart.toISOString());

    // Get average hellos per user
    const avgHellosPerUser = activeUsers > 0 ? Math.round((totalHellos || 0) / activeUsers * 10) / 10 : 0;

    // Get hello distribution by rating
    const { data: ratingData } = await supabase
      .from("hello_logs")
      .select("rating");
    
    const ratingCounts = {
      positive: 0,
      neutral: 0,
      negative: 0,
      unrated: 0
    };
    
    ratingData?.forEach(h => {
      if (h.rating === "positive") ratingCounts.positive++;
      else if (h.rating === "neutral") ratingCounts.neutral++;
      else if (h.rating === "negative") ratingCounts.negative++;
      else ratingCounts.unrated++;
    });

    // Get recent hello activity (last 7 days)
    const dailyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const { count } = await supabase
        .from("hello_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", date.toISOString())
        .lt("created_at", nextDate.toISOString());
      
      dailyActivity.push({
        date: date.toISOString().split("T")[0],
        count: count || 0
      });
    }

    // Get user progress stats
    const { data: progressData } = await supabase
      .from("user_progress")
      .select("current_streak, weekly_streak, total_hellos, current_level, mode, has_completed_onboarding");

    const completedOnboarding = progressData?.filter(p => p.has_completed_onboarding).length || 0;
    const avgStreak = progressData?.length 
      ? Math.round(progressData.reduce((sum, p) => sum + (p.current_streak || 0), 0) / progressData.length * 10) / 10 
      : 0;
    
    const modeDistribution = {
      daily: progressData?.filter(p => p.mode === "daily").length || 0,
      chill: progressData?.filter(p => p.mode === "chill").length || 0,
      normal: progressData?.filter(p => p.mode === "normal" || !p.mode).length || 0
    };

    return new Response(
      JSON.stringify({
        totalUsers: totalUsers || 0,
        totalHellos: totalHellos || 0,
        activeUsers,
        hellosToday: hellosToday || 0,
        hellosThisWeek: hellosThisWeek || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        avgHellosPerUser,
        avgStreak,
        completedOnboarding,
        ratingCounts,
        modeDistribution,
        dailyActivity
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
