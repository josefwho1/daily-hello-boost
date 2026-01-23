import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Remi images (10 celebrating variants)
import remiCongrats1 from "@/assets/remi-congrats-1.webp";
import remiCelebrating1 from "@/assets/remi-celebrating-1.webp";
import remiCelebrating2 from "@/assets/remi-celebrating-2.webp";
import remiCelebrating3 from "@/assets/remi-celebrating-3.webp";
import remiCelebrating4 from "@/assets/remi-celebrating-4.webp";
import remiCelebrating5 from "@/assets/remi-celebrating-5.webp";
import remiCelebrating6 from "@/assets/remi-celebrating-6.webp";
import remiCelebrating7 from "@/assets/remi-celebrating-7.webp";
import remiCelebrating8 from "@/assets/remi-celebrating-8.webp";
import remiCelebrating9 from "@/assets/remi-celebrating-9.webp";
import remiCelebrating10 from "@/assets/remi-celebrating-10.webp";

const celebratingImages = [
  remiCelebrating1, remiCelebrating2, remiCelebrating3, remiCelebrating4, remiCelebrating5,
  remiCelebrating6, remiCelebrating7, remiCelebrating8, remiCelebrating9, remiCelebrating10
];

const getRandomCelebratingImage = () => celebratingImages[Math.floor(Math.random() * celebratingImages.length)];

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

interface FirstHelloInstructionDialogProps {
  open: boolean;
  onContinue: () => void;
  phase: FirstHelloPhase;
  rating?: 'positive' | 'neutral' | 'negative' | null;
  username?: string;
}

export const FirstHelloInstructionDialog = ({
  open,
  onContinue,
  phase,
  rating,
  username = "Friend",
}: FirstHelloInstructionDialogProps) => {
  const getContent = () => {
    switch (phase) {
      // After First Hello complete - show rating feedback
      case 'greeting_complete':
        return {
          image: remiCongrats1,
          title: "Congratulations!",
          subtitle: "FIRST HELLO COMPLETE",
          body: "How was that?",
          showRatingFeedback: true,
          buttonText: "Continue",
        };

      // After rating - intro to Observation
      case 'observation_intro':
        return {
          image: getRandomCelebratingImage(),
          title: "Great Work!",
          body: (
            <>
              <p className="text-muted-foreground leading-relaxed">
                Now lets add some conversation starters.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                First up, make an <span className="font-semibold text-foreground">Observation</span>.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Comment on something you & someone are both experiencing.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Weather, atmosphere, vibes - anything shared.
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
          image: getRandomCelebratingImage(),
          title: "Compliment",
          body: (
            <>
              <p className="text-sm text-muted-foreground">
                Nice work, knew you were a natural 🦝
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Next up: make someone's day.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Give someone a <span className="font-semibold text-foreground">genuine compliment</span>.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Clothing or accessories work great.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Come back once you've done it.
              </p>
            </>
          ),
          buttonText: "I'll be back 😎",
        };

      // After Compliment complete
      case 'compliment_complete':
      case 'question_intro':
        return {
          image: getRandomCelebratingImage(),
          title: "Question",
          body: (
            <>
              <p className="text-muted-foreground leading-relaxed">
                Great job, <span className="text-primary font-medium">{username}</span>.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Now lets use a question to get to know someone new.
              </p>
              <p className="text-sm text-muted-foreground mt-3">Examples:</p>
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

      // After Question complete
      case 'question_complete':
      case 'getname_intro':
        return {
          image: getRandomCelebratingImage(),
          title: "Name",
          body: (
            <>
              <p className="text-muted-foreground leading-relaxed">
                You're on a roll, it's time to start taking names!
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Names are like magic, they turn strangers into friends.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Use any of the four hellos to start a conversation.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Then ask their name and save it here (so you don't forget)
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
          image: getRandomCelebratingImage(),
          title: "Great job!",
          body: <p className="text-muted-foreground">Keep going!</p>,
          buttonText: "Continue",
        };
    }
  };

  const content = getContent();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onContinue()}>
      <DialogContent 
        className="sm:max-w-md" 
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={content.image} 
              alt="Remi" 
              className="w-40 h-auto max-h-40 object-contain" 
            />
          </div>
          {content.title && (
            <DialogTitle className="text-2xl text-center">
              {content.title}
            </DialogTitle>
          )}
          {content.subtitle && (
            <p className="text-sm font-bold text-primary tracking-wide mt-2">
              {content.subtitle}
            </p>
          )}
        </DialogHeader>

        <div className="text-center py-4">
          {typeof content.body === 'string' ? (
            <p className="text-muted-foreground">{content.body}</p>
          ) : (
            content.body
          )}
        </div>

        <Button onClick={onContinue} className="w-full" size="lg">
          {content.buttonText}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
