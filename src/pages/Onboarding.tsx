import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAssetPreloader } from "@/hooks/useAssetPreloader";
import { scheduleBackgroundTask, fireAndForget } from "@/lib/backgroundTask";

// Remi images
import remiWaving4 from "@/assets/remi-waving-4.webp";
import remiShakingHand from "@/assets/remi-shaking-hand.webp";
import remiCurious4 from "@/assets/remi-curious-4.webp";
import remiSad5 from "@/assets/remi-sad-5.webp";
import remiCelebrating9 from "@/assets/remi-celebrating-9.webp";
import remiCelebrating7 from "@/assets/remi-celebrating-7.webp";
import remiCelebrating1 from "@/assets/remi-celebrating-1.webp";
import remiSmiling1 from "@/assets/remi-smiling-1.webp";
import remiLogging4 from "@/assets/remi-logging-4.webp";
import remiLogging5 from "@/assets/remi-logging-5.webp";
import onboardingFirsthello from "@/assets/onboarding-firsthello.webp";

const ONBOARDING_ASSETS = [
  remiWaving4, remiShakingHand, remiCurious4, remiSad5,
  remiCelebrating9, remiCelebrating7, remiCelebrating1,
  remiSmiling1, remiLogging4, remiLogging5, onboardingFirsthello
];

export type OnboardingStep = 
  | 'welcome'
  | 'greeting'
  | 'reflection'
  | 'acknowledgement'
  | 'challenge_intro'
  | 'public_place'
  | 'first_hello_prompt'   // 7a - yes, public place
  | 'first_hello_done'     // 8a - completed first hello
  | 'log_hello'            // 9a - add to hellobook
  | 'skip_for_now'         // 9b - skip logging
  | 'at_home';             // 7b - not in public

type ReflectionAnswer = 'this_week' | 'last_week' | 'few_weeks' | 'dont_remember' | null;

const RemiImage = memo(({ src, alt, className = "w-48 h-auto max-h-48 mx-auto object-contain", priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) => (
  <img src={src} alt={alt} className={className} loading={priority ? "eager" : "lazy"} decoding="async" />
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

    if (!user) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      user = data.user;
    }
    if (!user) throw new Error('No user session');

    const userId = user.id;
    const displayName = userName.trim() || (user.is_anonymous ? 'Guest' : 'Friend');

    const profilePromise = supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: displayName,
        is_anonymous: user.is_anonymous === true,
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
      daily_mode_active: true,
      daily_mode_current_streak: opts?.loggedFirstHello ? 1 : 0,
      daily_mode_start_date: new Date().toISOString(),
      challenge_completed_days: opts?.loggedFirstHello ? [1] : [],
      challenge_started_at: new Date().toISOString(),
      selected_pack_id: '30-day-hello',
      current_streak: opts?.loggedFirstHello ? 1 : 0,
    };

    if (opts?.loggedFirstHello) {
      progressData.daily_mode_last_hello_date = new Date().toISOString().split('T')[0];
    }

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
  }, [userName]);

  const logFirstHello = useCallback(async (userId: string) => {
    const { detectBrowserTimezoneOffset, getDayKeyInOffset } = await import('@/lib/timezone');
    const detectedOffset = detectBrowserTimezoneOffset();
    const today = getDayKeyInOffset(new Date(), detectedOffset);

    await supabase.from('hello_logs').insert({
      user_id: userId,
      name: connectionName.trim() || null,
      location: connectionLocation.trim() || null,
      notes: connectionNotes.trim() || `One Hello 7-Day Challenge | Day 1 | First Hello`,
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
    // After logging hello, go straight to walkthrough (skip "No worries" screen)
    setIsSubmitting(true);
    try {
      const { userId } = await ensureUserAndProgress({ loggedFirstHello: true });
      await logFirstHello(userId);
      // Go straight to home with tutorial
      sessionStorage.setItem('pending_home_tutorial', '1');
      window.location.replace('/');
    } catch (error) {
      console.error('Error saving connection:', error);
      setIsSubmitting(false);
    }
  }, [ensureUserAndProgress, logFirstHello]);

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
        notes: `One Hello 7-Day Challenge | Day 1 | First Hello`,
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
    fireAndForget(async () => {
      try {
        // Pass loggedFirstHello if the user completed it during onboarding
        await ensureUserAndProgress({ loggedFirstHello: firstHelloLogged });
      } catch (error) {
        console.error('Background onboarding error:', error);
      }
    });
    window.location.replace('/');
  }, [ensureUserAndProgress, firstHelloLogged]);

  const progress = useMemo(() => {
    const steps: OnboardingStep[] = [
      'welcome', 'greeting', 'reflection', 'acknowledgement',
      'challenge_intro', 'public_place', 'first_hello_prompt',
      'first_hello_done', 'log_hello', 'skip_for_now', 'at_home'
    ];
    const index = steps.indexOf(step);
    return Math.max(0.1, Math.min(1, (index + 1) / 8));
  }, [step]);

  const baseClasses = "text-center space-y-6";
  const animClasses = "animate-in fade-in slide-in-from-bottom-4 duration-300";

  const screenContent = useMemo(() => {
    switch (step) {
      case 'welcome':
        return (
          <div className={`${baseClasses} ${animClasses}`}>
            <RemiImage src={remiWaving4} alt="Remi waving" className="w-56 h-56 mx-auto object-contain" priority />
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
                <Button key={key} onClick={() => setStep('acknowledgement')} variant="outline" className="w-full h-12 text-base" size="lg">
                  {label}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'acknowledgement':
        return (
          <div className={`${baseClasses} ${animClasses}`}>
            <RemiImage src={remiSad5} alt="Remi thoughtful" className="w-44 h-auto max-h-44 mx-auto object-contain" />
            <div className="space-y-4">
              <p className="text-lg text-foreground leading-relaxed font-medium">
                Most of us go days, even weeks, without talking to someone new.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                What if you changed that, starting today?
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button onClick={() => setStep('challenge_intro')} className="w-full" size="lg">
                I'm in
              </Button>
              <Button onClick={() => setStep('challenge_intro')} variant="outline" className="w-full" size="lg">
                Tell me more
              </Button>
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
              <p className="text-lg font-semibold text-foreground">7 Days. 7 Strangers. 7 Hellos.</p>
              <p className="text-muted-foreground">Are you up for it?</p>
            </div>
            <Button onClick={() => setStep('public_place')} className="w-full" size="lg">
              Let's do it 🚀
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
                I'll do this later
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
              <Button onClick={() => completeOnboarding(true)} variant="ghost" className="w-full text-muted-foreground" size="lg">
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
            <Button onClick={() => completeOnboarding(true)} className="w-full" size="lg">
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
              Continue
            </Button>
          </div>
        );

      default:
        return null;
    }
  }, [step, userName, connectionName, connectionLocation, connectionNotes, isSubmitting, navigate, handleSaveConnection, handleFirstHelloDone, completeOnboarding]);

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
