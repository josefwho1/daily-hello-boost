import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getGuestState, createGuestState, createGuestProgress, updateGuestProgress, addGuestHelloLog } from "@/lib/indexedDB";
import { FirstOrbGiftDialog } from "@/components/FirstOrbGiftDialog";

// Remi images
import remiWaving from "@/assets/remi-waving.webp";
import remiWaving2 from "@/assets/remi-waving-2.webp";
import remiWaving4 from "@/assets/remi-waving-4.webp";
import remiCurious1 from "@/assets/remi-curious-1.webp";
import remiSurprised1 from "@/assets/remi-surprised-1.webp";
import remiCongrats1 from "@/assets/remi-congrats-1.webp";
import remiCongrats3 from "@/assets/remi-congrats-3.webp";
import remiCelebrating1 from "@/assets/remi-celebrating-1.webp";

export type OnboardingStep = 
  | 'welcome'           // Screen 1
  | 'how_it_works'      // Screen 2
  | 'stats'             // Screen 3
  | 'initiation'        // Screen 4
  | 'first_hello_intro' // Screen 5 - Are you in public?
  | 'public_yes'        // Yes branch
  | 'public_no'         // No branch - also used for "no one around"
  | 'greeting_complete' // After "I did it" - rating screen
  | 'observation_intro'; // Intro to next challenge

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFirstOrbGift, setShowFirstOrbGift] = useState(false);

  // Initialize user/guest progress without logging a hello
  const initializeProgress = async () => {
    const { data: { user: existingUser } } = await supabase.auth.getUser();
    
    if (existingUser) {
      await supabase.from('user_progress').upsert({
        user_id: existingUser.id,
        is_onboarding_week: true,
        current_day: 1,
        current_streak: 0,
        mode: 'first_hellos',
        has_completed_onboarding: false,
        current_phase: 'first_hellos',
        orbs: 0,
        has_received_first_orb: false,
        onboarding_week_start: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      return { isGuest: false, userId: existingUser.id };
    } else {
      let guestState = await getGuestState();
      if (!guestState) {
        guestState = await createGuestState();
        await createGuestProgress(guestState.device_id, guestState.guest_user_id);
      }
      
      await updateGuestProgress({
        is_onboarding_week: true,
        current_day: 1,
        mode: 'first_hellos',
        has_completed_onboarding: false,
        orbs: 0,
        has_received_first_orb: false,
        onboarding_week_start: new Date().toISOString(),
      });
      return { isGuest: true, guestState };
    }
  };

  // Log the Greeting hello and update streak to 1
  const logGreetingHello = async () => {
    const { data: { user: existingUser } } = await supabase.auth.getUser();
    const today = new Date().toISOString().split('T')[0];
    
    if (existingUser) {
      await supabase.from('hello_logs').insert({
        user_id: existingUser.id,
        hello_type: 'Greeting',
        timezone_offset: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      
      // Update daily streak to 1 after first hello
      await supabase.from('user_progress').update({
        daily_streak: 1,
        current_streak: 1,
        last_completed_date: today,
        total_hellos: 1,
        hellos_this_week: 1,
      }).eq('user_id', existingUser.id);
    } else {
      await addGuestHelloLog({
        name: null,
        notes: null,
        hello_type: 'Greeting',
        rating: null,
        difficulty_rating: null,
        timezone_offset: '+00:00',
      });
      
      // Update daily streak to 1 after first hello for guest
      await updateGuestProgress({
        daily_streak: 1,
        current_streak: 1,
        last_completed_date: today,
        total_hellos: 1,
        hellos_this_week: 1,
      });
    }
  };

  // Handle "I did it" - log greeting and show rating
  const handleDidIt = async () => {
    try {
      setIsSubmitting(true);
      await initializeProgress();
      await logGreetingHello();
      // Award first orb
      await awardFirstOrb();
      setStep('greeting_complete');
    } catch (error) {
      console.error('Error completing greeting:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Award the first orb after the first hello
  const awardFirstOrb = async () => {
    const { data: { user: existingUser } } = await supabase.auth.getUser();
    
    if (existingUser) {
      await supabase.from('user_progress').update({
        orbs: 1,
        has_received_first_orb: true
      }).eq('user_id', existingUser.id);
    } else {
      await updateGuestProgress({
        orbs: 1,
        has_received_first_orb: true
      });
    }
  };

  // Handle claiming first orb from dialog
  const handleClaimFirstOrb = () => {
    setShowFirstOrbGift(false);
    setStep('observation_intro');
  };

  // Handle "No" or "Got it, I'll be back" - just init and go to dashboard
  const handleCompleteIntro = async () => {
    try {
      setIsSubmitting(true);
      await initializeProgress();
      navigate('/');
    } catch (error) {
      console.error('Error completing intro:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderScreen = () => {
    switch (step) {
      // Screen 1 - Welcome
      case 'welcome':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiWaving4} 
              alt="Remi waving" 
              className="w-64 h-auto max-h-64 mx-auto object-contain animate-bounce-soft" 
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Welcome to One Hello!</h1>
              <p className="text-muted-foreground leading-relaxed">
                Hello, I'm Remi. Your Reminder Raccoon, companion & guide.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This is a place to create real human connection.
              </p>
              <p className="text-lg font-medium text-primary">
                One Hello at a time.
              </p>
            </div>
            <Button onClick={() => setStep('how_it_works')} className="w-full" size="lg">
              Hello Remi 👋
            </Button>
            <button 
              onClick={() => navigate('/auth')}
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              I already have an account
            </button>
          </div>
        );

      // Screen 2 - How it works
      case 'how_it_works':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiCurious1} 
              alt="Remi curious" 
              className="w-64 h-auto max-h-64 mx-auto object-contain" 
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">How it works</h1>
              <p className="text-muted-foreground leading-relaxed">
                Every social interaction needs to start from somewhere.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We give you challenges, reminders and encouragement to start conversations with strangers, connect with friends & make the world a warmer place.
              </p>
            </div>
            <Button onClick={() => setStep('stats')} className="w-full" size="lg">
              I'm In
            </Button>
          </div>
        );

      // Screen 3 - Stats
      case 'stats':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiSurprised1} 
              alt="Remi surprised" 
              className="w-64 h-auto max-h-64 mx-auto object-contain" 
            />
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-foreground">What users felt after only 7 days</h1>
              
              <div className="space-y-4">
                <div className="bg-success/10 rounded-xl p-4">
                  <p className="text-4xl font-bold text-success">100%</p>
                  <p className="text-muted-foreground">saw a positive improvement in their week</p>
                </div>
                
                <div className="bg-primary/10 rounded-xl p-4">
                  <p className="text-4xl font-bold text-primary">93%</p>
                  <p className="text-muted-foreground">felt more confident</p>
                </div>
                
                <div className="bg-accent/20 rounded-xl p-4">
                  <p className="text-4xl font-bold text-accent-foreground">86%</p>
                  <p className="text-muted-foreground">felt more connected</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setStep('initiation')} className="w-full" size="lg">
              Let's do it
            </Button>
          </div>
        );

      // Screen 4 - Initiation
      case 'initiation':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiCongrats3} 
              alt="Remi celebrating" 
              className="w-64 h-auto max-h-64 mx-auto object-contain" 
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Introduction</h1>
              <p className="text-muted-foreground leading-relaxed">
                I'll guide you through your First Hello's
              </p>
              <p className="text-muted-foreground leading-relaxed">
                These will introduce different ways to say hello and start conversations.
              </p>
            </div>
            <Button onClick={() => setStep('first_hello_intro')} className="w-full" size="lg">
              Let's begin
            </Button>
          </div>
        );

      // Screen 5 - First Hello Intro (Are you in public?)
      case 'first_hello_intro':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiWaving} 
              alt="Remi waving" 
              className="w-64 h-auto max-h-64 mx-auto object-contain" 
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">First Hello</h1>
              <p className="text-muted-foreground leading-relaxed">
                Let's begin with your First Hello.
              </p>
              <p className="text-lg font-medium text-foreground">
                Are you in a public place?
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setStep('public_yes')} 
                className="flex-1" 
                size="lg"
              >
                Yes
              </Button>
              <Button 
                onClick={() => setStep('public_no')} 
                variant="outline"
                className="flex-1" 
                size="lg"
              >
                No
              </Button>
            </div>
          </div>
        );

      // Yes branch - Do it now
      case 'public_yes':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiWaving4} 
              alt="Remi waving" 
              className="w-64 h-auto max-h-64 mx-auto object-contain animate-bounce-soft" 
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Great.</h1>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Smile, look up & say Hello to the first stranger you see.
              </p>
            </div>
            <Button 
              onClick={handleDidIt} 
              className="w-full" 
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Loading..." : "I did it"}
            </Button>
            <button 
              onClick={() => setStep('public_no')}
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              there is no one around me
            </button>
          </div>
        );

      // No branch - Come back later
      case 'public_no':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiWaving2} 
              alt="Remi waving" 
              className="w-64 h-auto max-h-64 mx-auto object-contain" 
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">No worries.</h1>
              <p className="text-muted-foreground leading-relaxed">
                Your first challenge is to say Hello to a stranger.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Don't forget to smile 🙂
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Once you do it, come back and log it in here.
              </p>
            </div>
            <Button 
              onClick={handleCompleteIntro} 
              className="w-full" 
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Loading..." : "Got it, I'll be back."}
            </Button>
          </div>
        );

      // Greeting Complete - Rating Screen
      case 'greeting_complete':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiCongrats1} 
              alt="Remi celebrating" 
              className="w-40 h-auto max-h-40 mx-auto object-contain" 
            />
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Congratulations!</h1>
              <p className="text-sm font-bold text-primary tracking-wide">
                FIRST HELLO COMPLETE
              </p>
            </div>
            <p className="text-lg text-foreground font-medium">How was that?</p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => setShowFirstOrbGift(true)} 
                className="w-full" 
                size="lg"
              >
                😍 Loved it
              </Button>
              <Button 
                onClick={() => setShowFirstOrbGift(true)} 
                className="w-full" 
                size="lg"
                variant="outline"
              >
                💪 Easy money
              </Button>
              <Button 
                onClick={() => setShowFirstOrbGift(true)} 
                className="w-full" 
                size="lg"
                variant="outline"
              >
                😬 No good
              </Button>
            </div>
          </div>
        );

      // Observation Intro - Next challenge teaser
      case 'observation_intro':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiCelebrating1} 
              alt="Remi celebrating" 
              className="w-40 h-auto max-h-40 mx-auto object-contain" 
            />
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Great Work!</h2>
              <p className="text-muted-foreground leading-relaxed">
                Now lets add some conversation starters.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                First up, make an <span className="font-semibold text-foreground">Observation</span>.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Think the weather, atmosphere, vibes etc.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Anything you are experiencing in a shared space.
              </p>
              <p className="text-sm text-primary italic">
                "What a beautiful day" "Long line hey" "Love the vibe in here"
              </p>
            </div>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full" 
              size="lg"
            >
              Let's do it
            </Button>
          </div>
        );
    }
  };

  // Calculate progress for progress bar
  const getProgress = () => {
    if (step === 'welcome') return 1/7;
    if (step === 'how_it_works') return 2/7;
    if (step === 'stats') return 3/7;
    if (step === 'initiation') return 4/7;
    if (step === 'first_hello_intro' || step === 'public_yes' || step === 'public_no') return 5/7;
    if (step === 'greeting_complete') return 6/7;
    return 1;
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

      {/* First Orb Gift Dialog */}
      <FirstOrbGiftDialog
        open={showFirstOrbGift}
        onClaim={handleClaimFirstOrb}
      />
    </div>
  );
}
