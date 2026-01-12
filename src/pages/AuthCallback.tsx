import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  getGuestState, 
  getGuestProgress, 
  getGuestHelloLogs, 
  clearGuestData,
  updateGuestState 
} from '@/lib/indexedDB';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'syncing' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session?.user) {
          // Try to exchange the code from URL
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (setSessionError) throw setSessionError;
          } else {
            throw new Error('No session found');
          }
        }

        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw userError || new Error('No user found');

        // Check if this user has guest data to sync
        const guestState = await getGuestState();
        
        if (guestState && !guestState.account_linked && guestState.total_hellos_logged > 0) {
          setStatus('syncing');
          setMessage('Syncing your hellos to the cloud...');
          
          await syncGuestDataToCloud(user.id);
        }

        // Ensure profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!profile) {
          // Create profile
          await supabase.from('profiles').insert({
            id: user.id,
            username: user.user_metadata?.name || 'Friend',
            email: user.email,
          });
        }

        // Check if user has progress
        const { data: progress } = await supabase
          .from('user_progress')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!progress) {
          // Create initial progress
          await supabase.from('user_progress').insert({
            user_id: user.id,
            current_streak: 0,
            current_day: 1,
            is_onboarding_week: true,
            onboarding_week_start: new Date().toISOString().split('T')[0],
            mode: 'first_hellos',
          });
        }

        toast.success('Welcome! Your progress is saved.');
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
        
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center space-y-4">
        {status !== 'error' && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        )}
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
        mode: guestProgress.mode,
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
      hello_type: log.hello_type,
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
