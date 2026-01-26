import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  getGuestState,
  getGuestProgress,
  getGuestHelloLogs,
  clearGuestData,
  updateGuestState
} from '@/lib/indexedDB';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPublicAppOrigin } from '@/lib/publicUrls';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'syncing' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    const canonicalOrigin = getPublicAppOrigin();

    // If the callback lands on a preview/staging origin, forward to the public app origin,
    // preserving all tokens/query params so sign-in completes on the canonical domain.
    if (typeof window !== 'undefined' && window.location.origin !== canonicalOrigin) {
      const target = `${canonicalOrigin}${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.replace(target);
      return;
    }

    const callbackKey = `onehello:authcb:${window.location.pathname}${window.location.search}${window.location.hash}`;

    // React StrictMode can mount/unmount components twice in dev, which can consume one-time
    // auth codes twice. sessionStorage survives remounts, so we guard here.
    if (sessionStorage.getItem(callbackKey) === '1') {
      setMessage('Finishing sign-in...');
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) navigate('/', { replace: true });
        else navigate('/signin', { replace: true });
      });
      return;
    }

    sessionStorage.setItem(callbackKey, '1');

    const handleCallback = async () => {
      try {
        // Check for error in URL params (redirects can include error in query string)
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (errorParam) {
          throw new Error(errorDescription || errorParam);
        }

        // First, check if there's already a valid session
        const { data: { session: existingSession } } = await supabase.auth.getSession();

        if (existingSession?.user) {
          await setupUserAndRedirect(existingSession.user.id, existingSession.user);
          return;
        }

        // Check for tokens in URL hash (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const errorInHash = hashParams.get('error');
        const errorDescInHash = hashParams.get('error_description');
        const authType = hashParams.get('type'); // 'recovery' for password reset

        if (errorInHash) {
          throw new Error(errorDescInHash || errorInHash);
        }

        if (accessToken && refreshToken) {
          const { data, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) throw setSessionError;

          if (data.user) {
            // Clear the hash from URL to prevent re-processing on refresh
            window.history.replaceState(null, '', window.location.pathname);
            const isRecovery = authType === 'recovery';
            await setupUserAndRedirect(data.user.id, data.user, isRecovery);
            return;
          }
        }

        // Check for code in query params (PKCE flow)
        const code = searchParams.get('code');
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) throw exchangeError;

          if (data.user) {
            // Clear the query params after consuming the one-time code
            window.history.replaceState(null, '', window.location.pathname);
            await setupUserAndRedirect(data.user.id, data.user);
            return;
          }
        }

        throw new Error('No valid authentication found. The link may have expired.');

      } catch (error) {
        console.error('Auth callback error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Something went wrong';

        // Allow retry if we failed
        sessionStorage.removeItem(callbackKey);

        setStatus('error');
        setMessage('Unable to sign in');
        setErrorDetails(errorMessage);
      }
    };

    const timer = setTimeout(handleCallback, 50);
    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  const setupUserAndRedirect = async (userId: string, user: { email?: string; user_metadata?: { name?: string } }, isRecovery: boolean = false) => {
    try {
      // If this is a password recovery flow, redirect to profile to set new password
      if (isRecovery) {
        toast.success('You can now set a new password.');
        navigate('/profile?reset_password=true', { replace: true });
        return;
      }

      // Check if this user has guest data to sync
      const guestState = await getGuestState();
      
      if (guestState && !guestState.account_linked && guestState.total_hellos_logged > 0) {
        setStatus('syncing');
        setMessage('Syncing your hellos to the cloud...');
        
        await syncGuestDataToCloud(userId);
      }

      // Ensure profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      
      if (!profile) {
        // Auto-detect browser timezone for new users
        const { detectBrowserTimezoneOffset } = await import('@/lib/timezone');
        const detectedTimezone = detectBrowserTimezoneOffset();
        
        await supabase.from('profiles').insert({
          id: userId,
          username: user.user_metadata?.name || 'Friend',
          email: user.email,
          timezone_preference: detectedTimezone,
        });
      }

      // Check if user has progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (!progress) {
        // Create minimal progress for newly signed-in users.
        // We no longer use legacy "first_hellos" onboarding; send users straight to Home.
        await supabase.from('user_progress').insert({
          user_id: userId,
          current_streak: 0,
          current_day: 1,
          is_onboarding_week: false,
          has_completed_onboarding: true,
          current_phase: 'active',
          mode: 'daily',
          target_hellos_per_week: 7,
          selected_pack_id: 'starter-pack',
        });
      } else {
        // Normalize legacy rows so returning users don't get stuck in onboarding
        await supabase
          .from('user_progress')
          .update({
            has_completed_onboarding: true,
            is_onboarding_week: false,
            current_phase: 'active',
            mode: 'daily',
          })
          .eq('user_id', userId);
      }

      // Send welcome email for new users
      try {
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-notifications?action=send-welcome`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ user_id: userId }),
        });
      } catch (emailError) {
        console.log('Welcome email trigger failed (non-blocking):', emailError);
      }

      toast.success('Welcome! Your progress is saved.');
      navigate('/', { replace: true });
    } catch (setupError) {
      console.error('Setup error:', setupError);
      // Still redirect even if setup partially fails
      toast.success('Signed in!');
      navigate('/', { replace: true });
    }
  };

  const handleTryAgain = () => {
    navigate('/signin', { replace: true });
  };

  const handleContinueAsGuest = () => {
    navigate('/', { replace: true });
  };

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">{message}</h2>
            {errorDetails && (
              <p className="text-sm text-muted-foreground">{errorDetails}</p>
            )}
          </div>
          <div className="space-y-3">
            <Button onClick={handleTryAgain} className="w-full">
              Try signing in again
            </Button>
            <Button onClick={handleContinueAsGuest} variant="outline" className="w-full">
              Continue as guest
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

async function syncGuestDataToCloud(userId: string) {
  const guestProgress = await getGuestProgress();
  const guestLogs = await getGuestHelloLogs();
  
  if (!guestProgress && guestLogs.length === 0) {
    return;
  }

  // Sync progress
  if (guestProgress) {
    const { error: progressError } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        current_streak: guestProgress.current_streak,
        current_day: guestProgress.current_day,
        last_completed_date: guestProgress.last_completed_date,
        target_hellos_per_week: guestProgress.target_hellos_per_week,
        hellos_this_week: guestProgress.hellos_this_week,
        weekly_streak: guestProgress.weekly_streak,
        daily_streak: guestProgress.daily_streak,
        longest_streak: guestProgress.longest_streak,
        is_onboarding_week: guestProgress.is_onboarding_week,
        onboarding_week_start: guestProgress.onboarding_week_start,
        week_start_date: guestProgress.week_start_date,
        has_completed_onboarding: guestProgress.has_completed_onboarding,
        orbs: guestProgress.orbs,
        has_received_first_orb: guestProgress.has_received_first_orb,
        total_hellos: guestProgress.total_hellos,
        total_xp: guestProgress.total_xp,
        current_level: guestProgress.current_level,
        hellos_today_count: guestProgress.hellos_today_count,
        names_today_count: guestProgress.names_today_count,
        notes_today_count: guestProgress.notes_today_count,
        last_xp_reset_date: guestProgress.last_xp_reset_date,
        // Single mode now
        mode: 'daily',
        why_here: guestProgress.why_here,
        selected_pack_id: guestProgress.selected_pack_id,
        comfort_rating: guestProgress.comfort_rating,
      }, { onConflict: 'user_id' });
    
    if (progressError) {
      console.error('Error syncing progress:', progressError);
    }
  }

  // Sync hello logs
  if (guestLogs.length > 0) {
    const logsToInsert = guestLogs.map(log => ({
      user_id: userId,
      name: log.name,
      notes: log.notes,
      location: (log as any).location,
      rating: log.rating,
      difficulty_rating: log.difficulty_rating,
      timezone_offset: log.timezone_offset,
      created_at: log.created_at,
    }));

    const { error: logsError } = await supabase
      .from('hello_logs')
      .insert(logsToInsert);
    
    if (logsError) {
      console.error('Error syncing logs:', logsError);
    }
  }

  // Mark guest data as synced and clear it
  await updateGuestState({ account_linked: true });
  await clearGuestData();
}
