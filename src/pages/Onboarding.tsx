import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getGuestState, createGuestState, createGuestProgress, updateGuestProgress, addGuestHelloLog } from "@/lib/indexedDB";
import { FirstOrbGiftDialog } from "@/components/FirstOrbGiftDialog";

// Remi images
import remiWaving from "@/assets/remi-waving.webp";
import remiWaving4 from "@/assets/remi-waving-4.webp";
import remiCurious1 from "@/assets/remi-curious-1.webp";
import remiSurprised1 from "@/assets/remi-surprised-1.webp";
import remiCongrats1 from "@/assets/remi-congrats-1.webp";
import remiCongrats3 from "@/assets/remi-congrats-3.webp";
import remiShakingHand from "@/assets/remi-shaking-hand.webp";

// New onboarding images
import onboardingFirsthello from "@/assets/onboarding-firsthello.webp";
import onboardingObservation from "@/assets/onboarding-observation.webp";
import onboardingCompliment from "@/assets/onboarding-compliment.webp";
import onboardingQuestion from "@/assets/onboarding-question.webp";
import onboardingName from "@/assets/onboarding-name.webp";

export type OnboardingStep = 
  | 'welcome'           // Screen 1 - Name input
  | 'greeting'          // Screen 1b - Nice to meet you animation
  | 'how_it_works'      // Screen 2
  | 'stats'             // Screen 3
  | 'initiation'        // Screen 4 - Introduction
  | 'first_hello_intro' // Screen 5 - Are you in public?
  | 'public_yes'        // Yes branch
  | 'public_no'         // No branch - also used for "no one around"
  | 'greeting_complete' // After "I did it" - rating screen
  | 'observation_intro' // Intro to observation challenge
  | 'observation_done'  // After observation complete - compliment intro
  | 'compliment_done'   // After compliment complete - question intro
  | 'question_done'     // After question complete - name intro
  | 'initiation_complete'; // After all 5 First Hellos complete

// Map each step to its image, and the next step's image for preloading
const stepImageMap: Record<OnboardingStep, string | null> = {
  'welcome': remiWaving4,
  'greeting': remiShakingHand,
  'how_it_works': remiCurious1,
  'stats': remiSurprised1,
  'initiation': remiCongrats3,
  'first_hello_intro': remiWaving,
  'public_yes': onboardingFirsthello,
  'public_no': onboardingFirsthello,
  'greeting_complete': remiCongrats1,
  'observation_intro': onboardingObservation,
  'observation_done': onboardingCompliment,
  'compliment_done': onboardingQuestion,
  'question_done': onboardingName,
  'initiation_complete': remiCongrats1,
};

// Define the next step for each step (for preloading)
const nextStepMap: Partial<Record<OnboardingStep, OnboardingStep | OnboardingStep[]>> = {
  'welcome': 'greeting',
  'greeting': 'how_it_works',
  'how_it_works': 'stats',
  'stats': 'initiation',
  'initiation': 'first_hello_intro',
  'first_hello_intro': ['public_yes', 'public_no'], // Could go either way
  'public_yes': 'greeting_complete',
  'public_no': 'greeting_complete', // Will also need this when user returns
  'greeting_complete': 'observation_intro',
  'observation_intro': 'observation_done',
  'observation_done': 'compliment_done',
  'compliment_done': 'question_done',
  'question_done': 'initiation_complete',
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFirstOrbGift, setShowFirstOrbGift] = useState(false);
  const [userName, setUserName] = useState('');

  // Preload next screen's image when current step changes
  useEffect(() => {
    const nextStep = nextStepMap[step];
    if (!nextStep) return;

    const stepsToPreload = Array.isArray(nextStep) ? nextStep : [nextStep];
    
    stepsToPreload.forEach((s) => {
      const imageSrc = stepImageMap[s];
      if (imageSrc) {
        const img = new Image();
        img.src = imageSrc;
      }
    });
  }, [step]);

  // Save username and auto-advance from greeting to how_it_works
  useEffect(() => {
    if (step === 'greeting' && userName.trim()) {
      // Save the username to the appropriate storage
      const saveUserName = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // For authenticated users, save to both profiles and user_progress tables
          await supabase.from('profiles').update({ 
            username: userName.trim() 
          }).eq('id', user.id);
          
          await supabase.from('user_progress').update({ 
            username: userName.trim() 
          }).eq('user_id', user.id);
          
          await supabase.auth.updateUser({
            data: { name: userName.trim() }
          });
        } else {
          // For guest users
          let guestState = await getGuestState();
          if (!guestState) {
            guestState = await createGuestState();
            await createGuestProgress(guestState.device_id, guestState.guest_user_id);
          }
          await updateGuestProgress({ username: userName.trim() });
        }
      };
      saveUserName();

      // Auto-continue to how_it_works after 1.25 seconds (2x faster)
      const timer = setTimeout(() => {
        setStep('how_it_works');
      }, 1250);
      
      return () => clearTimeout(timer);
    }
  }, [step, userName]);

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
    
    const { detectBrowserTimezoneOffset, getDayKeyInOffset } = await import('@/lib/timezone');
    const detectedOffset = detectBrowserTimezoneOffset();
    const today = getDayKeyInOffset(new Date(), detectedOffset);
    
    if (existingUser) {
      await supabase.from('hello_logs').insert({
        user_id: existingUser.id,
        hello_type: 'Greeting',
        timezone_offset: detectedOffset,
      });
      
      await supabase.from('user_progress').update({
        daily_streak: 1,
        current_streak: 1,
        last_completed_date: today,
        total_hellos: 1,
        hellos_this_week: 1,
        total_xp: 10, // +10 XP for first hello
        hellos_today_count: 1,
      }).eq('user_id', existingUser.id);
      
      await supabase.from('profiles').update({
        timezone_preference: detectedOffset,
      }).eq('id', existingUser.id);
    } else {
      await addGuestHelloLog({
        name: null,
        notes: null,
        hello_type: 'Greeting',
        rating: null,
        difficulty_rating: null,
        timezone_offset: detectedOffset,
      });
      
      await updateGuestProgress({
        daily_streak: 1,
        current_streak: 1,
        last_completed_date: today,
        total_hellos: 1,
        hellos_this_week: 1,
        total_xp: 10, // +10 XP for first hello
        hellos_today_count: 1,
      });
    }
  };

  // Handle "I did it" - log greeting and show rating
  const handleDidIt = async () => {
    try {
      setIsSubmitting(true);
      await initializeProgress();
      await logGreetingHello();
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

  // Handle rating selection - shows orb gift
  const handleRating = () => {
    setShowFirstOrbGift(true);
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
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Welcome to One Hello!</h1>
              <p className="text-muted-foreground leading-relaxed">
                Hello, I'm Remi. Your Reminder Raccoon
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="userName" className="text-sm font-medium text-foreground">
                What's your name?
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
              onClick={() => navigate('/auth')}
              className="text-sm text-muted-foreground hover:text-primary underline"
            >
              I already have an account
            </button>
          </div>
        );

      // Screen 1b - Greeting animation (auto-advances via useEffect)
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
                Nice to meet you, {userName.trim()}!
              </h1>
            </div>
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
              fetchPriority="high"
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">How it works</h1>
              <p className="text-muted-foreground leading-relaxed">
                Every interaction starts with a hello.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We give you simple challenges and reminders to help you start conversations, connect with people, and make the world feel a little warmer.
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
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiSurprised1} 
              alt="Remi surprised" 
              className="w-48 h-auto max-h-48 mx-auto object-contain" 
              fetchPriority="high"
            />
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-foreground">What users felt after 7 days</h1>
              
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
                  <p className="text-sm text-muted-foreground">felt more connected</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setStep('initiation')} className="w-full" size="lg">
              Let's do it
            </Button>
          </div>
        );

      // Screen 4 - Initiation / Introduction
      case 'initiation':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiCongrats3} 
              alt="Remi celebrating" 
              className="w-64 h-auto max-h-64 mx-auto object-contain" 
              fetchPriority="high"
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Introduction</h1>
              <p className="text-muted-foreground leading-relaxed">
                I'll guide you through five simple ways to start conversations.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                These are skills you can use anywhere, anytime.
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
              fetchPriority="high"
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">First Hello</h1>
              <p className="text-muted-foreground leading-relaxed">
                Let's begin with your First Hello.
              </p>
              <p className="text-lg font-medium text-foreground">
                Are you in a public place right now?
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
              src={onboardingFirsthello} 
              alt="First Hello interaction" 
              className="w-full h-auto max-h-56 mx-auto object-contain" 
              fetchPriority="high"
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Greeting</h1>
              <p className="text-muted-foreground leading-relaxed">
                Your first challenge is to say hello to a stranger.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Smile, look up, and say hello the first person you see.
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
              src={onboardingFirsthello} 
              alt="First Hello interaction" 
              className="w-full h-auto max-h-56 mx-auto object-contain" 
              fetchPriority="high"
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">No worries.</h1>
              <p className="text-muted-foreground leading-relaxed">
                Your first challenge is to say hello to a stranger. Don't forget to smile 🙂
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Come back and log it in here once you've done it.
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
              fetchPriority="high"
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
                onClick={handleRating} 
                className="w-full" 
                size="lg"
              >
                😍 Loved it
              </Button>
              <Button 
                onClick={handleRating} 
                className="w-full" 
                size="lg"
                variant="outline"
              >
                💪 Easy
              </Button>
              <Button 
                onClick={handleRating} 
                className="w-full" 
                size="lg"
                variant="outline"
              >
                😤 Challenging but done
              </Button>
            </div>
          </div>
        );

      // Observation Intro - After first hello rating
      case 'observation_intro':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={onboardingObservation} 
              alt="Observation example" 
              className="w-full h-auto max-h-56 mx-auto object-contain" 
              fetchPriority="high"
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Observation</h1>
              <p className="text-muted-foreground leading-relaxed">
                Next, comment on something you're both experiencing.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Weather, atmosphere, vibes - anything shared.
              </p>
              <p className="text-sm text-primary italic">
                "What a beautiful day" "Long line, hey?" "Love the vibe in here"
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

      // After Observation Complete - Compliment Intro
      case 'observation_done':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={onboardingCompliment} 
              alt="Compliment example" 
              className="w-full h-auto max-h-56 mx-auto object-contain" 
              fetchPriority="high"
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Nice work</h1>
              <p className="text-sm text-muted-foreground">knew you were a natural 🦝</p>
              <p className="text-muted-foreground leading-relaxed">
                Next up: make someone's day.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Give a genuine compliment.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Clothing or accessories work great.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Come back once you've done it.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full" 
              size="lg"
            >
              I'll be back 😎
            </Button>
          </div>
        );

      // After Compliment Complete - Question Intro
      case 'compliment_done':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={onboardingQuestion} 
              alt="Question example" 
              className="w-full h-auto max-h-56 mx-auto object-contain" 
              fetchPriority="high"
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">Great job, {userName.trim() || 'friend'}.</h1>
              <p className="text-muted-foreground leading-relaxed">
                Now let's add a little depth.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ask a question to get to know someone.
              </p>
              <div className="text-sm text-primary italic space-y-1">
                <p>"How are you?"</p>
                <p>"Where are you from?"</p>
                <p>"Got any plans for the weekend?"</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full" 
              size="lg"
            >
              See you soon
            </Button>
          </div>
        );

      // After Question Complete - Name Intro
      case 'question_done':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={onboardingName} 
              alt="Getting a name example" 
              className="w-full h-auto max-h-56 mx-auto object-contain" 
              fetchPriority="high"
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">You're on a roll!</h1>
              <p className="text-muted-foreground leading-relaxed">
                Last one, it's time to start taking names.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Names are like magic, they turn strangers into friends.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Use any of the four hellos to start a conversation.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Then ask their name and save it here.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full" 
              size="lg"
            >
              Got it, Remi.
            </Button>
          </div>
        );

      // Initiation Complete - All 5 First Hellos done
      case 'initiation_complete':
        return (
          <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <img 
              src={remiCongrats1} 
              alt="Remi celebrating" 
              className="w-40 h-auto max-h-40 mx-auto object-contain" 
              fetchPriority="high"
            />
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-foreground">🎉 Initiation Complete 🎉</h1>
              <p className="text-muted-foreground leading-relaxed">
                You can officially turn a stranger into a friend.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to the <span className="font-bold">Gaze</span>
              </p>
              <p className="text-sm text-primary italic">
                (that's what a group of raccoons is called 🦝)
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Now choose how you'd like to continue your journey.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/mode-selection')} 
              className="w-full" 
              size="lg"
            >
              Continue
            </Button>
          </div>
        );
    }
  };

  // Calculate progress for progress bar
  const getProgress = () => {
    const steps: OnboardingStep[] = [
      'welcome', 'greeting', 'how_it_works', 'stats', 'initiation',
      'first_hello_intro', 'public_yes', 'public_no', 'greeting_complete',
      'observation_intro', 'observation_done', 'compliment_done', 
      'question_done', 'initiation_complete'
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

      {/* First Orb Gift Dialog */}
      <FirstOrbGiftDialog
        open={showFirstOrbGift}
        onClaim={handleClaimFirstOrb}
      />
    </div>
  );
}
