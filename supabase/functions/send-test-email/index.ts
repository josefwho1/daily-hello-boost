import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// CTA button style
const ctaButton = `
  <div style="text-align: center; margin: 24px 0;">
    <a href="https://onehello.io" style="display: inline-block; background-color: #ff6f3b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Open One Hello</a>
  </div>
`;

const testTemplate = `
  <h2>Day 1 is live 👋</h2>
  <p>Your first challenge: <strong>Say hello to a stranger today.</strong></p>
  <p>It can be anyone — a barista, someone in the elevator, a person walking by. Just a simple "Hi" or "Hello" is all it takes.</p>
  <p>Once you've done it, open the app and log your hello. You can add their name if you caught it, and any notes you want to remember.</p>
  <p>Complete this and earn your first Orb 🔮</p>
  ${ctaButton}
  <p>You've got this!<br/>— Remi 🦝</p>
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    
    console.log(`Sending test email to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "Remi from One Hello <remi@onehello.io>",
      to: [email],
      subject: "Day 1 is live 👋 Your first hello is waiting",
      html: testTemplate,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending test email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
