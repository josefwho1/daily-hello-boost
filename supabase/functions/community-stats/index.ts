import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Daily hellos data (must match src/data/dailyHellos.ts)
const dailyHellos = [
  { id: 1, title: "Dream Ask", description: "Ask a stranger 'If money was no object, what would you do tomorrow?'" },
  { id: 2, title: "Secret Share", description: "Tell a stranger one harmless secret ('I'm terrified of elevators')" },
  { id: 3, title: "Biceps.", description: "Say hello to someone in your gym or on your run or walk if it's a rest day" },
  { id: 4, title: "Old timer", description: "Say hello to someone older than you" },
  { id: 5, title: "Long lines suck", description: "Start small talk in a queue" },
  { id: 6, title: "Super random", description: "Start with: 'Mind if I say something random?' then give a compliment" },
  { id: 7, title: "I appreciate you", description: "Tell someone you appreciate them 'thanks, appreciate you!'" },
  { id: 8, title: "Love your energy", description: "Tell someone they have great energy" },
  { id: 9, title: "Happy Monday!", description: "Wish someone 'Happy [day of the week]!'" },
  { id: 10, title: "Fit Checkkkk", description: "Ask for an opinion on your outfit" },
  { id: 11, title: "Learn & Repeat", description: "Get someone's name and use it during your interaction." },
  { id: 12, title: "Shameless plug", description: "Name drop One Hello and use it as an excuse to meet someone." },
  { id: 13, title: "Opposites attract", description: "Meet someone new from the opposite gender" },
  { id: 14, title: "Influenceerrrrr", description: "Ask someone to take a photo of you." },
  { id: 15, title: "High Five", description: "Get a highfive from a stranger" },
  { id: 16, title: "Bump it 🤜🤛", description: "Get a fist bump" },
  { id: 17, title: "Recommendation", description: "Ask someone for a recommendation, café, lunch spot, anything" },
  { id: 18, title: "Cute dog", description: "Ask someone about their pet (if they have one)" },
  { id: 19, title: "Staff favourite", description: "When ordering something from a store, ask the staff what is their favourite item?" },
  { id: 20, title: "Small favour", description: "Ask someone for a small favour (napkin, direction, time)" },
  { id: 21, title: "Feeling Thirsty", description: "Ask someone what they're drinking (if in a café or bar)" },
  { id: 22, title: "Weekend feels", description: "Ask someone what their weekend plans are" },
  { id: 23, title: "Mondays am I right?", description: "Make a comment on the day of the week" },
  { id: 24, title: "Good morning?", description: "Ask someone how their morning has been" },
  { id: 25, title: "Local or nah", description: "Ask someone if they're from around here" },
  { id: 26, title: "Book Club", description: "Talk to someone about the book they are reading (or simply ask about it)" },
  { id: 27, title: "What brings?", description: "Ask someone what brings them here" },
  { id: 28, title: "Orange obviously", description: "Ask someone what their favourite colour is" },
  { id: 29, title: "Raccoons obviously", description: "Ask someone what their favourite animal is" },
  { id: 30, title: "Feeling snacky", description: "Ask someone what they're eating/drinking & where they got it from" },
  { id: 31, title: "Keyboard warrior", description: "Ask someone what they're working on (if they're on a laptop)" },
  { id: 32, title: "I want a Remi Tee", description: "Ask someone where they got their shirt from" },
  { id: 33, title: "Style points", description: "Compliment someone's style" },
  { id: 34, title: "Lone wolf", description: "Greet someone sitting alone" },
  { id: 35, title: "Doorman (or woman)", description: "Hold the door for someone & say something" },
  { id: 36, title: "Vibin", description: "Tell someone random that you like their vibe" },
  { id: 37, title: "Cool Glasses", description: "Compliment someone's sunglasses (or regular glasses)" },
  { id: 38, title: "Awkward Elevator", description: "Break the silence & say hello to someone in an elevator" }
];

// Weekly challenges data (must match src/data/weeklyChallenges.ts)
const weeklyChallenges = [
  { id: 1, title: "Future Friend", description: "Get the contact of someone new and suggest to go for a coffee, walk or bite to eat" },
  { id: 2, title: "Forget & Forgive", description: "Ask for someone's name that you should already know" },
  { id: 3, title: "Old Flame", description: "Reach out to someone (friend, family or colleague) that you haven't spoken to in a while." },
  { id: 4, title: "Free Coffee", description: "Buy someone a coffee, tis the season of giving." },
  { id: 5, title: "Neighborino", description: "Introduce yourself to a neighbour you've never met properly and get their name" },
  { id: 6, title: "Name to the Face", description: "Introduce yourself to someone you've seen many times before but never got their name" }
];

// Reference date for weekly challenges: Monday Dec 8, 2025
const WEEKLY_REFERENCE_DATE = new Date(Date.UTC(2025, 11, 8));

// Seeded random shuffle - same seed = same order for all users
const seededShuffle = <T>(array: T[], seed: number): T[] => {
  const shuffled = [...array];
  let currentSeed = seed;
  
  const random = () => {
    currentSeed = (currentSeed + 0x6D2B79F5) | 0;
    let t = currentSeed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

// Get today's hello (same logic as client-side)
const getTodaysHello = () => {
  const now = new Date();
  const yearSeed = now.getFullYear();
  const shuffledHellos = seededShuffle(dailyHellos, yearSeed);
  
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  const index = dayOfYear % shuffledHellos.length;
  return shuffledHellos[index];
};

// Get this week's challenge (same logic as client-side)
const getThisWeeksChallenge = () => {
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksSinceReference = Math.floor((now.getTime() - WEEKLY_REFERENCE_DATE.getTime()) / msPerWeek);
  const index = ((weeksSinceReference % weeklyChallenges.length) + weeklyChallenges.length) % weeklyChallenges.length;
  return weeklyChallenges[index];
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

    // Users who completed today's hello (hello_type = 'todays_hello')
    const { data: todayHelloUsers } = await supabase
      .from('hello_logs')
      .select('user_id')
      .eq('hello_type', 'todays_hello')
      .gte('created_at', todayStart)
      .lt('created_at', todayEnd);
    
    const uniqueTodayHelloUsers = new Set(todayHelloUsers?.map(u => u.user_id) || []).size;

    // Weekly challenge completions this week (hello_type = 'remis_challenge')
    const { data: weeklyCompletionUsers } = await supabase
      .from('hello_logs')
      .select('user_id')
      .eq('hello_type', 'remis_challenge')
      .gte('created_at', weekStartStr);
    
    const uniqueWeeklyCompletions = new Set(weeklyCompletionUsers?.map(u => u.user_id) || []).size;

    // Get today's hello using client-side logic
    const todaysHello = getTodaysHello();

    // Get this week's challenge using client-side logic
    const thisWeeksChallenge = getThisWeeksChallenge();

    // Top 10 by daily_streak (the actual streak being tracked)
    const { data: streakLeaders } = await supabase
      .from('user_progress')
      .select('user_id, daily_streak, username')
      .gt('daily_streak', 0)
      .order('daily_streak', { ascending: false })
      .limit(10);

    // Enrich streak leaders with profile data
    const enrichedStreakLeaders = await Promise.all(
      (streakLeaders || []).map(async (leader) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', leader.user_id)
          .maybeSingle();
        
        return {
          displayName: leader.username || profile?.username || 'Anonymous',
          streak: leader.daily_streak,
        };
      })
    );

    // Top 10 by hellos this week - count actual hello_logs for accuracy
    const { data: weeklyHelloData } = await supabase
      .from('hello_logs')
      .select('user_id')
      .gte('created_at', weekStartStr);
    
    // Count hellos per user this week
    const weeklyHellosPerUser: Record<string, number> = {};
    (weeklyHelloData || []).forEach((log) => {
      weeklyHellosPerUser[log.user_id] = (weeklyHellosPerUser[log.user_id] || 0) + 1;
    });
    
    // Sort by count and take top 10
    const sortedWeeklyLeaders = Object.entries(weeklyHellosPerUser)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    
    // Enrich weekly leaders with profile/progress data
    const enrichedWeeklyLeaders = await Promise.all(
      sortedWeeklyLeaders.map(async ([userId, count]) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', userId)
          .maybeSingle();
        
        const { data: progress } = await supabase
          .from('user_progress')
          .select('username')
          .eq('user_id', userId)
          .maybeSingle();
        
        return {
          displayName: progress?.username || profile?.username || 'Anonymous',
          hellosThisWeek: count,
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
          weeklyChallengeCompletions: uniqueWeeklyCompletions,
          weeklyChallenge: thisWeeksChallenge,
        },
        todayStats: {
          hellosToday: hellosToday || 0,
          usersCompletedTodaysHello: uniqueTodayHelloUsers,
          dailyChallenge: todaysHello,
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
