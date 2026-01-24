import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET')

// Re-engagement email subject lines (chronological sequence)
const REENGAGEMENT_SUBJECTS = [
  "One hello could change your life, plus it's free 🤷‍♂️",
  "100% of users feel a positive improvement in their week",
  "93% of users felt more confidence after just 7 days",
  "Hope you're having a great day, I wonder what could make it even better 👀",
  "Raccoon to human - do we have a pulse 🥺",
  "Saying Hello can be tough, but not for you, right? 👀",
  "{{username}}, I miss you. Quick hello for old times sake?",
  "I feel like your spam filter is doing me dirty",
  "BooOOoOo its ghostttt Remiii, come say hello?",
  "ItttsssSSssssS TIME, for the UF… Uh I mean One Hello 👀",
  "Help me out, Zero Hello's doesn't have the same ring to it",
  "Hi it's Romi, Remi's brother, just saying Hello",
  "Confession, Romi was me 😭 Forgive me",
  "I once won a free jetski because I said hello",
  "Confession 2.0 - I did not win a Jetski 🥲",
  "FREE JETSKI GIVEAWAY?!",
  "Confession 3.0 - I still don't have a jetski smh 😔",
  "DESPERATION TACTIC - did it work? 🦝",
  "I'm NGL I'm starting to lose hope 🥲",
  "I DARE YOU to say one hello today 🦝",
  "Do NOT use the One Hello App 👀",
  "One Goodbye 🫡 It's been a pleasure I will leave you be (for now)",
  "IM BACK HAHAHA - One Hello time? 🙏",
  "Ok ok I'm done for reallsssss",
  "👀",
  "I'll always remember you (Remember Raccoon) 🦝"
]

// Email template wrapper
function createEmailHtml(bodyContent: string, username: string, unsubscribeUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>One Hello</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #fdf8f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fdf8f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              ${bodyContent}
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="https://daily-hello-boost.lovable.app" style="display: inline-block; background-color: #ff6f3b; color: white; padding: 14px 36px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Open One Hello</a>
              </div>
              
              <!-- Signature -->
              <p style="text-align: center; margin: 24px 0 0 0; color: #502a13; font-size: 15px;">— Remi 🦝</p>
            </td>
          </tr>
          
          <!-- Social Links -->
          <tr>
            <td style="padding: 20px 32px; background-color: #faf5f2; text-align: center; border-top: 1px solid #f0e6df;">
              <p style="margin: 0 0 12px 0; color: #666; font-size: 13px;">Follow us</p>
              <a href="https://www.instagram.com/onehelloapp/" style="color: #ff6f3b; text-decoration: none; margin: 0 12px; font-size: 14px;">Instagram</a>
              <a href="https://www.tiktok.com/@onehelloapp" style="color: #ff6f3b; text-decoration: none; margin: 0 12px; font-size: 14px;">TikTok</a>
            </td>
          </tr>
          
          <!-- Unsubscribe -->
          <tr>
            <td style="padding: 16px 32px 24px 32px; text-align: center; background-color: #faf5f2;">
              <p style="margin: 0; color: #999; font-size: 11px; line-height: 1.5;">
                You are receiving these emails because you are subscribed to One Hello reminders.<br>
                <a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

// Email body templates
function getWelcomeBody(username: string): string {
  return `
    <h1 style="margin: 0 0 16px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Welcome to One Hello! 🦝</h1>
    <p style="margin: 0; color: #444; font-size: 15px; line-height: 1.6;">
      Hey ${username}! So glad you're here. Ready to say your first hello?
    </p>
  `
}

function getStreak1DayBody(username: string): string {
  return `
    <p style="margin: 0; color: #444; font-size: 15px; line-height: 1.6;">
      Hey ${username}, I've got your back. Your streak is safe for now!
    </p>
  `
}

function getStreak2DayBody(username: string): string {
  return `
    <p style="margin: 0; color: #444; font-size: 15px; line-height: 1.6;">
      ${username}, your streak is still alive... but barely. One hello and you're back!
    </p>
  `
}

function getReengagementBody(username: string): string {
  return `
    <p style="margin: 0; color: #444; font-size: 15px; line-height: 1.6;">
      ${username}, one small hello can make a big difference. Give it a try?
    </p>
  `
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured')
    return false
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
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error)
      return false
    }

    console.log(`Email sent successfully to ${to}`)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

function getUserLocalHour(timezoneOffset: string): number {
  const now = new Date()
  const utcHour = now.getUTCHours()
  
  const match = timezoneOffset.match(/([+-])(\d{2}):(\d{2})/)
  if (!match) return utcHour
  
  const sign = match[1] === '+' ? 1 : -1
  const hours = parseInt(match[2])
  const minutes = parseInt(match[3])
  
  const offsetMinutes = sign * (hours * 60 + minutes)
  const localMinutes = utcHour * 60 + now.getUTCMinutes() + offsetMinutes
  const localHour = Math.floor((localMinutes + 1440) % 1440 / 60)
  
  return localHour
}

function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.floor(Math.abs(date1.getTime() - date2.getTime()) / oneDay)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Check for welcome email trigger (POST request from frontend)
  const url = new URL(req.url)
  const action = url.searchParams.get('action')
  
  if (action === 'send-welcome') {
    try {
      const { user_id } = await req.json()
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      
      // Get user data
      const { data: authUser } = await supabase.auth.admin.getUserById(user_id)
      if (!authUser?.user?.email) {
        return new Response(JSON.stringify({ error: 'No email found' }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
      
      const { data: progress } = await supabase
        .from('user_progress')
        .select('welcome_email_sent, email_unsubscribed, username')
        .eq('user_id', user_id)
        .single()
      
      if (progress?.welcome_email_sent || progress?.email_unsubscribed) {
        return new Response(JSON.stringify({ message: 'Welcome email already sent or user unsubscribed' }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }
      
      const username = progress?.username || 'Friend'
      const unsubscribeUrl = `https://daily-hello-boost.lovable.app/settings?unsubscribe=true`
      const html = createEmailHtml(getWelcomeBody(username), username, unsubscribeUrl)
      
      const sent = await sendEmail(authUser.user.email, "Welcome to One Hello 🦝", html)
      
      if (sent) {
        await supabase.from('user_progress').update({ welcome_email_sent: true }).eq('user_id', user_id)
        await supabase.from('email_logs').insert({
          user_id,
          email_type: 'welcome',
          template_key: 'welcome',
          sent_at: new Date().toISOString()
        })
      }
      
      return new Response(JSON.stringify({ success: sent }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    } catch (error) {
      console.error('Error sending welcome email:', error)
      return new Response(JSON.stringify({ error: 'Failed to send welcome email' }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }
  }

  // Cron job logic - verify authorization
  const authHeader = req.headers.get('Authorization')
  const expectedAuth = `Bearer ${CRON_SECRET}`
  
  if (!CRON_SECRET || authHeader !== expectedAuth) {
    console.error('Unauthorized request - invalid or missing CRON_SECRET')
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    console.log('Starting email notification check...')
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    // Get all users with their progress
    const { data: users, error: usersError } = await supabase
      .from('user_progress')
      .select(`
        user_id,
        username,
        current_streak,
        daily_streak,
        last_hello_at,
        last_completed_date,
        email_unsubscribed,
        welcome_email_sent,
        reengagement_email_index,
        last_reengagement_email_at,
        streak_1day_email_sent_for_date,
        streak_2day_email_sent_for_date
      `)
      .eq('email_unsubscribed', false)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      throw usersError
    }

    console.log(`Found ${users?.length || 0} users to check`)

    let emailsSent = 0

    for (const user of users || []) {
      // Get user's email and timezone
      const { data: authUser } = await supabase.auth.admin.getUserById(user.user_id)
      if (!authUser?.user?.email) {
        continue
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('timezone_preference')
        .eq('id', user.user_id)
        .single()

      const timezone = profile?.timezone_preference || '+00:00'
      const localHour = getUserLocalHour(timezone)
      
      // Only send emails around 8-10am local time
      if (localHour < 8 || localHour > 10) {
        continue
      }

      // Check if we already sent any email today
      const { data: existingLog } = await supabase
        .from('email_logs')
        .select('id')
        .eq('user_id', user.user_id)
        .gte('sent_at', `${todayStr}T00:00:00Z`)
        .limit(1)

      if (existingLog && existingLog.length > 0) {
        continue
      }

      const email = authUser.user.email
      const username = user.username || 'Friend'
      const unsubscribeUrl = `https://daily-hello-boost.lovable.app/settings?unsubscribe=true`
      
      let shouldSend = false
      let subject = ''
      let bodyContent = ''
      let templateKey = ''

      // Calculate days since last activity
      // Use last_completed_date as primary source (most reliable), fallback to last_hello_at
      const lastCompletedDate = user.last_completed_date ? new Date(user.last_completed_date) : null
      const lastHelloAt = user.last_hello_at ? new Date(user.last_hello_at) : null
      const lastActivity = lastCompletedDate || lastHelloAt
      const daysSinceActivity = lastActivity ? daysBetween(now, lastActivity) : 999

      // Priority 1: Streak-at-risk emails (override all other logic)
      const hasActiveStreak = (user.current_streak || 0) > 0 || (user.daily_streak || 0) > 0
      
      if (hasActiveStreak) {
        // 1 day of inactivity
        if (daysSinceActivity === 1 && user.streak_1day_email_sent_for_date !== todayStr) {
          shouldSend = true
          subject = "I've saved your streak (for now) 🔥"
          bodyContent = getStreak1DayBody(username)
          templateKey = 'streak_1day'
          
          // Update the tracking
          await supabase.from('user_progress').update({
            streak_1day_email_sent_for_date: todayStr
          }).eq('user_id', user.user_id)
        }
        // 2 days of inactivity
        else if (daysSinceActivity === 2 && user.streak_2day_email_sent_for_date !== todayStr) {
          shouldSend = true
          subject = "Your streak is hanging on 🦝"
          bodyContent = getStreak2DayBody(username)
          templateKey = 'streak_2day'
          
          await supabase.from('user_progress').update({
            streak_2day_email_sent_for_date: todayStr
          }).eq('user_id', user.user_id)
        }
        // After 2 days, stop streak-related emails
      }
      
      // Priority 2: Re-engagement emails (if no streak or >2 days inactive)
      if (!shouldSend && (!hasActiveStreak || daysSinceActivity > 2)) {
        const reengagementIndex = user.reengagement_email_index || 0
        
        // Check if we've sent all 26 emails
        if (reengagementIndex >= REENGAGEMENT_SUBJECTS.length) {
          continue // Stop sending
        }
        
        // Check 48 hours since last activity before starting
        // And 2 days between re-engagement emails
        const lastReengagement = user.last_reengagement_email_at ? new Date(user.last_reengagement_email_at) : null
        const daysSinceLastReengagement = lastReengagement ? daysBetween(now, lastReengagement) : 999
        
        const shouldSendReengagement = 
          daysSinceActivity >= 2 && // 48 hours after last activity
          (reengagementIndex === 0 || daysSinceLastReengagement >= 2) // 2 days between emails
        
        if (shouldSendReengagement) {
          shouldSend = true
          subject = REENGAGEMENT_SUBJECTS[reengagementIndex].replace('{{username}}', username)
          bodyContent = getReengagementBody(username)
          templateKey = `reengagement_${reengagementIndex + 1}`
          
          // Update tracking
          await supabase.from('user_progress').update({
            reengagement_email_index: reengagementIndex + 1,
            last_reengagement_email_at: now.toISOString()
          }).eq('user_id', user.user_id)
        }
      }

      if (shouldSend) {
        const html = createEmailHtml(bodyContent, username, unsubscribeUrl)
        const sent = await sendEmail(email, subject, html)
        
        if (sent) {
          await supabase.from('email_logs').insert({
            user_id: user.user_id,
            email_type: templateKey.includes('streak') ? 'streak' : 'reengagement',
            template_key: templateKey,
            sent_at: new Date().toISOString()
          })
          emailsSent++
          console.log(`Sent ${templateKey} email to ${email}`)
        }
      }
    }

    console.log(`Email notification job complete. Sent ${emailsSent} emails.`)

    return new Response(
      JSON.stringify({ success: true, emailsSent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in email notification function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})