import { Button } from "@/components/ui/button";

// Remi images
import remiCongrats1 from "@/assets/remi-congrats-1.webp";
import remiCelebrating1 from "@/assets/remi-celebrating-1.webp";
import remiCelebrating2 from "@/assets/remi-celebrating-2.webp";
import remiCelebrating3 from "@/assets/remi-celebrating-3.webp";
import remiCelebrating4 from "@/assets/remi-celebrating-4.webp";

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

      // After rating - intro to Observation
      case 'observation_intro':
        return {
          image: remiCelebrating1,
          title: null,
          body: (
            <>
              <p className="text-muted-foreground leading-relaxed">
                Now lets add some conversation starters.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                First up, make an <span className="font-semibold text-foreground">Observation</span>.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Think the weather, atmosphere, vibes etc.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Anything you are experiencing in a shared space.
              </p>
              <p className="text-sm text-primary italic mt-4">
                "What a beautiful day" "Long line hey" "Love the vibe in here"
              </p>
            </>
          ),
          buttonText: "Let's do it",
        };

      // After Observation complete
      case 'observation_complete':
      case 'compliment_intro':
        return {
          image: remiCelebrating3,
          title: null,
          body: (
            <>
              <p className="text-muted-foreground leading-relaxed">
                Well done! Knew you were a natural 🦝
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Now its time to make someone's day (and possibly yours)
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Give a stranger a <span className="font-semibold text-foreground">genuine compliment</span>.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Clothing and accessories work best.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Watch them smile, come back here once you're done
              </p>
            </>
          ),
          buttonText: "I'll be back 😎",
        };

      // After Compliment complete
      case 'compliment_complete':
      case 'question_intro':
        return {
          image: remiCelebrating4,
          title: null,
          body: (
            <>
              <p className="text-muted-foreground leading-relaxed">
                Nice work <span className="text-primary font-medium">{username}</span>!
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Now let's add some depth.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Ask a stranger a <span className="font-semibold text-foreground">question</span> to get to know them.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Where are you from? What are their weekend plans.
              </p>
            </>
          ),
          buttonText: "See you soon",
        };

      // After Question complete
      case 'question_complete':
      case 'getname_intro':
        return {
          image: remiCelebrating2,
          title: null,
          body: (
            <>
              <p className="text-muted-foreground leading-relaxed">
                You're on a roll!
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Last one, it's time to start <span className="font-semibold text-foreground">taking names</span>.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Names are like magic, they turn strangers into friends.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Use a combination of the 4 Hellos to start a conversation.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Then get their name and write it down in here once you're done.
              </p>
            </>
          ),
          buttonText: "Got it, Remi.",
        };

      // After all 5 complete
      case 'all_complete':
        return {
          image: remiCongrats1,
          title: "🎉 Congratulations 🎉",
          body: (
            <>
              <p className="font-semibold text-foreground">Initiation complete.</p>
              <p className="text-muted-foreground leading-relaxed mt-2">
                You can officially turn a stranger into a friend.
              </p>
              <p className="text-foreground font-medium mt-2">Welcome to the Gaze</p>
              <p className="text-sm text-muted-foreground mt-1">
                (that's what a group of raccoons is called 🦝)
              </p>
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Now it's time to choose how you want to continue your journey...
                </p>
              </div>
            </>
          ),
          buttonText: "Choose My Mode 🚀",
        };

      default:
        return {
          image: remiCelebrating1,
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
            className="w-40 h-auto max-h-40 mx-auto object-contain" 
          />
          
          {content.title && (
            <h1 className="text-2xl font-bold text-foreground">{content.title}</h1>
          )}
          
          {content.subtitle && (
            <p className="text-sm font-bold text-primary tracking-wide">
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
