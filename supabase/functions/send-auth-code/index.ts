import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendCodeRequest {
  email: string;
}

// Generate a 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: SendCodeRequest = await req.json();

    // Validate email
    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting: check codes sent in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentCodes, error: countError } = await supabase
      .from("auth_codes")
      .select("id")
      .eq("email", normalizedEmail)
      .gte("created_at", oneHourAgo);

    if (countError) {
      console.error("Error checking rate limit:", countError);
      return new Response(
        JSON.stringify({ error: "Failed to process request" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (recentCodes && recentCodes.length >= 5) {
      return new Response(
        JSON.stringify({ error: "Too many code requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Delete any existing codes for this email
    await supabase
      .from("auth_codes")
      .delete()
      .eq("email", normalizedEmail);

    // Generate new code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store the code
    const { error: insertError } = await supabase
      .from("auth_codes")
      .insert({
        email: normalizedEmail,
        code,
        expires_at: expiresAt,
        attempts: 0,
      });

    if (insertError) {
      console.error("Error storing code:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate code" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if this is an existing user
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const isExistingUser = existingUser?.users?.some(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);

    const emailResponse = await resend.emails.send({
      from: "One Hello <noreply@onehello.io>",
      to: [normalizedEmail],
      subject: "Your One Hello login code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 400px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h1 style="font-size: 24px; margin: 0 0 16px; color: #1a1a1a;">Hi there! 🦝</h1>
            <p style="font-size: 16px; color: #444; margin: 0 0 24px; line-height: 1.5;">
              Your login code is:
            </p>
            <div style="background: #f0f9ff; border: 2px solid #38bdf8; border-radius: 8px; padding: 16px; text-align: center; margin: 0 0 24px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0284c7;">${code}</span>
            </div>
            <p style="font-size: 14px; color: #666; margin: 0 0 8px;">
              This code expires in <strong>10 minutes</strong>.
            </p>
            <p style="font-size: 13px; color: #888; margin: 24px 0 0;">
              Didn't request this? You can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="font-size: 12px; color: #999; margin: 0; text-align: center;">
              — One Hello
            </p>
          </div>
        </body>
        </html>
      `,
      text: `Your One Hello login code: ${code}\n\nThis code expires in 10 minutes.\n\nDidn't request this? Ignore this email.`,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Code sent to your email",
        isExistingUser 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-auth-code:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send code" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
