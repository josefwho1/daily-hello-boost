const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface EmailHookPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: {
      name?: string;
    };
  };
  email_data: {
    token?: string;
    token_hash?: string;
    redirect_to?: string;
    email_action_type: 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change';
    site_url?: string;
    confirmation_url?: string;
  };
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Remi 🦝 <remi@onehello.io>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return false;
    }

    console.log(`Auth email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

function createAuthEmailHtml(
  title: string,
  bodyContent: string,
  buttonText: string,
  buttonUrl: string,
  otpCode?: string
): string {
  const otpSection = otpCode ? `
    <div style="margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">Or enter this code manually:</p>
      <div style="background-color: #f5f5f5; border-radius: 8px; padding: 16px 24px; display: inline-block;">
        <span style="font-family: monospace; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #333;">${otpCode}</span>
      </div>
      <p style="margin: 12px 0 0 0; color: #999; font-size: 12px;">This code expires in 1 hour</p>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fdf8f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fdf8f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
          <!-- Logo Header -->
          <tr>
            <td style="padding: 32px 32px 16px 32px; text-align: center;">
              <img src="https://daily-hello-boost.lovable.app/icon-192.png" alt="One Hello" style="width: 64px; height: 64px; border-radius: 12px;" />
              <h1 style="margin: 16px 0 0 0; color: #502a13; font-size: 24px; font-weight: 600;">One Hello</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              ${bodyContent}
              
              <!-- Primary CTA Button -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${buttonUrl}" style="display: inline-block; background-color: #ff6f3b; color: white; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">${buttonText}</a>
              </div>
              
              ${otpSection}
              
              <!-- Fallback link -->
              <p style="text-align: center; color: #999; font-size: 12px; margin: 20px 0 0 0;">
                Button not working? Copy and paste this link:<br>
                <a href="${buttonUrl}" style="color: #ff6f3b; word-break: break-all;">${buttonUrl}</a>
              </p>
              
              <!-- Signature -->
              <p style="text-align: center; margin: 24px 0 0 0; color: #502a13; font-size: 15px;">— Remi 🦝</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #faf5f2; text-align: center; border-top: 1px solid #f0e6df;">
              <p style="margin: 0; color: #999; font-size: 11px; line-height: 1.5;">
                You're receiving this email because you requested to sign in to One Hello.<br>
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: EmailHookPayload = await req.json();
    console.log('Email hook received:', payload.email_data.email_action_type);

    const { user, email_data } = payload;
    const email = user.email;
    const username = user.user_metadata?.name || 'Friend';
    
    // The token is the 6-digit OTP code
    const otpCode = email_data.token;
    // The confirmation_url is the magic link
    const magicLink = email_data.confirmation_url || email_data.redirect_to || 'https://app.onehello.io';

    let subject: string;
    let bodyContent: string;
    let buttonText: string;

    switch (email_data.email_action_type) {
      case 'magiclink':
      case 'signup':
        subject = 'Sign in to One Hello 🦝';
        bodyContent = `
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
            Hey ${username}! 👋
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
            Click the button below to sign in to One Hello, or use the 6-digit code if the button doesn't work.
          </p>
        `;
        buttonText = 'Sign in to One Hello';
        break;

      case 'recovery':
        subject = 'Reset your One Hello password 🔐';
        bodyContent = `
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
            Hey ${username}! 👋
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
            You requested to reset your password. Click the button below or use the 6-digit code to continue.
          </p>
        `;
        buttonText = 'Reset Password';
        break;

      case 'invite':
        subject = "You're invited to One Hello! 🦝";
        bodyContent = `
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
            Hey there! 👋
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
            You've been invited to join One Hello. Click the button below to accept your invitation.
          </p>
        `;
        buttonText = 'Accept Invitation';
        break;

      case 'email_change':
        subject = 'Confirm your new email 📧';
        bodyContent = `
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
            Hey ${username}! 👋
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
            Please confirm your new email address by clicking the button below or entering the code.
          </p>
        `;
        buttonText = 'Confirm Email';
        break;

      default:
        subject = 'One Hello 🦝';
        bodyContent = `
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
            Click the button below to continue.
          </p>
        `;
        buttonText = 'Continue';
    }

    const html = createAuthEmailHtml(subject, bodyContent, buttonText, magicLink, otpCode);
    const sent = await sendEmail(email, subject, html);

    if (!sent) {
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in email-hook:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
