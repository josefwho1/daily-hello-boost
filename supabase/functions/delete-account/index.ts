import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create client with user's token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify JWT using getClaims
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("JWT verification failed:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Anonymizing account for user: ${userId}`);

    // Instead of deleting data, we anonymize it:
    // 1. Remove email from profiles
    // 2. Set hide_from_leaderboard = true
    // 3. Set username to "Deleted User"
    // 4. Keep all hello_logs, person_logs, challenge_completions (for stats)
    // 5. Delete the auth user only

    // Anonymize profile - remove email, hide from leaderboards
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        email: null,
        username: 'Deleted User',
        hide_from_leaderboard: true,
        is_anonymous: true,
      })
      .eq("id", userId);
    if (profileError) console.error("Error anonymizing profile:", profileError);

    // Anonymize user_progress - remove username
    const { error: progressError } = await adminClient
      .from("user_progress")
      .update({
        username: 'Deleted User',
      })
      .eq("user_id", userId);
    if (progressError) console.error("Error anonymizing user_progress:", progressError);

    // Delete email_logs as they contain PII
    const { error: emailLogsError } = await adminClient
      .from("email_logs")
      .delete()
      .eq("user_id", userId);
    if (emailLogsError) console.error("Error deleting email_logs:", emailLogsError);

    // Delete person_logs as they contain personal notes
    const { error: personLogsError } = await adminClient
      .from("person_logs")
      .delete()
      .eq("user_id", userId);
    if (personLogsError) console.error("Error deleting person_logs:", personLogsError);

    // Keep hello_logs, challenge_completions - they contribute to community stats
    // Just anonymize the names in hello_logs
    const { error: helloLogsError } = await adminClient
      .from("hello_logs")
      .update({
        name: null,
        notes: null,
      })
      .eq("user_id", userId);
    if (helloLogsError) console.error("Error anonymizing hello_logs:", helloLogsError);

    // Anonymize challenge_completions
    const { error: challengeError } = await adminClient
      .from("challenge_completions")
      .update({
        username: 'Deleted User',
        interaction_name: null,
        notes: null,
      })
      .eq("user_id", userId);
    if (challengeError) console.error("Error anonymizing challenge_completions:", challengeError);

    // Delete the auth user using admin API
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);
    
    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError);
      return new Response(
        JSON.stringify({ error: "Failed to delete account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully anonymized and deleted auth for user: ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully. Your data has been anonymized." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in delete-account function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
