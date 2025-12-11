import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET')

interface UserForEmail {
  user_id: string
  email: string
  username: string
  current_phase: string
  onboarding_email_opt_in: boolean
  daily_email_opt_in: boolean
  chill_email_opt_in: boolean
  current_day: number
  hellos_today_count: number
  hellos_this_week: number
  timezone_preference: string
}

// Email templates
const onboardingTemplates: Record<number, { subject: string; html: string }> = {
  1: {
    subject: "Day 1 is live 👋 Your first hello is waiting",
    html: `
      <h2>Hey there!</h2>
      <p>Your Day 1 challenge is ready: <strong>Say hello to a stranger today.</strong></p>
      <p>It can be anyone — a barista, someone in the elevator, a person walking by. Just a simple "Hi" or "Hello" is all it takes.</p>
      <p>Once you've done it, open the app and log your hello. You can add their name if you caught it, and any notes you want to remember.</p>
      <p>Complete this and earn your first Orb 🔮</p>
      <p>You've got this!<br/>— Remi 🦝</p>
    `
  },
  2: {
    subject: "Day 2: send some good energy out today ✨",
    html: `
      <h2>Day 2 Challenge</h2>
      <p>Today's challenge: <strong>Wish someone well.</strong></p>
      <p>Examples:</p>
      <ul>
        <li>"Have a great day!"</li>
        <li>"Hope your week goes well!"</li>
        <li>"Good luck with that!"</li>
      </ul>
      <p>A small well-wish goes further than people realise. Log it when you're done!</p>
      <p>— Remi 🦝</p>
    `
  },
  3: {
    subject: "Day 3: go one step beyond hello 🌟",
    html: `
      <h2>Day 3 Challenge</h2>
      <p>Today's challenge: <strong>Ask someone how their day is going.</strong></p>
      <p>This takes your hello one step deeper. Try:</p>
      <ul>
        <li>"How's your day going?"</li>
        <li>"Having a good day?"</li>
        <li>"How are things?"</li>
      </ul>
      <p>You might be surprised how much people appreciate being asked. Log it when done!</p>
      <p>— Remi 🦝</p>
    `
  },
  4: {
    subject: "Day 4: compliment someone today 💫",
    html: `
      <h2>Day 4 Challenge</h2>
      <p>Today's challenge: <strong>Give someone a genuine compliment.</strong></p>
      <p>Ideas:</p>
      <ul>
        <li>"I love your jacket!"</li>
        <li>"That's a great bag!"</li>
        <li>"Your energy is awesome today!"</li>
      </ul>
      <p>A genuine compliment can change someone's whole day. You're building confidence with every hello!</p>
      <p>— Remi 🦝</p>
    `
  },
  5: {
    subject: "Day 5: talk about something around you 🌤️",
    html: `
      <h2>Day 5 Challenge</h2>
      <p>Today's challenge: <strong>Comment on something in your environment.</strong></p>
      <p>Examples:</p>
      <ul>
        <li>"Beautiful weather today, hey?"</li>
        <li>"This coffee smells amazing!"</li>
        <li>"Love what they've done with this place!"</li>
      </ul>
      <p>Observations are natural ice-breakers. They give people an easy way to respond.</p>
      <p>— Remi 🦝</p>
    `
  },
  6: {
    subject: "Day 6: turn a stranger into someone familiar 📝",
    html: `
      <h2>Day 6 Challenge</h2>
      <p>Today's challenge: <strong>Learn someone's name.</strong></p>
      <p>Names are magic. When you know someone's name, they're no longer a stranger.</p>
      <p>Try:</p>
      <ul>
        <li>"I'm [your name], by the way!"</li>
        <li>"What's your name?"</li>
        <li>"I didn't catch your name?"</li>
      </ul>
      <p>Log their name in the app so you don't forget. You just turned a stranger into someone familiar!</p>
      <p>— Remi 🦝</p>
    `
  },
  7: {
    subject: "Day 7: you made it — one last hello 🎉",
    html: `
      <h2>Day 7 — The Final Challenge!</h2>
      <p>You've come so far! Today's challenge: <strong>Ask someone a personal question.</strong></p>
      <p>Go a little deeper:</p>
      <ul>
        <li>"What do you do for fun?"</li>
        <li>"What's something exciting happening in your life?"</li>
        <li>"What are you working on?"</li>
      </ul>
      <p>Complete this and you'll unlock the next phase of your One Hello journey. You've got this!</p>
      <p>— Remi 🦝</p>
    `
  }
}

const dailyPathTemplate = {
  subject: "Have you said your hello yet today? 👀",
  html: `
    <h2>Quick check-in!</h2>
    <p>Just a friendly nudge — have you logged your hello today?</p>
    <p>One hello a day keeps your streak alive. If life gets in the way, you can always use an Orb to save it 🔮</p>
    <p>Open the app and log when you're ready!</p>
    <p>— Remi 🦝</p>
  `
}

const chillPathTemplate = {
  subject: "Tiny nudge: you still have hellos left this week 🌱",
  html: (hellosThisWeek: number) => `
    <h2>Weekly progress check</h2>
    <p>You're at <strong>${hellosThisWeek}/5 hellos</strong> this week.</p>
    <p>No pressure — you've got flexibility! Just wanted to make sure you don't miss your weekly goal.</p>
    <p>Every hello counts. Log them when you're ready!</p>
    <p>— Remi 🦝</p>
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
        from: 'Remi from One Hello <remi@onehello.io>',
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
  
  // Parse timezone offset like "+05:30" or "-08:00"
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

function isWeekday(): boolean {
  const day = new Date().getUTCDay()
  return day >= 1 && day <= 5
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Verify authorization
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

    // Get all users with their email preferences
    const { data: users, error: usersError } = await supabase
      .from('user_progress')
      .select(`
        user_id,
        current_phase,
        onboarding_email_opt_in,
        daily_email_opt_in,
        chill_email_opt_in,
        current_day,
        hellos_today_count,
        hellos_this_week,
        mode
      `)

    if (usersError) {
      console.error('Error fetching users:', usersError)
      throw usersError
    }

    console.log(`Found ${users?.length || 0} users to check`)

    let emailsSent = 0

    for (const user of users || []) {
      // Get user's email and profile info
      const { data: authUser } = await supabase.auth.admin.getUserById(user.user_id)
      if (!authUser?.user?.email) {
        console.log(`No email for user ${user.user_id}`)
        continue
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, timezone_preference')
        .eq('id', user.user_id)
        .single()

      const timezone = profile?.timezone_preference || '+00:00'
      const localHour = getUserLocalHour(timezone)
      
      // Only send emails around 8am local time (7-9am window)
      if (localHour < 7 || localHour > 9) {
        continue
      }

      const email = authUser.user.email
      const username = profile?.username || 'Friend'

      // Check if we already sent an email today
      const today = new Date().toISOString().split('T')[0]
      const { data: existingLog } = await supabase
        .from('email_logs')
        .select('id')
        .eq('user_id', user.user_id)
        .gte('sent_at', `${today}T00:00:00Z`)
        .limit(1)

      if (existingLog && existingLog.length > 0) {
        console.log(`Already sent email to ${user.user_id} today`)
        continue
      }

      let shouldSend = false
      let subject = ''
      let html = ''
      let templateKey = ''

      // Determine which email to send based on phase
      if (user.current_phase === 'onboarding' && user.onboarding_email_opt_in) {
        const day = user.current_day || 1
        if (day >= 1 && day <= 7 && onboardingTemplates[day]) {
          shouldSend = true
          subject = onboardingTemplates[day].subject
          html = onboardingTemplates[day].html.replace('{{username}}', username)
          templateKey = `onboarding_day_${day}`
        }
      } else if (user.current_phase === 'daily_path' && user.daily_email_opt_in) {
        // Only send if no hello logged today
        if ((user.hellos_today_count || 0) === 0) {
          shouldSend = true
          subject = dailyPathTemplate.subject
          html = dailyPathTemplate.html
          templateKey = 'daily_path_reminder'
        }
      } else if (user.current_phase === 'chill_path' && user.chill_email_opt_in) {
        // Only send Mon-Fri if under 5 hellos this week
        if (isWeekday() && (user.hellos_this_week || 0) < 5) {
          shouldSend = true
          subject = chillPathTemplate.subject
          html = chillPathTemplate.html(user.hellos_this_week || 0)
          templateKey = 'chill_path_reminder'
        }
      }

      if (shouldSend) {
        const sent = await sendEmail(email, subject, html)
        if (sent) {
          // Log the email
          await supabase.from('email_logs').insert({
            user_id: user.user_id,
            email_type: user.current_phase,
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
