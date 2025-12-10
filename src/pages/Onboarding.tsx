import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import logoText from "@/assets/one-hello-logo-text.png";
import remiMascot from "@/assets/remi-waving.webp";
import remiHoldingOrb from "@/assets/remi-holding-orb.webp";
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

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [comfortRating, setComfortRating] = useState(5);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState("+00:00");
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

  const handleSignupAndComplete = async () => {
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

      // Wait for user to be set, then create profile and progress
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

        // Then CREATE user progress with onboarding data
        const { error: progressError } = await supabase
          .from('user_progress')
          .upsert({
            user_id: data.user.id,
            why_here: selectedReasons.join(','),
            is_onboarding_week: true,
            onboarding_week_start: new Date().toISOString().split('T')[0],
            current_day: 1,
            current_streak: 0,
            mode: '7-day-starter', // Start with 7-day starter mode
            target_hellos_per_week: 7,
            has_completed_onboarding: false
          }, { onConflict: 'user_id' });

        if (progressError) {
          console.error('Error creating progress:', progressError);
          throw new Error('Failed to create progress');
        }
      }

      toast({
        title: "Welcome!",
        description: `Hi ${validated.name}, let's start your 7-day journey!`,
      });
      
      navigate('/');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
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

  const totalSteps = 10; // 5 profile questions + 5 intro screens

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
              <img src={remiMascot} alt="Remi" className="w-64 h-auto max-h-64 mx-auto object-contain animate-bounce-soft" />
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-foreground">You're in. 🦝</h1>
                <p className="text-muted-foreground leading-relaxed">
                  This is a place to build confidence, meet new people, and make real connections — one simple hello at a time.
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
                <h2 className="text-2xl font-bold text-foreground mb-2">How comfortable do you feel talking to strangers?</h2>
                <p className="text-muted-foreground">
                  Rate from 1-10
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
                <Button variant="outline" onClick={() => setStep(4)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(6)} 
                  className="flex-1"
                  disabled={!name || !email || !password || password.length < 6}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Why we start with 7 days */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <img 
                  src={remiMascot} 
                  alt="Remi" 
                  className="w-32 h-auto max-h-32 mx-auto mb-4 object-contain" 
                />
                <h2 className="text-2xl font-bold text-foreground mb-3">Your journey starts with a 7-day challenge.</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For your first week, I'll guide you through one small action each day.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  With each day getting progressively more challenging.
                </p>
              </div>

              <Button onClick={() => setStep(7)} className="w-full" size="lg">
                Okay, tell me more
              </Button>
            </div>
          )}

          {/* Step 7: What to expect */}
          {step === 7 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  What to expect
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Each day, I'll reveal a new challenge.
                  </p>
                  <p>
                    You'll complete it anytime that day.
                  </p>
                  <p>
                    Don't forget to log it inside here so I know you've done it.
                  </p>
                </div>
              </div>

              <Button onClick={() => setStep(8)} className="w-full" size="lg">
                Sounds good
              </Button>
            </div>
          )}

          {/* Step 8: What you can achieve */}
          {step === 8 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  What you can achieve in 7 days
                </h2>
                <div className="space-y-4">
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <p className="text-3xl font-bold text-primary">100%</p>
                    <p className="text-muted-foreground">said their week felt better</p>
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

              <Button onClick={() => setStep(9)} className="w-full" size="lg">
                Let's do it
              </Button>
            </div>
          )}

          {/* Step 9: Your first reward (Orbs) */}
          {step === 9 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <img src={remiHoldingOrb} alt="Remi with Orb" className="w-32 h-auto max-h-32 mx-auto mb-4 object-contain" />
                <h2 className="text-2xl font-bold text-foreground mb-3">
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

              <Button onClick={() => setStep(10)} className="w-full" size="lg">
                I love Orbs
              </Button>
            </div>
          )}

          {/* Step 10: Your first challenge */}
          {step === 10 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <img src={remiMascot} alt="Remi" className="w-24 h-auto max-h-24 mx-auto mb-4 object-contain" />
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
                onClick={handleSignupAndComplete} 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account...' : "Let's go"}
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
