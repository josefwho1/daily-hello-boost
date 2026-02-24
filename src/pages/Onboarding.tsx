import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAssetPreloader } from "@/hooks/useAssetPreloader";
import { scheduleBackgroundTask, fireAndForget } from "@/lib/backgroundTask";
import { setCachedProgress, getCachedProgress } from "@/lib/offlineCache";

// Remi images
import remiWaving4 from "@/assets/remi-waving-4.webp";
import remiShakingHand from "@/assets/remi-shaking-hand.webp";
import remiCurious4 from "@/assets/remi-curious-4.webp";
import remiWaving3 from "@/assets/remi-waving-3.webp";
import remiSad5 from "@/assets/remi-sad-5.webp";
import remiCelebrating9 from "@/assets/remi-celebrating-9.webp";
import remiCelebrating7 from "@/assets/remi-celebrating-7.webp";
import remiCelebrating1 from "@/assets/remi-celebrating-1.webp";
import remiSmiling1 from "@/assets/remi-smiling-1.webp";
import remiLogging4 from "@/assets/remi-logging-4.webp";
import remiLogging5 from "@/assets/remi-logging-5.webp";
import remiLogging6 from "@/assets/remi-logging-6.webp";
import onboardingFirsthello from "@/assets/onboarding-firsthello.webp";
import onboardingWeatherchat from "@/assets/onboarding-weatherchat.webp";

const ONBOARDING_ASSETS = [
  remiWaving4, remiShakingHand, remiCurious4, remiWaving3, remiSad5,
  remiCelebrating9, remiCelebrating7, remiCelebrating1,
  remiSmiling1, remiLogging4, remiLogging5, remiLogging6, onboardingFirsthello, onboardingWeatherchat
];

// Preload the first screen image immediately at module level (no waiting for React)
const _preloadWelcome = new Image();
_preloadWelcome.src = remiWaving4;

export type OnboardingStep = 
  | 'welcome'
  | 'greeting'
  | 'reflection'
  | 'acknowledgement'
  | 'research'
  | 'why_here'
  | 'challenge_intro'
  | 'public_place'
  | 'first_hello_prompt'   // 7a - yes, public place
  | 'first_hello_done'     // 8a - completed first hello
  | 'log_hello'            // 9a - add to hellobook
  | 'skip_for_now'         // 9b - skip logging
  | 'at_home'              // 7b - not in public
  | 'weather_chat_reveal'; // Day 2 reveal

type ReflectionAnswer = 'this_week' | 'last_week' | 'few_weeks' | 'dont_remember' | null;

const RemiImage = memo(({ src, alt, className = "w-48 h-auto max-h-48 mx-auto object-contain" }: { src: string; alt: string; className?: string }) => (
  <img src={src} alt={alt} className={className} loading="eager" decoding="sync" />
));
RemiImage.displayName = 'RemiImage';

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [connectionLocation, setConnectionLocation] = useState('');
  const [connectionNotes, setConnectionNotes] = useState('');
  const [whyHere, setWhyHere] = useState<string | null>(null);

  const { isLoaded: assetsReady } = useAssetPreloader(ONBOARDING_ASSETS);

  // Auto-advance from greeting
  useEffect(() => {
    if (step === 'greeting' && userName.trim()) {
      const timer = setTimeout(() => setStep('reflection'), 1800);
      return () => clearTimeout(timer);
    }
  }, [step, userName]);

  const ensureUserAndProgress = useCallback(async (opts?: { loggedFirstHello?: boolean }): Promise<{ userId: string }> => {
    const { data: sessionData } = await supabase.auth.getSession();
    let user = sessionData?.session?.user || null;

    // If there's already a non-anonymous (real) user session, sign them out first.
    // Onboarding always creates a NEW guest account — it must never overwrite existing users.
    if (user && !user.is_anonymous) {
      await supabase.auth.signOut();
      user = null;
    }

    if (!user) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      user = data.user;
    }
    if (!user) throw new Error('No user session');

    const userId = user.id;
    const displayName = userName.trim() || 'Guest';

    const profilePromise = supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: displayName,
        is_anonymous: true,
        hide_from_leaderboard: false,
      }, { onConflict: 'id' });

    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    const progressData: Record<string, unknown> = {
      has_completed_onboarding: true,
      onboarding_completed_at: new Date().toISOString(),
      is_onboarding_week: false,
      mode: 'daily',
      current_phase: 'active',
      username: displayName,
      has_seen_welcome_messages: false,
      daily_mode_active: false,
      daily_mode_current_streak: 0,
      daily_mode_start_date: null,
      challenge_completed_days: opts?.loggedFirstHello ? [1] : [],
      challenge_started_at: new Date().toISOString(),
      selected_pack_id: '30-day-hello',
      current_streak: opts?.loggedFirstHello ? 1 : 0,
      why_here: whyHere,
    };

    // daily_mode_last_hello_date is not set here — daily mode activates after 7-day challenge

    const progressPromise = existingProgress
      ? supabase.from('user_progress').update(progressData).eq('user_id', userId)
      : supabase.from('user_progress').insert({
          user_id: userId,
          current_streak: 0,
          current_day: 1,
          target_hellos_per_week: 7,
          selected_pack_id: '30-day-hello',
          ...progressData,
        });

    const [profileResult, progressResult] = await Promise.all([profilePromise, progressPromise]);
    if (profileResult.error) throw profileResult.error;
    if (progressResult.error) throw progressResult.error;

    return { userId };
  }, [userName, whyHere]);

  const logFirstHello = useCallback(async (userId: string) => {
    const { detectBrowserTimezoneOffset, getDayKeyInOffset } = await import('@/lib/timezone');
    const detectedOffset = detectBrowserTimezoneOffset();
    const today = getDayKeyInOffset(new Date(), detectedOffset);

    await supabase.from('hello_logs').insert({
      user_id: userId,
      name: connectionName.trim() || null,
      location: connectionLocation.trim() || null,
      notes: connectionNotes.trim() || null,
      timezone_offset: detectedOffset,
      hello_type: 'challenge:1',
    });

    scheduleBackgroundTask(async () => {
      const { data: currentProgress } = await supabase
        .from('user_progress')
        .select('total_hellos, hellos_this_week')
        .eq('user_id', userId)
        .maybeSingle();

      await supabase.from('user_progress').update({
        last_completed_date: today,
        total_hellos: (currentProgress?.total_hellos ?? 0) + 1,
        hellos_this_week: (currentProgress?.hellos_this_week ?? 0) + 1,
      }).eq('user_id', userId);

      await supabase.from('profiles').update({
        timezone_preference: detectedOffset,
      }).eq('id', userId);
    });
  }, [connectionName, connectionLocation, connectionNotes]);

  const handleSaveConnection = useCallback(async () => {
    // User already completed first hello via handleFirstHelloDone - just update the existing log with details
    setIsSubmitting(true);
    try {
      const { userId } = await ensureUserAndProgress({ loggedFirstHello: true });
      
      // Update the existing challenge:1 hello log with user-provided details
      const { data: existingLog } = await supabase
        .from('hello_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('hello_type', 'challenge:1')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingLog) {
        await supabase.from('hello_logs').update({
          name: connectionName.trim() || null,
          location: connectionLocation.trim() || null,
          notes: connectionNotes.trim() || null,
        }).eq('id', existingLog.id);
      }

      // Show Weather Chat reveal before going home
      setStep('weather_chat_reveal');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error saving connection:', error);
      setIsSubmitting(false);
    }
  }, [ensureUserAndProgress, connectionName, connectionLocation, connectionNotes]);

  const handleFirstHelloDone = useCallback(async () => {
    setStep('first_hello_done');
    setFirstHelloLogged(true);
    setIsSubmitting(true);
    try {
      const { userId } = await ensureUserAndProgress({ loggedFirstHello: true });
      // Log with default challenge notes
      const { detectBrowserTimezoneOffset } = await import('@/lib/timezone');
      const detectedOffset = detectBrowserTimezoneOffset();
      await supabase.from('hello_logs').insert({
        user_id: userId,
        notes: null,
        timezone_offset: detectedOffset,
        hello_type: 'challenge:1',
      });
      
      scheduleBackgroundTask(async () => {
        const today = (await import('@/lib/timezone')).getDayKeyInOffset(new Date(), detectedOffset);
        const { data: currentProgress } = await supabase
          .from('user_progress')
          .select('total_hellos, hellos_this_week')
          .eq('user_id', userId)
          .maybeSingle();
        await supabase.from('user_progress').update({
          last_completed_date: today,
          total_hellos: (currentProgress?.total_hellos ?? 0) + 1,
          hellos_this_week: (currentProgress?.hellos_this_week ?? 0) + 1,
          daily_mode_last_hello_date: today,
          daily_mode_current_streak: 1,
        }).eq('user_id', userId);
      });
    } catch (error) {
      console.error('Error logging first hello:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [ensureUserAndProgress]);

  // Track whether the first hello was already logged in this session
  const [firstHelloLogged, setFirstHelloLogged] = useState(false);

  const completeOnboarding = useCallback(async (showTutorial: boolean) => {
    if (showTutorial) {
      sessionStorage.setItem('pending_home_tutorial', '1');
    }
    // ALWAYS set the cache before navigating, even if DB write fails.
    // This prevents a redirect loop where / sends the user back to /onboarding.
    const cached = getCachedProgress<Record<string, unknown>>();
    const displayName = userName.trim() || 'Friend';
    setCachedProgress({
      ...(cached || {}),
      has_completed_onboarding: true,
      onboarding_completed_at: new Date().toISOString(),
      current_phase: 'active',
      is_onboarding_week: false,
      username: displayName,
      selected_pack_id: cached?.selected_pack_id || '30-day-hello',
      mode: 'daily',
      daily_mode_active: false,
      why_here: whyHere,
    });
    try {
      await ensureUserAndProgress({ loggedFirstHello: firstHelloLogged });
    } catch (error) {
      console.error('Onboarding completion error:', error);
    }
    window.location.replace('/');
  }, [ensureUserAndProgress, firstHelloLogged, userName, whyHere]);

  const progress = useMemo(() => {
    const steps: OnboardingStep[] = [
      'welcome', 'greeting', 'reflection', 'acknowledgement', 'research',
      'why_here', 'challenge_intro', 'public_place', 'first_hello_prompt',
      'first_hello_done', 'log_hello', 'skip_for_now', 'at_home'
    ];
    const index = steps.indexOf(step);
    return Math.max(0.1, Math.min(1, (index + 1) / 9));
  }, [step]);

  const baseClasses = "text-center space-y-6";
  const animClasses = "animate-in fade-in slide-in-from-bottom-4 duration-300";

  const screenContent = useMemo(() => {
    switch (step) {
      case 'welcome':
        return (
          <div className={`${baseClasses} ${animClasses}`}>
            <RemiImage src={remiWaving4} alt="Remi waving" className="w-56 h-56 mx-auto object-contain" />
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground">Welcome to One Hello!</h1>
              <p className="text-lg text-muted-foreground">I'm Remi.</p>
            </div>
            <div className="space-y-2 pt-2">
              <label htmlFor="userName" className="text-sm font-medium text-foreground">What's your name?</label>
              <Input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="text-center text-lg h-12"
                autoComplete="given-name"
              />
            </div>
            <Button onClick={() => setStep('greeting')} className="w-full" size="lg" disabled={!userName.trim()}>
              Continue
            </Button>
            <button onClick={() => navigate('/signin')} className="text-sm text-muted-foreground hover:text-primary underline">
              I already have an account
            </button>
          </div>
        );

      case 'greeting':
        return (
          <div className={`${baseClasses} animate-in fade-in zoom-in duration-200`}>
            <RemiImage src={remiShakingHand} alt="Remi shaking hand" className="w-56 h-auto max-h-56 mx-auto object-contain" />
            <h1 className="text-2xl font-bold text-foreground animate-in fade-in slide-in-from-bottom-2 duration-150 delay-100">
              Nice to meet you, {userName.trim()}! 👋
            </h1>
          </div>
        );

      case 'reflection':
        return (
          <div className={`${baseClasses} ${animClasses}`}>
            <RemiImage src={remiCurious4} alt="Remi curious" className="w-44 h-auto max-h-44 mx-auto object-contain" />
            <div className="space-y-3">
              <h1 className="text-xl font-bold text-foreground">When's the last time you started a conversation with a stranger?</h1>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              {[
                { key: 'this_week', label: 'This week' },
                { key: 'last_week', label: 'Last week' },
                { key: 'few_weeks', label: 'A few weeks ago' },
                { key: 'dont_remember', label: "I don't remember" },
              ].map(({ key, label }) => (
                <Button key={key} onClick={() => setStep('research')} variant="outline" className="w-full h-12 text-base" size="lg">
                  {label}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'research':
        return (
          <div className={`${baseClasses} ${animClasses}`}>
            <RemiImage src={remiLogging6} alt="Remi with research" className="w-44 h-auto max-h-44 mx-auto object-contain" />
            <div className="space-y-4">
              <p className="text-lg text-foreground leading-relaxed font-medium">
                Research shows even brief conversations with strangers increase happiness.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ready to try it?
              </p>
            </div>
            <Button onClick={() => setStep('why_here')} className="w-full" size="lg">
              I'm curious
            </Button>
          </div>
        );

      case 'why_here':
        return (
          <div className={`${baseClasses} ${animClasses}`}>
            <RemiImage src={remiWaving3} alt="Remi waving" className="w-44 h-auto max-h-44 mx-auto object-contain" />
            <div className="space-y-3">
              <h1 className="text-xl font-bold text-foreground">One quick thing...</h1>
              <p className="text-muted-foreground">What brings you to One Hello?</p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              {[
                { value: 'more_social', label: '🤝 Want to be more social' },
                { value: 'disconnected', label: '😶 Feeling a bit disconnected' },
                { value: 'new_place', label: '🏙️ Just moved somewhere new' },
                { value: 'curious', label: '👀 Just curious' },
              ].map(({ value, label }) => (
                <Button
                  key={value}
                  onClick={() => {
                    setWhyHere(value);
                    setStep('challenge_intro');
                  }}
                  variant="outline"
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'challenge_intro':
        return (
          <div className={`${baseClasses} ${animClasses}`}>
            <RemiImage src={remiCelebrating9} alt="Remi celebrating" className="w-48 h-auto max-h-48 mx-auto object-contain" />
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-medium">Introducing the…</p>
              <h1 className="text-2xl font-bold text-foreground">One Hello 7-Day Challenge</h1>
              <p className="text-muted-foreground">One small action a day.</p>
              <p className="text-lg font-semibold text-foreground">7 Days. 7 Hellos.</p>
              <p className="text-muted-foreground">Are you in?</p>
            </div>
            <Button onClick={() => setStep('public_place')} className="w-full" size="lg">
              Let's do it
            </Button>
          </div>
        );

      case 'public_place':
        return (
          <div className={`${baseClasses} ${animClasses}`}>
            <RemiImage src={remiCelebrating7} alt="Remi celebrating" className="w-48 h-auto max-h-48 mx-auto object-contain" />
            <h1 className="text-xl font-bold text-foreground">Are you in a public place right now?</h1>
            <div className="flex flex-col gap-3 pt-2">
              <Button onClick={() => setStep('first_hello_prompt')} className="w-full" size="lg">
                Yes
              </Button>
              <Button onClick={() => setStep('at_home')} variant="outline" className="w-full" size="lg">
                No, I'm at home
              </Button>
            </div>
          </div>
        );

      case 'first_hello_prompt':
        return (
          <div className={`${baseClasses} ${animClasses}`}>
            <RemiImage src={onboardingFirsthello} alt="First hello" className="w-64 h-auto max-h-56 mx-auto object-contain" />
            <div className="space-y-3">
              <h1 className="text-xl font-bold text-foreground">Perfect! Let's do Day 1 right now.</h1>
              <p className="text-muted-foreground leading-relaxed">
                Your challenge: <strong>Smile & say hello</strong> to someone new.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The barista. Someone in line. A stranger walking by.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                Just say "hello" or "good morning" — that's it.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button onClick={handleFirstHelloDone} className="w-full" size="lg">
                I did it! 🎉
              </Button>
              <Button onClick={() => setStep('at_home')} variant="ghost" className="w-full text-muted-foreground" size="lg">
                I'll do it later
              </Button>
            </div>
          </div>
        );

      case 'first_hello_done':
        return (
          <div className={`${baseClasses} ${animClasses}`}>
            <RemiImage src={remiCelebrating1} alt="Remi celebrating" className="w-48 h-auto max-h-48 mx-auto object-contain" />
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground">Day 1 complete! 🎉</h1>
              <p className="text-muted-foreground leading-relaxed">You just said hello to a stranger!</p>
              <p className="text-muted-foreground">Want to remember them?</p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button onClick={() => setStep('log_hello')} className="w-full" size="lg">
                Add to Hellobook
              </Button>
              <Button onClick={() => setStep('weather_chat_reveal')} variant="ghost" className="w-full text-muted-foreground" size="lg">
                Skip for now
              </Button>
            </div>
          </div>
        );

      case 'log_hello':
        return (
          <div className={`${baseClasses} ${animClasses}`}>
            <RemiImage src={remiLogging4} alt="Remi logging" className="w-40 h-auto max-h-40 mx-auto object-contain" />
            <h1 className="text-xl font-bold text-foreground">Log your hello</h1>
            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <label htmlFor="connectionName" className="text-sm font-medium text-foreground">
                  Name <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input id="connectionName" type="text" value={connectionName} onChange={(e) => setConnectionName(e.target.value)} placeholder="Who did you meet?" className="h-11" autoComplete="off" />
              </div>
              <div className="space-y-2">
                <label htmlFor="connectionLocation" className="text-sm font-medium text-foreground">
                  Where you met <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input id="connectionLocation" type="text" value={connectionLocation} onChange={(e) => setConnectionLocation(e.target.value)} placeholder="Coffee shop, gym, work..." className="h-11" autoComplete="off" />
              </div>
              <div className="space-y-2">
                <label htmlFor="connectionNotes" className="text-sm font-medium text-foreground">
                  Notes <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input id="connectionNotes" type="text" value={connectionNotes} onChange={(e) => setConnectionNotes(e.target.value)} placeholder="Anything to remember them by..." className="h-11" autoComplete="off" />
              </div>
            </div>
            <Button onClick={handleSaveConnection} className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Log hello 👋"}
            </Button>
          </div>
        );

      case 'skip_for_now':
        return (
          <div className={`${baseClasses} ${animClasses}`}>
            <RemiImage src={remiLogging5} alt="Remi" />
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-foreground">No worries.</h1>
              <p className="text-muted-foreground leading-relaxed">
                Your Hellobook helps you remember everyone you meet.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Let's show you around.
              </p>
            </div>
            <Button onClick={() => setStep('weather_chat_reveal')} className="w-full" size="lg">
              Continue
            </Button>
          </div>
        );

      case 'at_home':
        return (
          <div className={`${baseClasses} ${animClasses}`}>
            <RemiImage src={remiSmiling1} alt="Remi smiling" />
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-foreground">No worries!</h1>
              <p className="text-muted-foreground leading-relaxed">
                One Hello works best when you're out in the world.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Next time you're out, come back to complete your First Hello.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                For now, let me show you around.
              </p>
            </div>
            <Button onClick={() => completeOnboarding(true)} className="w-full" size="lg">
              Show me around
            </Button>
          </div>
        );

      case 'weather_chat_reveal':
        return (
          <div className={`${baseClasses} ${animClasses}`}>
            <RemiImage src={onboardingWeatherchat} alt="Weather Chat" className="w-56 h-auto max-h-56 mx-auto object-contain" />
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground">Next: Weather Chat</h1>
              <p className="text-foreground">Comment on something you're both experiencing.</p>
              <p className="text-muted-foreground">Weather, long lines, vibes — anything shared.</p>
              <p className="text-muted-foreground italic text-sm">💡 "What a beautiful day" "Long line, hey?" "Great song"</p>
            </div>
            <Button onClick={() => completeOnboarding(true)} className="w-full" size="lg">
              Let's do it
            </Button>
          </div>
        );

      default:
        return null;
    }
  }, [step, userName, whyHere, connectionName, connectionLocation, connectionNotes, isSubmitting, navigate, handleSaveConnection, handleFirstHelloDone, completeOnboarding]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div className="h-full bg-primary transition-all duration-200 ease-out" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {screenContent}
        </div>
      </div>
    </div>
  );
}
