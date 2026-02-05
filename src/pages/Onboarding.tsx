import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Remi images
import remiWaving4 from "@/assets/remi-waving-4.webp";
import remiShakingHand from "@/assets/remi-shaking-hand.webp";
import remiSmiling1 from "@/assets/remi-smiling-1.webp";
import remiCurious4 from "@/assets/remi-curious-4.webp";
import remiLogging3 from "@/assets/remi-logging-3.webp";
import remiLogging4 from "@/assets/remi-logging-4.webp";
import remiLogging5 from "@/assets/remi-logging-5.webp";
import hellobookIcon from "@/assets/hellobook-icon.webp";

export type OnboardingStep = 
  | 'welcome'           // Screen 1 - Name input
  | 'greeting'          // Screen 2 - Nice to meet you animation
  | 'philosophy'        // Screen 3 - Stranger quote
  | 'last_connection'   // Screen 4 - How long ago
  | 'add_to_hellobook'  // Screen 5a - Want to capture that story?
  | 'log_hello'         // Screen 6a - Log hello form
  | 'first_entry'       // Screen 7a - First entry complete
  | 'no_worries';       // Screen 5b - No worries (if not recent)

type LastConnectionAnswer = 'this_week' | 'last_week' | 'a_while_ago' | 'not_sure' | null;

// Check if answer indicates a recent connection
const isRecentConnection = (answer: LastConnectionAnswer): boolean => {
  return answer === 'this_week' || answer === 'last_week';
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState('');
  
  // Connection form state
  const [lastConnectionAnswer, setLastConnectionAnswer] = useState<LastConnectionAnswer>(null);
  const [connectionName, setConnectionName] = useState('');
  const [connectionLocation, setConnectionLocation] = useState('');
  const [connectionNotes, setConnectionNotes] = useState('');

  // Preload images for next screens
  useEffect(() => {
    const imagesToPreload = [
      remiShakingHand, remiSmiling1, remiCurious4, 
      remiLogging3, remiLogging4, remiLogging5, hellobookIcon
    ];
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Auto-advance from greeting to philosophy
  useEffect(() => {
    if (step === 'greeting' && userName.trim()) {
      const timer = setTimeout(() => {
        setStep('philosophy');
      }, 1800);
      
      return () => clearTimeout(timer);
    }
  }, [step, userName]);

  // Initialize user/guest progress
  const ensureUserAndProgress = async (): Promise<{ userId: string }> => {
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

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: displayName,
        is_anonymous: user.is_anonymous === true,
        hide_from_leaderboard: false,
      }, { onConflict: 'id' });
    if (profileError) throw profileError;

    const { data: existingProgress, error: progressReadError } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    if (progressReadError) throw progressReadError;

    if (existingProgress) {
      const { error: progressUpdateError } = await supabase
        .from('user_progress')
        .update({
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
        })
        .eq('user_id', userId);
      if (progressUpdateError) throw progressUpdateError;
    } else {
      const { error: progressInsertError } = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          current_streak: 0,
          current_day: 1,
          is_onboarding_week: false,
          has_completed_onboarding: true,
          onboarding_completed_at: new Date().toISOString(),
          current_phase: 'active',
          mode: 'daily',
          username: displayName,
          target_hellos_per_week: 7,
          selected_pack_id: '',
          has_seen_welcome_messages: false,
          daily_mode_active: true,
          daily_mode_current_streak: 0,
          daily_mode_start_date: new Date().toISOString(),
          challenge_completed_days: [],
          challenge_started_at: new Date().toISOString(),
        });
      if (progressInsertError) throw progressInsertError;
    }

    return { userId };
  };

  // Log the first hello
  const logFirstHello = async (userId: string) => {
    const { detectBrowserTimezoneOffset, getDayKeyInOffset } = await import('@/lib/timezone');
    const detectedOffset = detectBrowserTimezoneOffset();
    const today = getDayKeyInOffset(new Date(), detectedOffset);

    const { error: helloError } = await supabase.from('hello_logs').insert({
      user_id: userId,
      name: connectionName.trim() || null,
      location: connectionLocation.trim() || null,
      notes: connectionNotes.trim() || null,
      timezone_offset: detectedOffset,
    });
    if (helloError) throw helloError;

    const { data: currentProgress, error: progressReadError } = await supabase
      .from('user_progress')
      .select('total_hellos, hellos_this_week')
      .eq('user_id', userId)
      .maybeSingle();
    if (progressReadError) throw progressReadError;

    const nextTotalHellos = (currentProgress?.total_hellos ?? 0) + 1;
    const nextHellosThisWeek = (currentProgress?.hellos_this_week ?? 0) + 1;
    
    const { error: progressUpdateError } = await supabase.from('user_progress').update({
      last_completed_date: today,
      total_hellos: nextTotalHellos,
      hellos_this_week: nextHellosThisWeek,
    }).eq('user_id', userId);
    if (progressUpdateError) throw progressUpdateError;
    
    await supabase.from('profiles').update({
      timezone_preference: detectedOffset,
    }).eq('id', userId);
  };

  // Handle saving the connection
  const handleSaveConnection = async () => {
    // At least one field should have content
    if (!connectionName.trim() && !connectionLocation.trim() && !connectionNotes.trim()) {
      toast({
        title: "Add some details",
        description: "Please fill in at least one field",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { userId } = await ensureUserAndProgress();
      await logFirstHello(userId);
      setStep('first_entry');
    } catch (error) {
      console.error('Error saving connection:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Skip adding to hellobook, go to walkthrough
  const handleSkipHellobook = async () => {
    try {
      setIsSubmitting(true);
      await ensureUserAndProgress();
      sessionStorage.setItem('pending_home_tutorial', '1');
      window.location.replace('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete from no_worries path
  const handleNoWorriesComplete = async () => {
    try {
      setIsSubmitting(true);
      await ensureUserAndProgress();
      sessionStorage.setItem('pending_home_tutorial', '1');
      window.location.replace('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete from first_entry screen
  const handleComplete = async () => {
    sessionStorage.setItem('pending_home_tutorial', '1');
    window.location.replace('/');
  };

  // Handle last connection answer
  const handleLastConnectionSelect = (answer: LastConnectionAnswer) => {
    setLastConnectionAnswer(answer);
    if (isRecentConnection(answer)) {
      setStep('add_to_hellobook');
    } else {
      setStep('no_worries');
    }
  };

  const renderScreen = () => {
    switch (step) {
      // Screen 1 - Welcome with name input
      case 'welcome':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiWaving4} 
              alt="Remi waving" 
              width={224}
              height={224}
              className="w-56 h-56 mx-auto object-contain"
              fetchPriority="high"
            />
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground">Welcome to One Hello</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                I'm Remi.
              </p>
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

      // Screen 2 - Greeting animation (auto-advances)
      case 'greeting':
        return (
          <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <img 
              src={remiShakingHand} 
              alt="Remi shaking hand" 
              className="w-56 h-auto max-h-56 mx-auto object-contain" 
            />
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200 delay-150">
              <h1 className="text-2xl font-bold text-foreground">
                Nice to meet you, {userName.trim()}! 👋
              </h1>
            </div>
          </div>
        );

      // Screen 3 - Philosophy / stranger quote
      case 'philosophy':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiSmiling1} 
              alt="Remi smiling" 
              className="w-48 h-auto max-h-48 mx-auto object-contain" 
            />
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

      // Screen 4 - Last connection question
      case 'last_connection':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiCurious4} 
              alt="Remi curious" 
              className="w-44 h-auto max-h-44 mx-auto object-contain" 
            />
            <div className="space-y-3">
              <p className="text-lg text-foreground leading-relaxed font-medium">
                Think back to the last new person you met.
              </p>
              <p className="text-muted-foreground">
                How long ago was that?
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button 
                onClick={() => handleLastConnectionSelect('this_week')}
                variant="outline"
                className="w-full h-12 text-base" 
                size="lg"
              >
                This week
              </Button>
              <Button 
                onClick={() => handleLastConnectionSelect('last_week')}
                variant="outline"
                className="w-full h-12 text-base" 
                size="lg"
              >
                Last week
              </Button>
              <Button 
                onClick={() => handleLastConnectionSelect('a_while_ago')}
                variant="outline"
                className="w-full h-12 text-base" 
                size="lg"
              >
                A while ago
              </Button>
              <Button 
                onClick={() => handleLastConnectionSelect('not_sure')}
                variant="outline"
                className="w-full h-12 text-base" 
                size="lg"
              >
                I'm not sure
              </Button>
            </div>
          </div>
        );

      // Screen 5a - Add to Hellobook prompt (if recent)
      case 'add_to_hellobook':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiLogging4} 
              alt="Remi logging" 
              className="w-44 h-auto max-h-44 mx-auto object-contain" 
            />
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-foreground">
                Want to capture that story?
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                You can add it to your Hellobook.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A place to remember names and small details from people you meet.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button 
                onClick={() => setStep('log_hello')}
                className="w-full" 
                size="lg"
              >
                Add to Hellobook
              </Button>
              <Button 
                onClick={handleSkipHellobook}
                variant="ghost"
                className="w-full text-muted-foreground" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Loading..." : "I'll do this later"}
              </Button>
            </div>
          </div>
        );

      // Screen 6a - Log hello form
      case 'log_hello':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiLogging3} 
              alt="Remi logging" 
              className="w-40 h-auto max-h-40 mx-auto object-contain" 
            />
            <h1 className="text-xl font-bold text-foreground">
              Log your hello
            </h1>
            
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

      // Screen 7a - First entry complete
      case 'first_entry':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={hellobookIcon} 
              alt="Hellobook" 
              className="w-44 h-auto max-h-44 mx-auto object-contain" 
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">First entry complete 🎉</h1>
              <p className="text-muted-foreground leading-relaxed">
                Log your hellos in here to turn strangers into stories.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Names are golden if you can get them.
              </p>
            </div>
            <Button onClick={handleComplete} className="w-full" size="lg">
              Sounds good, Remi
            </Button>
          </div>
        );

      // Screen 5b - No worries (if not recent)
      case 'no_worries':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiLogging5} 
              alt="Remi encouraging" 
              className="w-48 h-auto max-h-48 mx-auto object-contain" 
            />
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-foreground">
                No worries.
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Most stories pass quietly unless we catch them.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your Hellobook is a place to store names & details.
              </p>
            </div>
            <Button 
              onClick={handleNoWorriesComplete}
              className="w-full" 
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Loading..." : "Sounds good, Remi"}
            </Button>
          </div>
        );
    }
  };

  // Calculate progress for progress bar
  const getProgress = () => {
    const allSteps: OnboardingStep[] = [
      'welcome', 'greeting', 'philosophy', 'last_connection',
      'add_to_hellobook', 'log_hello', 'first_entry', 'no_worries'
    ];
    
    const index = allSteps.indexOf(step);
    // Normalize to a 0-1 scale based on typical flow length
    const typicalLength = 6;
    return Math.max(0.1, Math.min(1, (index + 1) / typicalLength));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${getProgress() * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}
