import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getGuestState, createGuestState, createGuestProgress, updateGuestProgress } from "@/lib/indexedDB";

// Remi Waving images
import remiWaving1 from "@/assets/remi-waving-1.webp";
import remiWaving2 from "@/assets/remi-waving-2.webp";
import remiWaving3 from "@/assets/remi-waving-3.webp";
import remiWaving4 from "@/assets/remi-waving-4.webp";

const remiWavingImages = [remiWaving1, remiWaving2, remiWaving3, remiWaving4];

// Get a random image from an array
const getRandomImage = (images: string[]) => {
  return images[Math.floor(Math.random() * images.length)];
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Random Remi image - consistent during session
  const [welcomeRemiImage] = useState(() => getRandomImage(remiWavingImages));

  const handleCompleteIntro = async () => {
    try {
      setIsSubmitting(true);

      // Check if user is already authenticated
      const { data: { user: existingUser } } = await supabase.auth.getUser();
      
      if (existingUser) {
        // User is logged in, initialize their progress for First Hellos
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
        }, { onConflict: 'user_id' });
      } else {
        // Guest mode - create/update IndexedDB state
        let guestState = await getGuestState();
        if (!guestState) {
          guestState = await createGuestState();
          await createGuestProgress(guestState.device_id, guestState.guest_user_id);
        }
        
        // Update guest progress for First Hellos
        await updateGuestProgress({
          is_onboarding_week: true,
          current_day: 1,
          mode: 'first_hellos',
          has_completed_onboarding: false,
          orbs: 0,
          has_received_first_orb: false,
        });
      }

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

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Screen 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <img 
                src={welcomeRemiImage} 
                alt="Remi waving" 
                className="w-64 h-auto max-h-64 mx-auto object-contain animate-bounce-soft" 
              />
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-foreground">Welcome to One Hello!</h1>
                <p className="text-muted-foreground leading-relaxed">
                  Hello, I'm Remi. Your Reminder Raccoon, companion & guide.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  This is a place to encourage real human connection.
                </p>
                <p className="text-lg font-medium text-primary">
                  One Hello at a time.
                </p>
              </div>
              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                Continue
              </Button>
              <button 
                onClick={() => navigate('/magic-link')}
                className="text-sm text-muted-foreground hover:text-primary underline"
              >
                I already have an account
              </button>
            </div>
          )}

          {/* Screen 2: How it works */}
          {step === 2 && (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-foreground">How it works</h1>
                <p className="text-muted-foreground leading-relaxed">
                  Every social interaction needs to start from somewhere.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Here you will get ideas, reminders and encouragement on how to start conversations with strangers, reconnect with old friends & make the world a warmer place.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1" size="lg">
                  I'm In
                </Button>
              </div>
            </div>
          )}

          {/* Screen 3: What users felt */}
          {step === 3 && (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-foreground">What users felt after only 7 days</h1>
                
                <div className="space-y-4">
                  <div className="bg-success/10 rounded-lg p-4">
                    <p className="text-4xl font-bold text-success">100%</p>
                    <p className="text-muted-foreground">saw a positive improvement in their week</p>
                  </div>
                  
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-4xl font-bold text-primary">93%</p>
                    <p className="text-muted-foreground">felt more confident</p>
                  </div>
                  
                  <div className="bg-accent/20 rounded-lg p-4">
                    <p className="text-4xl font-bold text-accent-foreground">86%</p>
                    <p className="text-muted-foreground">felt more connected</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1" size="lg">
                  Let's do it
                </Button>
              </div>
            </div>
          )}

          {/* Screen 4: First Hello's Initiation */}
          {step === 4 && (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <img 
                src={welcomeRemiImage} 
                alt="Remi" 
                className="w-48 h-auto max-h-48 mx-auto object-contain" 
              />
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-foreground">First Hello's</h1>
                <p className="text-muted-foreground leading-relaxed">
                  I'll guide you through your First Hello's
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  These will introduce different ways to say hello and start conversations with people.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleCompleteIntro} 
                  className="flex-1" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Loading..." : "Let's begin"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
