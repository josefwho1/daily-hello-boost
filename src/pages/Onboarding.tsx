import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import logoText from "@/assets/one-hello-logo-text.png";
import remiMascot from "@/assets/remi-mascot.png";

const signupSchema = z.object({
  name: z.string().trim().min(1, { message: "First name is required" }).max(50, { message: "Name must be less than 50 characters" }),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(50, { message: "Password must be less than 50 characters" }),
});

const whyHereOptions = [
  { id: "social-anxiety", label: "I want to reduce my social anxiety" },
  { id: "make-friends", label: "I want to make more friends" },
  { id: "confidence", label: "I want to build confidence" },
  { id: "new-city", label: "I'm new to a city and want to connect" },
  { id: "challenge", label: "I like challenges!" },
  { id: "other", label: "Just curious!" }
];

const modeOptions = [
  { value: "easy", label: "Easy", description: "3 hellos per week", emoji: "🌱" },
  { value: "normal", label: "Normal", description: "5 hellos per week", emoji: "🌟" },
  { value: "hard", label: "Hard", description: "7 hellos per week", emoji: "🔥" }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProgress } = useUserProgress();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Signup form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleReasonToggle = (id: string) => {
    setSelectedReasons(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id)
        : [...prev, id]
    );
  };

  const getTargetHellos = (mode: string) => {
    switch (mode) {
      case 'easy': return 3;
      case 'hard': return 7;
      default: return 5;
    }
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

      // Wait for user to be set, then update progress
      if (data.user) {
        // Small delay to ensure profile is created
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await updateProgress({
          mode: selectedMode,
          target_hellos_per_week: getTargetHellos(selectedMode),
          why_here: selectedReasons.join(','),
          has_completed_onboarding: true,
          is_onboarding_week: true,
          onboarding_week_start: new Date().toISOString().split('T')[0]
        });
      }

      toast({
        title: "Welcome!",
        description: `Hi ${validated.name}, let's start your journey!`,
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(step / 6) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <img src={remiMascot} alt="Remi" className="w-64 h-64 mx-auto" />
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-foreground">Hello there, I'm Remi!</h1>
                <p className="text-muted-foreground">
                  Just a quick 5 questions before your First Hello
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

          {/* Step 2: Why are you here? */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">Why are you here?</h2>
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

          {/* Step 3: Mode selection */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Challenge</h2>
                <p className="text-muted-foreground">
                  How many days per week do you want to say hello to someone new?
                </p>
              </div>

              <RadioGroup value={selectedMode} onValueChange={setSelectedMode}>
                {modeOptions.map((option) => (
                  <Card 
                    key={option.value}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedMode === option.value 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedMode(option.value)}
                  >
                    <div className="flex items-center gap-4">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <div className="flex-1">
                        <Label className="text-lg font-semibold cursor-pointer">
                          {option.emoji} {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </RadioGroup>

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

          {/* Step 4: Onboarding Week Intro */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <img src={remiMascot} alt="Remi" className="w-24 h-24 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Your First Week</h2>
                <p className="text-muted-foreground">
                  During your first week, we'll give you 7 different types of hello to try.
                </p>
              </div>

              <Card className="p-4 bg-primary/5 border-primary/20">
                <p className="text-center text-foreground">
                  Complete them in any order you like. This is your chance to discover what 
                  feels natural to you!
                </p>
              </Card>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✅ Smile & say hello</p>
                <p>✅ Give a compliment</p>
                <p>✅ Ask a simple question</p>
                <p>✅ Learn someone's name</p>
                <p>✅ ...and more!</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(5)} className="flex-1">
                  I'm Ready!
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Motivation */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">You're Almost There!</h2>
                <p className="text-muted-foreground">
                  Remember: 99% of people light up when a stranger is kind. 
                  Your job is to put more good energy into the world than you take out.
                </p>
              </div>

              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <p className="text-center text-lg font-medium text-foreground">
                  Now let's create your account! 👋
                </p>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(4)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(6)} className="flex-1">
                  Create Account
                </Button>
              </div>
            </div>
          )}

          {/* Step 6: Signup Form */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">Create Your Account</h2>
                <p className="text-muted-foreground">
                  Just a few details and you're ready to go!
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">First Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your first name"
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
                    placeholder="Simple letters & numbers"
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
                <Button variant="outline" onClick={() => setStep(5)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSignupAndComplete} 
                  className="flex-1"
                  disabled={isSubmitting || !name || !email || !password}
                >
                  {isSubmitting ? "Creating..." : "Start My Journey"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
