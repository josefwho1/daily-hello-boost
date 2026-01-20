import { Button } from "@/components/ui/button";

// Remi images
import remiCongrats1 from "@/assets/remi-congrats-1.webp";

// Onboarding images
import onboardingCompliment from "@/assets/onboarding-compliment.webp";
import onboardingQuestion from "@/assets/onboarding-question.webp";
import onboardingName from "@/assets/onboarding-name.webp";

export type FirstHelloPhase = 
  | 'greeting_complete'      // After completing First Hello (Greeting)
  | 'observation_intro'      // Intro to Observation
  | 'observation_complete'   // After completing Observation
  | 'compliment_intro'       // Intro to Compliment
  | 'compliment_complete'    // After completing Compliment
  | 'question_intro'         // Intro to Question
  | 'question_complete'      // After completing Question
  | 'getname_intro'          // Intro to Get a Name
  | 'all_complete';          // After completing all 5

interface FirstHelloInstructionScreenProps {
  onContinue: () => void;
  phase: FirstHelloPhase;
  username?: string;
}

export const FirstHelloInstructionScreen = ({
  onContinue,
  phase,
  username = "Friend",
}: FirstHelloInstructionScreenProps) => {
  const getContent = () => {
    switch (phase) {
      // After First Hello complete - show rating feedback
      case 'greeting_complete':
        return {
          image: remiCongrats1,
          title: "Congratulations!",
          subtitle: "FIRST HELLO COMPLETE",
          body: <p className="text-lg text-foreground font-medium">How was that?</p>,
          showRating: true,
          buttonText: "Continue",
        };

      // After Observation complete - intro to Compliment
      case 'observation_intro':
      case 'observation_complete':
      case 'compliment_intro':
        return {
          image: onboardingCompliment,
          title: "Nice work",
          subtitle: "knew you were a natural 🦝",
          body: (
            <>
              <p className="text-muted-foreground leading-relaxed">
                Next up: make someone's day.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Give a genuine compliment. Clothing or accessories work great.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Come back once you've done it.
              </p>
            </>
          ),
          buttonText: "I'll be back 😎",
        };

      // After Compliment complete - intro to Question
      case 'compliment_complete':
      case 'question_intro':
        return {
          image: onboardingQuestion,
          title: `Great job, ${username}.`,
          body: (
            <>
              <p className="text-muted-foreground leading-relaxed">
                Now let's add a little depth.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Ask a question to get to know someone.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Examples:
              </p>
              <p className="text-sm text-primary italic mt-2">
                "How are you?"
              </p>
              <p className="text-sm text-primary italic mt-1">
                "Where are you from?"
              </p>
              <p className="text-sm text-primary italic mt-1">
                "Got any plans for the weekend?"
              </p>
            </>
          ),
          buttonText: "See you soon",
        };

      // After Question complete - intro to Get a Name
      case 'question_complete':
      case 'getname_intro':
        return {
          image: onboardingName,
          title: "You're on a roll!",
          body: (
            <>
              <p className="text-muted-foreground leading-relaxed">
                Last one, it's time to start taking names.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Names are like magic, they turn strangers into friends.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Use any of the four hellos to start a conversation.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Then ask their name and save it here.
              </p>
            </>
          ),
          buttonText: "Got it, Remi.",
        };

      // After all 5 complete
      case 'all_complete':
        return {
          image: remiCongrats1,
          title: "🎉 Initiation Complete 🎉",
          body: (
            <>
              <p className="text-muted-foreground leading-relaxed">
                You can officially turn a stranger into a friend.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Welcome to the <span className="font-bold">Gaze</span>
              </p>
              <p className="text-sm text-primary italic mt-1">
                (that's what a group of raccoons is called 🦝)
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Now choose how you'd like to continue your journey.
              </p>
            </>
          ),
          buttonText: "Choose My Mode 🚀",
        };

      default:
        return {
          image: remiCongrats1,
          title: "Great job!",
          body: <p className="text-muted-foreground">Keep going!</p>,
          buttonText: "Continue",
        };
    }
  };

  const content = getContent();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div className="h-full bg-primary w-full" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <img 
            src={content.image} 
            alt="Remi" 
            className="w-72 h-auto max-h-80 mx-auto object-contain" 
          />
          
          {content.title && (
            <h1 className="text-2xl font-bold text-foreground">{content.title}</h1>
          )}
          
          {content.subtitle && (
            <p className="text-sm text-muted-foreground">
              {content.subtitle}
            </p>
          )}

          <div>
            {content.body}
          </div>

          <Button onClick={onContinue} className="w-full" size="lg">
            {content.buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
