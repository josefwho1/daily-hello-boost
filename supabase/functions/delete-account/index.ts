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

    // Create admin client for deletion operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Delete all user data from tables (in correct order due to foreign keys)
    console.log(`Deleting account for user: ${userId}`);

    // Delete hello_logs
    const { error: helloLogsError } = await adminClient
      .from("hello_logs")
      .delete()
      .eq("user_id", userId);
    if (helloLogsError) console.error("Error deleting hello_logs:", helloLogsError);

    // Delete challenge_completions
    const { error: challengeError } = await adminClient
      .from("challenge_completions")
      .delete()
      .eq("user_id", userId);
    if (challengeError) console.error("Error deleting challenge_completions:", challengeError);

    // Delete person_logs
    const { error: personLogsError } = await adminClient
      .from("person_logs")
      .delete()
      .eq("user_id", userId);
    if (personLogsError) console.error("Error deleting person_logs:", personLogsError);

    // Delete email_logs
    const { error: emailLogsError } = await adminClient
      .from("email_logs")
      .delete()
      .eq("user_id", userId);
    if (emailLogsError) console.error("Error deleting email_logs:", emailLogsError);

    // Delete user_progress
    const { error: progressError } = await adminClient
      .from("user_progress")
      .delete()
      .eq("user_id", userId);
    if (progressError) console.error("Error deleting user_progress:", progressError);

    // Delete profile
    const { error: profileError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (profileError) console.error("Error deleting profiles:", profileError);

    // Delete the auth user using admin API
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId);
    
    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError);
      return new Response(
        JSON.stringify({ error: "Failed to delete account" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully deleted account for user: ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
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