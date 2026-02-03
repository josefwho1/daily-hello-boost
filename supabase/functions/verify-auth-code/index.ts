import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VerifyCodeRequest {
  email: string;
  code: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code }: VerifyCodeRequest = await req.json();

    // Validate inputs
    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();

    // Validate code format
    if (!/^\d{6}$/.test(normalizedCode)) {
      return new Response(
        JSON.stringify({ error: "Invalid code format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the stored code
    const { data: storedCode, error: fetchError } = await supabase
      .from("auth_codes")
      .select("*")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching code:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to verify code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No code found
    if (!storedCode) {
      return new Response(
        JSON.stringify({ error: "No code found. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check expiration
    if (new Date(storedCode.expires_at) < new Date()) {
      // Delete expired code
      await supabase.from("auth_codes").delete().eq("id", storedCode.id);
      return new Response(
        JSON.stringify({ error: "Code expired. Please request a new one." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check attempts
    if (storedCode.attempts >= 5) {
      return new Response(
        JSON.stringify({ error: "Too many attempts. Please request a new code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if code matches
    if (storedCode.code !== normalizedCode) {
      // Increment attempts
      await supabase
        .from("auth_codes")
        .update({ attempts: storedCode.attempts + 1 })
        .eq("id", storedCode.id);

      const attemptsRemaining = 5 - storedCode.attempts - 1;
      return new Response(
        JSON.stringify({ 
          error: `Incorrect code. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Code is valid! Delete it
    await supabase.from("auth_codes").delete().eq("id", storedCode.id);

    let userId: string;
    let isNewUser = false;

    // Try to generate a magic link first (works for existing users)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: normalizedEmail,
    });

    if (linkError) {
      // User doesn't exist - create them
      if (linkError.message.includes('not found') || linkError.message.includes('Unable to validate')) {
        console.log("User not found, creating new user");
        isNewUser = true;
        
        // Generate a secure random password (user won't need it - they'll use code auth)
        const tempPassword = crypto.randomUUID() + crypto.randomUUID();
        
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: normalizedEmail,
          password: tempPassword,
          email_confirm: true, // Auto-confirm since they verified via code
          user_metadata: {
            name: 'User',
          },
        });

        if (createError) {
          // If user already exists (race condition), try magic link again
          if (createError.message.includes('already') || createError.code === 'email_exists') {
            console.log("User already exists, generating magic link");
            const { data: retryLinkData, error: retryLinkError } = await supabase.auth.admin.generateLink({
              type: 'magiclink',
              email: normalizedEmail,
            });

            if (retryLinkError) {
              console.error("Error generating magic link on retry:", retryLinkError);
              return new Response(
                JSON.stringify({ error: "Failed to authenticate" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }

            const url = new URL(retryLinkData.properties.action_link);
            const token = url.searchParams.get('token');
            const type = url.searchParams.get('type');

            // Get user ID from the link data
            userId = retryLinkData.user.id;

            return new Response(
              JSON.stringify({ 
                success: true, 
                isNewUser: false,
                userId,
                token,
                type,
                email: normalizedEmail,
              }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          console.error("Error creating user:", createError);
          return new Response(
            JSON.stringify({ error: "Failed to create account" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        userId = newUser.user.id;

        // Generate a magic link for the new user to sign in
        const { data: newUserLinkData, error: newUserLinkError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: normalizedEmail,
        });

        if (newUserLinkError) {
          console.error("Error generating magic link for new user:", newUserLinkError);
          return new Response(
            JSON.stringify({ error: "Failed to authenticate" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const url = new URL(newUserLinkData.properties.action_link);
        const token = url.searchParams.get('token');
        const type = url.searchParams.get('type');

        return new Response(
          JSON.stringify({ 
            success: true, 
            isNewUser: true,
            userId,
            token,
            type,
            email: normalizedEmail,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        console.error("Error generating magic link:", linkError);
        return new Response(
          JSON.stringify({ error: "Failed to authenticate" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Existing user - extract token from the link
    const url = new URL(linkData.properties.action_link);
    const token = url.searchParams.get('token');
    const type = url.searchParams.get('type');
    userId = linkData.user.id;

    return new Response(
      JSON.stringify({ 
        success: true, 
        isNewUser: false,
        userId,
        token,
        type,
        email: normalizedEmail,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in verify-auth-code:", error);
    return new Response(
      JSON.stringify({ error: "Failed to verify code" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
