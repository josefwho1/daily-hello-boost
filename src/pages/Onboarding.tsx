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
import remiSurprised1 from "@/assets/remi-surprised-1.webp";
import hellobookIcon from "@/assets/hellobook-icon.webp";

export type OnboardingStep = 
  | 'welcome'           // Screen 1 - Name input
  | 'greeting'          // Screen 2 - Nice to meet you animation
  | 'how_it_works'      // Screen 3 - How it works
  | 'last_connection'   // Screen 4 - When did you last meet someone
  | 'save_connection'   // Screen 5 - Save your connection
  | 'hellobook_intro'   // Screen 6 - Hellobook introduction
  | 'stats';            // Screen 7 - Stats and final CTA

// Map each step to its image for preloading
const stepImageMap: Record<OnboardingStep, string | null> = {
  'welcome': remiWaving4,
  'greeting': remiShakingHand,
  'how_it_works': remiCurious1,
  'last_connection': remiCurious4,
  'save_connection': null, // No main image, just form
  'hellobook_intro': hellobookIcon,
  'stats': remiSurprised1,
};

// Define the next step for each step (for preloading)
const nextStepMap: Partial<Record<OnboardingStep, OnboardingStep>> = {
  'welcome': 'greeting',
  'greeting': 'how_it_works',
  'how_it_works': 'last_connection',
  'last_connection': 'save_connection',
  'save_connection': 'hellobook_intro',
  'hellobook_intro': 'stats',
};

type LastConnectionAnswer = 'today' | 'this_week' | 'over_week' | 'dont_remember' | null;

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

  // Preload next screen's image when current step changes
  useEffect(() => {
    const nextStep = nextStepMap[step];
    if (!nextStep) return;

    const imageSrc = stepImageMap[nextStep];
    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
    }
  }, [step]);

  // Auto-advance from greeting to how_it_works
  useEffect(() => {
    if (step === 'greeting' && userName.trim()) {
      const timer = setTimeout(() => {
        setStep('how_it_works');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [step, userName]);

  // Initialize user/guest progress
  const initializeProgress = async () => {
    const { data: { user: existingUser } } = await supabase.auth.getUser();
    
    if (existingUser && !existingUser.is_anonymous) {
      // Regular authenticated user - set mode to 'daily' (single mode now)
      await supabase.from('user_progress').upsert({
        user_id: existingUser.id,
        is_onboarding_week: false,
        current_day: 1,
        current_streak: 0,
        mode: 'daily', // Single mode now
        has_completed_onboarding: true,
        current_phase: 'active',
        orbs: 1, // Start with 1 orb
        has_received_first_orb: true,
        onboarding_week_start: new Date().toISOString(),
        onboarding_completed_at: new Date().toISOString(),
        username: userName.trim() || 'Friend',
        target_hellos_per_week: 7,
        total_hellos: 1, // They just logged one
        hellos_this_week: 1,
        daily_streak: 1,
      }, { onConflict: 'user_id' });
      
      await supabase.from('profiles').update({ 
        username: userName.trim() || 'Friend' 
      }).eq('id', existingUser.id);
      
      return { isGuest: false, userId: existingUser.id };
    }
    
    // For guests, use anonymous auth
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
    
    const userId = data.user?.id;
    if (!userId) throw new Error('No user ID returned');

    // Create profile for anonymous user
    await supabase.from('profiles').upsert({
      id: userId,
      username: userName.trim() || 'Guest',
      is_anonymous: true,
      hide_from_leaderboard: false,
    }, { onConflict: 'id' });

    // Create user_progress for anonymous user with mode='daily'
    await supabase.from('user_progress').upsert({
      user_id: userId,
      is_onboarding_week: false,
      current_day: 1,
      current_streak: 0,
      mode: 'daily', // Single mode now
      has_completed_onboarding: true,
      current_phase: 'active',
      orbs: 1,
      has_received_first_orb: true,
      onboarding_week_start: new Date().toISOString(),
      onboarding_completed_at: new Date().toISOString(),
      username: userName.trim() || 'Guest',
      target_hellos_per_week: 7,
      total_hellos: 1,
      hellos_this_week: 1,
      daily_streak: 1,
    }, { onConflict: 'user_id' });
    
    return { isGuest: true, userId };
  };

  // Log the first hello (the saved connection)
  const logFirstHello = async (userId: string) => {
    const { detectBrowserTimezoneOffset, getDayKeyInOffset } = await import('@/lib/timezone');
    const detectedOffset = detectBrowserTimezoneOffset();
    const today = getDayKeyInOffset(new Date(), detectedOffset);
    
    await supabase.from('hello_logs').insert({
      user_id: userId,
      name: connectionName.trim(),
      location: connectionLocation.trim() || null,
      notes: connectionNotes.trim() || null,
      hello_type: 'Greeting',
      timezone_offset: detectedOffset,
    });
    
    await supabase.from('user_progress').update({
      last_completed_date: today,
      total_xp: 10, // +10 XP for first hello
      hellos_today_count: 1,
    }).eq('user_id', userId);
    
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
      const { userId } = await initializeProgress();
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

  // Complete onboarding and go to dashboard
  const handleComplete = () => {
    navigate('/');
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
              className="w-64 h-auto max-h-64 mx-auto object-contain animate-bounce-soft" 
              fetchPriority="high"
            />
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-foreground">Welcome to One Hello!</h1>
              <p className="text-muted-foreground leading-relaxed">
                I'm Remi.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your reminder raccoon.
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="userName" className="text-sm font-medium text-foreground">
                What's your name?
              </label>
              <Input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="text-center"
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
              className="w-64 h-auto max-h-64 mx-auto object-contain" 
              fetchPriority="high"
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
              className="w-64 h-auto max-h-64 mx-auto object-contain" 
              fetchPriority="high"
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">How it works</h1>
              <p className="text-muted-foreground leading-relaxed">
                Every connection starts with a hello. I'll give you gentle reminders to help you start conversations, remember names, and feel more connected to the people around you.
              </p>
            </div>
            <Button onClick={() => setStep('last_connection')} className="w-full" size="lg">
              Sounds good
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
              className="w-48 h-auto max-h-48 mx-auto object-contain" 
              fetchPriority="high"
            />
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                When was the last time you met someone new and remembered their name?
              </p>
              <p className="text-sm text-muted-foreground italic">
                (No cheating - can you picture them right now?)
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => {
                  setLastConnectionAnswer('today');
                  setStep('save_connection');
                }}
                variant={lastConnectionAnswer === 'today' ? 'default' : 'outline'}
                className="w-full" 
                size="lg"
              >
                Today
              </Button>
              <Button 
                onClick={() => {
                  setLastConnectionAnswer('this_week');
                  setStep('save_connection');
                }}
                variant={lastConnectionAnswer === 'this_week' ? 'default' : 'outline'}
                className="w-full" 
                size="lg"
              >
                This week
              </Button>
              <Button 
                onClick={() => {
                  setLastConnectionAnswer('over_week');
                  setStep('save_connection');
                }}
                variant={lastConnectionAnswer === 'over_week' ? 'default' : 'outline'}
                className="w-full" 
                size="lg"
              >
                Over a week ago
              </Button>
              <Button 
                onClick={() => {
                  setLastConnectionAnswer('dont_remember');
                  setStep('save_connection');
                }}
                variant={lastConnectionAnswer === 'dont_remember' ? 'default' : 'outline'}
                className="w-full" 
                size="lg"
              >
                I don't remember
              </Button>
            </div>
          </div>
        );

      // Screen 5 - Save your connection
      case 'save_connection':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

      // Screen 6 - Hellobook introduction
      case 'hellobook_intro':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={hellobookIcon} 
              alt="Hellobook" 
              className="w-48 h-auto max-h-48 mx-auto object-contain" 
              fetchPriority="high"
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
            <Button onClick={() => setStep('stats')} className="w-full" size="lg">
              Great
            </Button>
          </div>
        );

      // Screen 7 - Stats
      case 'stats':
        return (
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiSurprised1} 
              alt="Remi surprised" 
              className="w-48 h-auto max-h-48 mx-auto object-contain" 
              fetchPriority="high"
            />
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-foreground">
                What people notice after using One Hello for a week
              </h1>
              
              <div className="space-y-2">
                <div className="bg-success/10 rounded-xl p-3">
                  <p className="text-3xl font-bold text-success">100%</p>
                  <p className="text-sm text-muted-foreground">improved their week</p>
                </div>
                
                <div className="bg-primary/10 rounded-xl p-3">
                  <p className="text-3xl font-bold text-primary">93%</p>
                  <p className="text-sm text-muted-foreground">felt more confident</p>
                </div>
                
                <div className="bg-accent/20 rounded-xl p-3">
                  <p className="text-3xl font-bold text-accent-foreground">86%</p>
                  <p className="text-sm text-muted-foreground">felt more connected in their communities</p>
                </div>
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full" size="lg">
              Let's do it
            </Button>
          </div>
        );
    }
  };

  // Calculate progress for progress bar
  const getProgress = () => {
    const steps: OnboardingStep[] = [
      'welcome', 'greeting', 'how_it_works', 'last_connection',
      'save_connection', 'hellobook_intro', 'stats'
    ];
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
