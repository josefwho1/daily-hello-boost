import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import remiWaving from "@/assets/remi-waving.webp";

interface TutorialStep {
  emoji: string;
  title: string;
  body: string;
}

interface HomeScreenTutorialProps {
  open: boolean;
  onComplete: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    emoji: "👋",
    title: "Welcome to the Home page",
    body: "This is your daily dashboard where you'll track your connections and progress.",
  },
  {
    emoji: "👇",
    title: "Log a Hello",
    body: "Log a Hello anytime you meet someone and want to remember them.",
  },
  {
    emoji: "🗣️",
    title: "Voice to text",
    body: "Use our AI voice to text function to easily add multiple connections in one go.",
  },
  {
    emoji: "💡",
    title: "Today's Hello",
    body: "Today's Hello gives you daily prompts and suggestions on how to connect with more people.",
  },
  {
    emoji: "📖",
    title: "The Hellobook",
    body: "The Hellobook is where we store all your connections. You can search and filter to find people so you never forget.",
  },
];

export const HomeScreenTutorial = ({ open, onComplete }: HomeScreenTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setCurrentStep(0);
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Reset step when closed
  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
    }
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Dark overlay */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleNext}
          />

          {/* Centered tooltip card */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              key={currentStep}
              className="bg-card border-2 border-primary rounded-2xl p-6 shadow-2xl max-w-sm w-full"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              {/* Remi avatar for first step only */}
              {currentStep === 0 && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={remiWaving} 
                    alt="Remi" 
                    className="w-20 h-20 object-contain"
                  />
                </div>
              )}

              {/* Emoji for other steps */}
              {currentStep > 0 && (
                <div className="flex justify-center mb-3">
                  <span className="text-4xl">{currentStepData.emoji}</span>
                </div>
              )}

              {/* Title */}
              <h3 className="text-xl font-bold text-foreground text-center mb-2">
                {currentStepData.title}
              </h3>

              {/* Body */}
              <p className="text-muted-foreground text-center mb-6 leading-relaxed">
                {currentStepData.body}
              </p>

              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mb-4">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={handleNext}
                className="w-full bg-primary text-primary-foreground font-medium py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors"
              >
                {isLastStep ? "Let's go! ✨" : "Next"}
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
