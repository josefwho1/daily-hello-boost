import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAssetPreloader } from "@/hooks/useAssetPreloader";
import { scheduleBackgroundTask, fireAndForget } from "@/lib/backgroundTask";

// Remi images - imported statically for bundler optimization
import remiWaving4 from "@/assets/remi-waving-4.webp";
import remiShakingHand from "@/assets/remi-shaking-hand.webp";
import remiSmiling1 from "@/assets/remi-smiling-1.webp";
import remiCurious4 from "@/assets/remi-curious-4.webp";
import remiLogging3 from "@/assets/remi-logging-3.webp";
import remiLogging4 from "@/assets/remi-logging-4.webp";
import remiLogging5 from "@/assets/remi-logging-5.webp";
import hellobookIcon from "@/assets/hellobook-icon.webp";

// All onboarding assets for preloading
const ONBOARDING_ASSETS = [
  remiWaving4, remiShakingHand, remiSmiling1, remiCurious4,
  remiLogging3, remiLogging4, remiLogging5, hellobookIcon
];

export type OnboardingStep = 
  | 'welcome'
  | 'greeting'
  | 'philosophy'
  | 'last_connection'
  | 'add_to_hellobook'
  | 'log_hello'
  | 'first_entry'
  | 'no_worries';

type LastConnectionAnswer = 'this_week' | 'last_week' | 'a_while_ago' | 'not_sure' | null;

// Memoized image component for instant rendering
const RemiImage = memo(({ 
  src, 
  alt, 
  className = "w-48 h-auto max-h-48 mx-auto object-contain",
  priority = false 
}: { 
  src: string; 
  alt: string; 
  className?: string;
  priority?: boolean;
}) => (
  <img 
    src={src} 
    alt={alt} 
    className={className}
    loading={priority ? "eager" : "lazy"}
    decoding="async"
  />
));
RemiImage.displayName = 'RemiImage';

// Skeleton placeholder for instant render
const ImageSkeleton = memo(({ className = "w-48 h-48" }: { className?: string }) => (
  <div className={`${className} mx-auto bg-muted rounded-lg animate-pulse`} />
));
ImageSkeleton.displayName = 'ImageSkeleton';

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Local state - kept lightweight
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState('');
  const [lastConnectionAnswer, setLastConnectionAnswer] = useState<LastConnectionAnswer>(null);
  const [connectionName, setConnectionName] = useState('');
  const [connectionLocation, setConnectionLocation] = useState('');
  const [connectionNotes, setConnectionNotes] = useState('');

  // Preload all assets immediately
  const { isLoaded: assetsReady } = useAssetPreloader(ONBOARDING_ASSETS);

  // Auto-advance from greeting - uses RAF for smooth timing
  useEffect(() => {
    if (step === 'greeting' && userName.trim()) {
      const timer = setTimeout(() => {
        setStep('philosophy');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [step, userName]);

  // Initialize user/guest progress - runs in background
  const ensureUserAndProgress = useCallback(async (): Promise<{ userId: string }> => {
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

    // Parallel upsert for speed
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

    const progressData = {
      has_completed_onboarding: true,
      onboarding_completed_at: new Date().toISOString(),
      is_onboarding_week: false,
      mode: 'daily',
      current_phase: 'active',
      username: displayName,
      has_seen_welcome_messages: false,
      daily_mode_active: true,
      daily_mode_current_streak: 0,
      daily_mode_start_date: new Date().toISOString(),
      challenge_completed_days: [],
      challenge_started_at: new Date().toISOString(),
    };

    const progressPromise = existingProgress
      ? supabase.from('user_progress').update(progressData).eq('user_id', userId)
      : supabase.from('user_progress').insert({
          user_id: userId,
          current_streak: 0,
          current_day: 1,
          target_hellos_per_week: 7,
          selected_pack_id: '',
          ...progressData,
        });

    // Wait for both in parallel
    const [profileResult, progressResult] = await Promise.all([profilePromise, progressPromise]);
    if (profileResult.error) throw profileResult.error;
    if (progressResult.error) throw progressResult.error;

    return { userId };
  }, [userName]);

  // Log first hello - background operation
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
    });

    // Update progress counts in background
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

  // Handle saving connection - optimistic UI
  const handleSaveConnection = useCallback(async () => {
    if (!connectionName.trim() && !connectionLocation.trim() && !connectionNotes.trim()) {
      toast({
        title: "Add some details",
        description: "Please fill in at least one field",
        variant: "destructive",
      });
      return;
    }

    // Transition immediately
    setStep('first_entry');
    setIsSubmitting(true);

    try {
      const { userId } = await ensureUserAndProgress();
      await logFirstHello(userId);
    } catch (error) {
      console.error('Error saving connection:', error);
      // Don't interrupt the flow for background errors
    } finally {
      setIsSubmitting(false);
    }
  }, [connectionName, connectionLocation, connectionNotes, ensureUserAndProgress, logFirstHello, toast]);

  // Complete onboarding - instant navigation
  const completeOnboarding = useCallback(async (showTutorial: boolean) => {
    // Set tutorial flag immediately
    if (showTutorial) {
      sessionStorage.setItem('pending_home_tutorial', '1');
    }

    // Start background work but don't wait
    fireAndForget(async () => {
      try {
        await ensureUserAndProgress();
      } catch (error) {
        console.error('Background onboarding error:', error);
      }
    });

    // Navigate immediately - don't block on API
    window.location.replace('/');
  }, [ensureUserAndProgress]);

  // Handle last connection answer - instant transition
  const handleLastConnectionSelect = useCallback((answer: LastConnectionAnswer) => {
    setLastConnectionAnswer(answer);
    // Transition immediately
    if (answer === 'this_week' || answer === 'last_week' || answer === 'a_while_ago') {
      setStep('add_to_hellobook');
    } else {
      setStep('no_worries');
    }
  }, []);

  // Progress calculation - memoized
  const progress = useMemo(() => {
    const stepOrder: OnboardingStep[] = [
      'welcome', 'greeting', 'philosophy', 'last_connection',
      'add_to_hellobook', 'log_hello', 'first_entry', 'no_worries'
    ];
    const index = stepOrder.indexOf(step);
    return Math.max(0.1, Math.min(1, (index + 1) / 6));
  }, [step]);

  // Screen content - renders based on current step
  const screenContent = useMemo(() => {
    const baseClasses = "text-center space-y-6";
    const transitionClasses = "transition-opacity duration-200 ease-out";

    switch (step) {
      case 'welcome':
        return (
          <div className={`${baseClasses} ${transitionClasses} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
            <RemiImage 
              src={remiWaving4} 
              alt="Remi waving" 
              className="w-56 h-56 mx-auto object-contain"
              priority
            />
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground">Welcome to One Hello</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">I'm Remi.</p>
            </div>
            <div className="space-y-2 pt-2">
              <label htmlFor="userName" className="text-sm font-medium text-foreground">
                What's your name?
              </label>
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
            <Button 
              onClick={() => setStep('greeting')} 
              className="w-full" 
              size="lg"
              disabled={!userName.trim()}
            >
              Continue
            </Button>
            <button 
              onClick={() => navigate('/signin')}
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              I already have an account
            </button>
          </div>
        );

      case 'greeting':
        return (
          <div className={`${baseClasses} ${transitionClasses} animate-in fade-in zoom-in duration-200`}>
            <RemiImage src={remiShakingHand} alt="Remi shaking hand" className="w-56 h-auto max-h-56 mx-auto object-contain" />
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150 delay-100">
              <h1 className="text-2xl font-bold text-foreground">
                Nice to meet you, {userName.trim()}! 👋
              </h1>
            </div>
          </div>
        );

      case 'philosophy':
        return (
          <div className={`${baseClasses} ${transitionClasses} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
            <RemiImage src={remiSmiling1} alt="Remi smiling" />
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-foreground leading-relaxed">
                A stranger is simply someone whose story we don't know yet.
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                I'm here to remind you to say hello and see what happens.
              </p>
            </div>
            <Button onClick={() => setStep('last_connection')} className="w-full" size="lg">
              Continue
            </Button>
          </div>
        );

      case 'last_connection':
        return (
          <div className={`${baseClasses} ${transitionClasses} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
            <RemiImage src={remiCurious4} alt="Remi curious" className="w-44 h-auto max-h-44 mx-auto object-contain" />
            <div className="space-y-3">
              <p className="text-lg text-foreground leading-relaxed font-medium">
                Think back to the last new person you met.
              </p>
              <p className="text-muted-foreground">How long ago was that?</p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              {(['this_week', 'last_week', 'a_while_ago', 'not_sure'] as const).map((answer) => (
                <Button 
                  key={answer}
                  onClick={() => handleLastConnectionSelect(answer)}
                  variant="outline"
                  className="w-full h-12 text-base" 
                  size="lg"
                >
                  {answer === 'this_week' ? 'This week' : 
                   answer === 'last_week' ? 'Last week' : 
                   answer === 'a_while_ago' ? 'A while ago' : "I'm not sure"}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'add_to_hellobook':
        return (
          <div className={`${baseClasses} ${transitionClasses} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
            <RemiImage src={remiLogging4} alt="Remi logging" className="w-44 h-auto max-h-44 mx-auto object-contain" />
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-foreground">Want to capture that story?</h1>
              <p className="text-muted-foreground leading-relaxed">You can add it to your Hellobook.</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A place to remember names and small details from people you meet.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button onClick={() => setStep('log_hello')} className="w-full" size="lg">
                Add to Hellobook
              </Button>
              <Button 
                onClick={() => setStep('no_worries')}
                variant="ghost"
                className="w-full text-muted-foreground" 
                size="lg"
              >
                I'll do this later
              </Button>
            </div>
          </div>
        );

      case 'log_hello':
        return (
          <div className={`${baseClasses} ${transitionClasses} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
            <RemiImage src={remiLogging3} alt="Remi logging" className="w-40 h-auto max-h-40 mx-auto object-contain" />
            <h1 className="text-xl font-bold text-foreground">Log your hello</h1>
            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <label htmlFor="connectionName" className="text-sm font-medium text-foreground">
                  Name <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input
                  id="connectionName"
                  type="text"
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                  placeholder="Who did you meet?"
                  className="h-11"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="connectionLocation" className="text-sm font-medium text-foreground">
                  Where you met <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input
                  id="connectionLocation"
                  type="text"
                  value={connectionLocation}
                  onChange={(e) => setConnectionLocation(e.target.value)}
                  placeholder="Coffee shop, gym, work..."
                  className="h-11"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="connectionNotes" className="text-sm font-medium text-foreground">
                  Notes <span className="text-muted-foreground text-xs">(optional)</span>
                </label>
                <Input
                  id="connectionNotes"
                  type="text"
                  value={connectionNotes}
                  onChange={(e) => setConnectionNotes(e.target.value)}
                  placeholder="Anything to remember them by..."
                  className="h-11"
                  autoComplete="off"
                />
              </div>
            </div>
            <Button 
              onClick={handleSaveConnection}
              className="w-full" 
              size="lg"
              disabled={isSubmitting || (!connectionName.trim() && !connectionLocation.trim() && !connectionNotes.trim())}
            >
              {isSubmitting ? "Saving..." : "Log hello 👋"}
            </Button>
          </div>
        );

      case 'first_entry':
        return (
          <div className={`${baseClasses} ${transitionClasses} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
            <RemiImage src={hellobookIcon} alt="Hellobook" className="w-44 h-auto max-h-44 mx-auto object-contain" />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">First entry complete 🎉</h1>
              <p className="text-muted-foreground leading-relaxed">
                Log your hellos in here to turn strangers into stories.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Names are golden if you can get them.
              </p>
            </div>
            <Button onClick={() => completeOnboarding(true)} className="w-full" size="lg">
              Sounds good, Remi
            </Button>
          </div>
        );

      case 'no_worries':
        return (
          <div className={`${baseClasses} ${transitionClasses} animate-in fade-in slide-in-from-bottom-4 duration-300`}>
            <RemiImage src={remiLogging5} alt="Remi encouraging" />
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-foreground">No worries.</h1>
              <p className="text-muted-foreground leading-relaxed">
                Most stories pass quietly unless we catch them.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your Hellobook is a place to store names & details.
              </p>
            </div>
            <Button 
              onClick={() => completeOnboarding(true)}
              className="w-full" 
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Loading..." : "Sounds good, Remi"}
            </Button>
          </div>
        );

      default:
        return null;
    }
  }, [
    step, userName, connectionName, connectionLocation, connectionNotes, 
    isSubmitting, navigate, handleLastConnectionSelect, handleSaveConnection, completeOnboarding
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress indicator - always visible immediately */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div 
          className="h-full bg-primary transition-all duration-200 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Content area - renders immediately with skeleton fallback */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {screenContent}
        </div>
      </div>
    </div>
  );
}
