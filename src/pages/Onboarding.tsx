import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserProgress } from "@/hooks/useUserProgress";
import logoText from "@/assets/one-hello-logo-text.png";
import remiMascot from "@/assets/remi-mascot.png";

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
  const [step, setStep] = useState(1);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await updateProgress({
        mode: selectedMode,
        target_hellos_per_week: getTargetHellos(selectedMode),
        why_here: selectedReasons.join(','),
        has_completed_onboarding: true,
        is_onboarding_week: true,
        onboarding_week_start: new Date().toISOString().split('T')[0]
      });
      navigate('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
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
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <img src={logoText} alt="One Hello" className="w-48 mx-auto" />
              <img src={remiMascot} alt="Remi" className="w-32 h-32 mx-auto" />
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-foreground">Welcome to One Hello!</h1>
                <p className="text-muted-foreground">
                  The app that helps you say hello to strangers and build real-world social connections.
                </p>
              </div>
              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                Let's Get Started! 👋
              </Button>
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

          {/* Step 5: Final */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">You're All Set!</h2>
                <p className="text-muted-foreground">
                  Remember: 99% of people light up when a stranger is kind. 
                  Your job is to put more good energy into the world than you take out.
                </p>
              </div>

              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <p className="text-center text-lg font-medium text-foreground">
                  Now go say Hello! 👋
                </p>
              </Card>

              <Button 
                onClick={handleComplete} 
                className="w-full" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Setting up..." : "Start My Journey"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
