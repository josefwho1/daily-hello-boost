import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import logoText from "@/assets/one-hello-logo-text.png";
import remiHoldingOrb from "@/assets/remi-holding-orb.webp";

// Remi Waving images - for welcome/onboarding and challenge cards
import remiWaving1 from "@/assets/remi-waving-1.webp";
import remiWaving2 from "@/assets/remi-waving-2.webp";
import remiWaving3 from "@/assets/remi-waving-3.webp";
import remiWaving4 from "@/assets/remi-waving-4.webp";

// Remi Curious images - for comfort rating screen
import remiCurious1 from "@/assets/remi-curious-1.webp";
import remiCurious2 from "@/assets/remi-curious-2.webp";
import remiCurious3 from "@/assets/remi-curious-3.webp";
import remiCurious4 from "@/assets/remi-curious-4.webp";

// Remi Surprised images - for specific onboarding screens
import remiSurprised1 from "@/assets/remi-surprised-1.webp";
import remiSurprised2 from "@/assets/remi-surprised-2.webp";
import remiCongrats3 from "@/assets/remi-congrats-3.webp";

const remiWavingImages = [remiWaving1, remiWaving2, remiWaving3, remiWaving4];
const remiCuriousImages = [remiCurious1, remiCurious2, remiCurious3, remiCurious4];
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from "lucide-react";

const signupSchema = z.object({
  name: z.string().trim().min(1, { message: "First name is required" }).max(50, { message: "Name must be less than 50 characters" }),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(50, { message: "Password must be less than 50 characters" }),
});

const whyHereOptions = [
  { id: "confidence", label: "Build confidence" },
  { id: "meet-people", label: "To meet new people" },
  { id: "fun", label: "For fun" },
  { id: "social-anxiety", label: "Reduce social anxiety" },
  { id: "comfort-zone", label: "Get out of my comfort zone" },
  { id: "community", label: "To feel more connected in my community" },
  { id: "habit", label: "To build a new habit" },
  { id: "curious", label: "Just curious" }
];

// Generate timezone options from GMT-12 to GMT+14
const timezoneOptions: { value: string; label: string }[] = [];
for (let i = -12; i <= 14; i++) {
  const sign = i >= 0 ? '+' : '';
  const hours = Math.abs(i).toString().padStart(2, '0');
  const value = `${sign}${hours}:00`;
  const label = `GMT${sign}${i}`;
  timezoneOptions.push({ value, label });
}

// Get a random image from an array
const getRandomImage = (images: string[]) => {
  return images[Math.floor(Math.random() * images.length)];
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [comfortRating, setComfortRating] = useState(5);
  
  // Random Remi images - memoized to stay consistent during session
  const [welcomeRemiImage] = useState(() => getRandomImage(remiWavingImages));
  const [curiousRemiImage] = useState(() => getRandomImage(remiCuriousImages));
  const [challengeRemiImage] = useState(() => getRandomImage(remiWavingImages));
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState("+00:00");
  const [emailRemindersEnabled, setEmailRemindersEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingTimezone, setIsDetectingTimezone] = useState(false);
  
  // Signup form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Auto-detect timezone on mount
  useEffect(() => {
    detectTimezone();
  }, []);

  const detectTimezone = () => {
    try {
      setIsDetectingTimezone(true);
      const offset = new Date().getTimezoneOffset();
      const hours = Math.floor(Math.abs(offset) / 60);
      const sign = offset <= 0 ? '+' : '-';
      const formattedOffset = `${sign}${hours.toString().padStart(2, '0')}:00`;
      
      // Find the closest matching timezone option
      const matchingTz = timezoneOptions.find(tz => tz.value === formattedOffset);
      if (matchingTz) {
        setSelectedTimezone(matchingTz.value);
      }
    } catch (error) {
      console.error("Error detecting timezone:", error);
    } finally {
      setIsDetectingTimezone(false);
    }
  };

  const handleReasonToggle = (id: string) => {
    setSelectedReasons(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id)
        : [...prev, id]
    );
  };

  // Track if account was created
  const [accountCreated, setAccountCreated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const handleCreateAccount = async () => {
    try {
      const validated = signupSchema.parse({ name, email, password });
      setIsSubmitting(true);

      const redirectUrl = `${window.location.origin}/`;

      const { error: signUpError, data } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: validated.name
          }
        }
      });

      if (signUpError) throw signUpError;

      // Wait for user to be set, then create profile
      if (data.user) {
        // Small delay to let auth complete
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // First, CREATE the profile (upsert to handle edge cases)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            username: validated.name,
            timezone_preference: selectedTimezone
          }, { onConflict: 'id' });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw new Error('Failed to create profile');
        }

        setUserId(data.user.id);
        setAccountCreated(true);
        setStep(6); // Proceed to next onboarding step
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        // Handle "User already registered" specifically
        if (error.message.includes('already registered')) {
          toast({
            title: "Account exists",
            description: "This email is already registered. Please sign in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      setIsSubmitting(true);

      const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      if (!currentUserId) {
        throw new Error('No user found');
      }

      // Create user progress with onboarding data
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: currentUserId,
          why_here: selectedReasons.join(','),
          is_onboarding_week: true,
          onboarding_week_start: new Date().toISOString().split('T')[0],
          current_day: 1,
          current_streak: 0,
          mode: '7-day-starter',
          target_hellos_per_week: 7,
          has_completed_onboarding: false,
          current_phase: 'onboarding',
          onboarding_email_opt_in: emailRemindersEnabled,
          daily_email_opt_in: emailRemindersEnabled,
          chill_email_opt_in: emailRemindersEnabled
        }, { onConflict: 'user_id' });

      if (progressError) {
        console.error('Error creating progress:', progressError);
        throw new Error('Failed to create progress');
      }

      toast({
        title: "Let's go!",
        description: `Your 7-day journey begins now!`,
      });
      
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 12; // 5 profile questions + 7 intro screens

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
          {/* Step 1: Welcome - Introduce Remi */}
          {step === 1 && (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <img src={welcomeRemiImage} alt="Remi waving" className="w-64 h-auto max-h-64 mx-auto object-contain animate-bounce-soft" />
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-foreground">Welcome to One Hello!</h1>
                <p className="text-muted-foreground leading-relaxed">
                  This is a place to meet new people, build confidence & have fun - one simple hello at a time.
                </p>
              </div>
              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                Continue
              </Button>
              <button 
                onClick={() => navigate('/signin')}
                className="text-sm text-muted-foreground hover:text-primary underline"
              >
                I already have an account
              </button>
            </div>
          )}

          {/* Step 2: Why are you joining? */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">Why are you joining One Hello?</h2>
                <p className="text-muted-foreground">Select all that apply</p>
              </div>
              
              <div className="space-y-3">
                {whyHereOptions.map((option) => (
                  <Card 
                    key={option.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedReasons.includes(option.id) 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleReasonToggle(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox 
                        checked={selectedReasons.includes(option.id)}
                        onCheckedChange={() => handleReasonToggle(option.id)}
                      />
                      <Label className="cursor-pointer flex-1">{option.label}</Label>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  className="flex-1"
                  disabled={selectedReasons.length === 0}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Comfort Rating */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <img src={remiCurious4} alt="Remi curious" className="w-32 h-auto max-h-32 mx-auto object-contain mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">How comfortable do you feel talking to strangers?</h2>
                <p className="text-sm text-muted-foreground italic">
                  (i.e. friends you haven't met yet 🦝)
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground px-1">
                  <span>1 ← Terrified</span>
                  <span>Totally natural → 10</span>
                </div>
                
                <div className="grid grid-cols-10 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setComfortRating(num)}
                      className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                        comfortRating === num
                          ? 'bg-primary text-primary-foreground scale-110'
                          : 'bg-muted hover:bg-muted/80 text-foreground'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  {comfortRating <= 2 && "(heart races, I avoid it)"}
                  {(comfortRating === 3 || comfortRating === 4) && "(quite nervous, I don't like to)"}
                  {(comfortRating === 5 || comfortRating === 6) && "(a bit nervous but manageable)"}
                  {comfortRating === 7 && "(pretty comfortable)"}
                  {comfortRating === 8 && "(comfortable)"}
                  {comfortRating === 9 && "(super comfortable)"}
                  {comfortRating === 10 && "(no problem at all)"}
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Timezone Selection */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold text-foreground mb-2">What timezone are you in?</h2>
                <p className="text-muted-foreground">
                  This helps us reset your streaks at midnight your time.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Your timezone</Label>
                  <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezoneOptions.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  variant="outline" 
                  onClick={detectTimezone}
                  disabled={isDetectingTimezone}
                  className="w-full"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {isDetectingTimezone ? 'Detecting...' : 'Auto-detect my timezone'}
                </Button>
              </div>

              {/* Email Reminders Toggle */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <Label className="text-foreground font-medium">Daily reminders</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      One email per day to help you finish the 7-day challenge
                    </p>
                  </div>
                  <Switch
                    checked={emailRemindersEnabled}
                    onCheckedChange={setEmailRemindersEnabled}
                  />
                </div>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(5)} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Create Account */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">Create Your Account</h2>
                <p className="text-muted-foreground">
                  Just a few details and you're ready to go!
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={255}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 6 characters
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(4)} className="flex-1" disabled={isSubmitting}>
                  Back
                </Button>
                <Button 
                  onClick={handleCreateAccount} 
                  className="flex-1"
                  disabled={!name || !email || !password || password.length < 6 || isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Continue'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Your journey starts here */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <img 
                  src={remiSurprised1} 
                  alt="Remi surprised" 
                  className="w-32 h-auto max-h-32 mx-auto mb-4 object-contain" 
                />
                <h2 className="text-2xl font-bold text-foreground mb-3 italic">Your journey starts here.</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For your first week, I'll guide you through one small action each day.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Progressively getting more challenging.
                </p>
              </div>

              <Button onClick={() => setStep(7)} className="w-full" size="lg">
                Okay, tell me more
              </Button>
              <button 
                onClick={() => setStep(5)}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary underline"
              >
                Back
              </button>
            </div>
          )}

          {/* Step 7: The Purpose */}
          {step === 7 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <img 
                  src={remiCurious1} 
                  alt="Remi curious" 
                  className="w-32 h-auto max-h-32 mx-auto mb-4 object-contain" 
                />
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  The Purpose
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    These challenges are designed to get you out in the real world.
                  </p>
                  <p>
                    Interacting with new people, strangers & friends you haven't met yet.
                  </p>
                </div>
              </div>

              <Button onClick={() => setStep(8)} className="w-full" size="lg">
                I'm In
              </Button>
              <button 
                onClick={() => setStep(6)}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary underline"
              >
                Back
              </button>
            </div>
          )}

          {/* Step 8: What to expect */}
          {step === 8 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
              <img 
                  src={remiWaving3} 
                  alt="Remi waving" 
                  className="w-32 h-auto max-h-32 mx-auto mb-4 object-contain" 
                />
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  What to expect
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Every morning, I'll reveal a new Hello.
                  </p>
                  <p>
                    You'll complete it anytime that day.
                  </p>
                  <p>
                    Don't forget to log it inside here so I know you've done it 🦝
                  </p>
                </div>
              </div>

              <Button onClick={() => setStep(9)} className="w-full" size="lg">
                Sounds good
              </Button>
              <button 
                onClick={() => setStep(7)}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary underline"
              >
                Back
              </button>
            </div>
          )}

          {/* Step 9: What you can achieve */}
          {step === 9 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <img 
                  src={remiSurprised2} 
                  alt="Remi excited" 
                  className="w-32 h-auto max-h-32 mx-auto mb-4 object-contain" 
                />
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  What you can achieve in 7 days
                </h2>
                <div className="space-y-4">
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <p className="text-3xl font-bold text-primary">100%</p>
                    <p className="text-muted-foreground">saw a positive improvement in their week</p>
                  </Card>
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <p className="text-3xl font-bold text-primary">93%</p>
                    <p className="text-muted-foreground">felt more confident</p>
                  </Card>
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <p className="text-3xl font-bold text-primary">86%</p>
                    <p className="text-muted-foreground">felt more connected to their community</p>
                  </Card>
                </div>
              </div>

              <Button onClick={() => setStep(10)} className="w-full" size="lg">
                Let's do it
              </Button>
              <button 
                onClick={() => setStep(8)}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary underline"
              >
                Back
              </button>
            </div>
          )}

          {/* Step 10: Before you start... */}
          {step === 10 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <img 
                  src={remiCongrats3} 
                  alt="Remi thumbs up" 
                  className="w-32 h-auto max-h-32 mx-auto mb-4 object-contain" 
                />
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Before you start…
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Not everyone will hear you — and that's okay.<br />
                    Don't take it personally.
                  </p>
                  <p>
                    Stay safe and trust your instincts.<br />
                    This is meant to be fun, light and a little challenging.
                  </p>
                  <p>
                    The goal isn't perfect conversations.<br />
                    It's simply to show you what can happen when you say hello more.
                  </p>
                  <p>
                    You might be surprised 🙂
                  </p>
                </div>
              </div>

              <Button onClick={() => setStep(11)} className="w-full" size="lg">
                I understand
              </Button>
              <button 
                onClick={() => setStep(9)}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary underline"
              >
                Back
              </button>
            </div>
          )}

          {/* Step 11: Your first reward (Orbs) */}
          {step === 11 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <img src={remiHoldingOrb} alt="Remi with Orb" className="w-32 h-auto max-h-32 mx-auto mb-4 object-contain" />
                <h2 className="text-2xl font-bold text-foreground mb-3 italic">
                  Complete Day 1 to earn your first Orb.
                </h2>
                <div className="space-y-3 text-muted-foreground leading-relaxed">
                  <p>
                    Orbs are your streak savers — a magical hello for when life gets busy.
                  </p>
                  <p>
                    You'll get your first Orb after finishing your First Hello.
                  </p>
                </div>
              </div>

              <Button onClick={() => setStep(12)} className="w-full" size="lg">
                I love Orbs
              </Button>
              <button 
                onClick={() => setStep(10)}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary underline"
              >
                Back
              </button>
            </div>
          )}

          {/* Step 12: Your first challenge */}
          {step === 12 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <img src={challengeRemiImage} alt="Remi" className="w-24 h-auto max-h-24 mx-auto mb-4 object-contain" />
                <p className="text-sm text-primary font-medium mb-2">Day 1</p>
                <h2 className="text-2xl font-bold text-foreground mb-4">First Hello</h2>
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <p className="text-lg text-foreground leading-relaxed">
                    "Smile and say hello to a stranger today."
                  </p>
                  <p className="text-sm text-muted-foreground mt-3">
                    Log it in the app once you're done to receive your reward.
                  </p>
                </Card>
              </div>

              <Button 
                onClick={handleCompleteOnboarding} 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Starting...' : "Let's go"}
              </Button>
              <button 
                onClick={() => setStep(11)}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary underline"
              >
                Back
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
