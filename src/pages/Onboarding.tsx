import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Remi images
import remiWaving4 from "@/assets/remi-waving-4.webp";
import remiShakingHand from "@/assets/remi-shaking-hand.webp";
import remiCurious1 from "@/assets/remi-curious-1.webp";
import remiCurious4 from "@/assets/remi-curious-4.webp";
import remiLogging4 from "@/assets/remi-logging-4.webp";
import remiLogging5 from "@/assets/remi-logging-5.webp";
import hellobookIcon from "@/assets/hellobook-icon.webp";

export type OnboardingStep = 
  | 'welcome'           // Screen 1 - Name input
  | 'greeting'          // Screen 2 - Nice to meet you animation
  | 'how_it_works'      // Screen 3 - How it works
  | 'last_connection'   // Screen 4 - When did you last meet someone
  | 'save_connection'   // Screen 5a - Save your connection (if recent)
  | 'no_worries'        // Screen 5b - No worries encouragement (if not recent)
  | 'hellobook_intro';  // Screen 6a - Hellobook introduction (after save_connection)

type LastConnectionAnswer = 'today_yesterday' | 'this_week' | 'been_a_while' | 'dont_remember' | null;

// Check if answer indicates a recent connection
const isRecentConnection = (answer: LastConnectionAnswer): boolean => {
  return answer === 'today_yesterday' || answer === 'this_week';
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
      remiShakingHand, remiCurious1, remiCurious4, 
      remiLogging4, remiLogging5, hellobookIcon
    ];
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Auto-advance from greeting to how_it_works
  useEffect(() => {
    if (step === 'greeting' && userName.trim()) {
      const timer = setTimeout(() => {
        setStep('how_it_works');
      }, 1800);
      
      return () => clearTimeout(timer);
    }
  }, [step, userName]);

  // Initialize user/guest progress
  const ensureUserAndProgress = async (): Promise<{ userId: string }> => {
    // Use getSession first to check if there's an existing session
    // This avoids the AuthSessionMissingError that getUser throws when no session exists
    const { data: sessionData } = await supabase.auth.getSession();
    let user = sessionData?.session?.user || null;

    // If no session yet, start a guest (anonymous) session.
    if (!user) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      user = data.user;
    }

    if (!user) throw new Error('No user session');

    const userId = user.id;
    const displayName = userName.trim() || (user.is_anonymous ? 'Guest' : 'Friend');

    // Ensure profile exists + has latest name
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: displayName,
        is_anonymous: user.is_anonymous === true,
        hide_from_leaderboard: false,
      }, { onConflict: 'id' });
    if (profileError) throw profileError;

    // Ensure user_progress exists and mark onboarding complete.
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
          has_seen_welcome_messages: false, // Reset to show walkthrough
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
          selected_pack_id: 'starter-pack',
          has_seen_welcome_messages: false, // Show walkthrough
        });
      if (progressInsertError) throw progressInsertError;
    }

    return { userId };
  };

  // Log the first hello (the saved connection)
  const logFirstHello = async (userId: string) => {
    const { detectBrowserTimezoneOffset, getDayKeyInOffset } = await import('@/lib/timezone');
    const detectedOffset = detectBrowserTimezoneOffset();
    const today = getDayKeyInOffset(new Date(), detectedOffset);

    const { error: helloError } = await supabase.from('hello_logs').insert({
      user_id: userId,
      name: connectionName.trim(),
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

  // Handle saving the connection and completing onboarding
  const handleSaveConnection = async () => {
    if (!connectionName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter the name of your connection",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { userId } = await ensureUserAndProgress();
      await logFirstHello(userId);
      setStep('hellobook_intro');
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

  // Handle completing from the "no worries" path
  const handleNoWorriesComplete = async () => {
    try {
      setIsSubmitting(true);
      await ensureUserAndProgress();
      // Ensure the home walkthrough triggers reliably after the hard reload.
      // sessionStorage survives window.location.replace() but resets on a new tab.
      sessionStorage.setItem('pending_home_tutorial', '1');
      // Force a hard navigation so route guards read the just-written progress state.
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

  // Complete onboarding and go to dashboard (from hellobook_intro)
  const handleComplete = () => {
    sessionStorage.setItem('pending_home_tutorial', '1');
    window.location.replace('/');
  };

  // Handle last connection answer selection
  const handleLastConnectionSelect = (answer: LastConnectionAnswer) => {
    setLastConnectionAnswer(answer);
    if (isRecentConnection(answer)) {
      setStep('save_connection');
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
              className="w-56 h-auto max-h-56 mx-auto object-contain animate-bounce-soft"
              fetchPriority="high"
            />
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground">Welcome to One Hello!</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                I'm Remi.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your reminder raccoon.
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
                Nice to meet you, {userName.trim()} 👋
              </h1>
            </div>
          </div>
        );

      // Screen 3 - How it works
      case 'how_it_works':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiCurious1} 
              alt="Remi curious" 
              className="w-48 h-auto max-h-48 mx-auto object-contain" 
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">How it works</h1>
              <p className="text-muted-foreground leading-relaxed">
                I'll give you friendly reminders and prompts to help you
              </p>
              <ul className="text-left space-y-2 max-w-xs mx-auto">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="text-foreground">Start conversations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="text-foreground">Meet more people</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="text-foreground">& never forget a name again</span>
                </li>
              </ul>
            </div>
            <Button onClick={() => setStep('last_connection')} className="w-full" size="lg">
              Sounds good, Remi
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
                When was the last time you met someone new and remembered their name?
              </p>
              <p className="text-sm text-muted-foreground italic">
                (No cheating - can you picture them right now?)
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button 
                onClick={() => handleLastConnectionSelect('today_yesterday')}
                variant="outline"
                className="w-full h-12 text-base" 
                size="lg"
              >
                Today or yesterday
              </Button>
              <Button 
                onClick={() => handleLastConnectionSelect('this_week')}
                variant="outline"
                className="w-full h-12 text-base" 
                size="lg"
              >
                This week
              </Button>
              <Button 
                onClick={() => handleLastConnectionSelect('been_a_while')}
                variant="outline"
                className="w-full h-12 text-base" 
                size="lg"
              >
                It's been a while
              </Button>
              <Button 
                onClick={() => handleLastConnectionSelect('dont_remember')}
                variant="outline"
                className="w-full h-12 text-base" 
                size="lg"
              >
                I don't remember
              </Button>
            </div>
          </div>
        );

      // Screen 5a - Save your connection (if recent)
      case 'save_connection':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiLogging4} 
              alt="Remi logging" 
              className="w-44 h-auto max-h-44 mx-auto object-contain" 
            />
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-foreground">
                Great - let's save your most recent connection.
              </h1>
            </div>
            
            <div className="space-y-4 text-left">
              <div className="space-y-2">
                <label htmlFor="connectionName" className="text-sm font-medium text-foreground">
                  Name <span className="text-destructive">*</span>
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
              disabled={isSubmitting || !connectionName.trim()}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        );

      // Screen 5b - No worries encouragement (if not recent)
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
                No worries - that's exactly why you're here! 🦝
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                One Hello will help you meet more people, build connections and remember names.
              </p>
              <p className="text-lg font-medium text-foreground mt-4">
                Ready to start?
              </p>
            </div>
            <Button 
              onClick={handleNoWorriesComplete}
              className="w-full" 
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Loading..." : "I'm in"}
            </Button>
          </div>
        );

      // Screen 6a - Hellobook introduction (after saving connection)
      case 'hellobook_intro':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={hellobookIcon} 
              alt="Hellobook" 
              className="w-44 h-auto max-h-44 mx-auto object-contain" 
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">First Hello complete 🎉</h1>
              <p className="text-muted-foreground leading-relaxed">
                Names are like magic, remember them to turn anyone into a friend.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Storing them here means you will never forget 💡
              </p>
            </div>
            <Button onClick={handleComplete} className="w-full" size="lg">
              Great
            </Button>
          </div>
        );
    }
  };

  // Calculate progress for progress bar
  const getProgress = () => {
    const baseSteps: OnboardingStep[] = [
      'welcome', 'greeting', 'how_it_works', 'last_connection'
    ];
    
    // Add conditional steps based on path
    let steps: OnboardingStep[];
    if (step === 'no_worries') {
      steps = [...baseSteps, 'no_worries'];
    } else if (step === 'hellobook_intro') {
      steps = [...baseSteps, 'save_connection', 'hellobook_intro'];
    } else if (step === 'save_connection') {
      steps = [...baseSteps, 'save_connection', 'hellobook_intro'];
    } else {
      steps = [...baseSteps, 'save_connection', 'hellobook_intro'];
    }
    
    const index = steps.indexOf(step);
    return Math.max(0.1, (index + 1) / steps.length);
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
