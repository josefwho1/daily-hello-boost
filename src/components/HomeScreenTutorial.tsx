import { useState } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import remiMascot from "@/assets/remi-waving.webp";

interface TutorialStep {
  title: string;
  body: string;
  targetId?: string; // ID of the element to highlight
}

interface HomeScreenTutorialProps {
  open: boolean;
  mode: 'daily' | 'chill';
  onComplete: () => void;
}

export const HomeScreenTutorial = ({ open, mode, onComplete }: HomeScreenTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const dailySteps: TutorialStep[] = [
    {
      title: "Welcome to Daily Mode!",
      body: "Grow your streak by saying at least one hello a day!",
    },
    {
      title: "Log a Hello",
      body: "Any Hello counts towards your streak. Log them here.",
      targetId: "any-hello-card",
    },
    {
      title: "Today's Hello",
      body: "Today's Hello gives you a daily suggestion for inspiration and extra XP.\n\nUse it, ignore it, or do your own hello - it all counts.",
      targetId: "todays-hello-card",
    },
    {
      title: "Remi's Challenge",
      body: "One optional challenge each week for a little extra push.\n\n(And an Orb for your efforts)",
      targetId: "weekly-challenge-card",
    },
  ];

  const chillSteps: TutorialStep[] = [
    {
      title: "Welcome to Chill Mode!",
      body: "Grow your streak by saying at least 3 Hellos per week.",
    },
    {
      title: "Log a Hello",
      body: "Any Hello counts towards your streak. Log them here.\n\nCan do 3 in one day, or spread them out - up to you :)",
      targetId: "any-hello-card",
    },
    {
      title: "Today's Hello",
      body: "Today's Hello gives you a daily suggestion for inspiration and extra XP.\n\nUse it, ignore it, or do your own hello - it all counts.",
      targetId: "todays-hello-card",
    },
    {
      title: "Remi's Challenge",
      body: "One optional challenge each week for a little extra push.\n\n(And an Orb for your efforts)",
      targetId: "weekly-challenge-card",
    },
  ];

  const steps = mode === 'daily' ? dailySteps : chillSteps;
  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  // For the first step (welcome message), show a centered dialog
  if (isFirstStep) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent 
          className="max-w-full w-full h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] sm:max-w-full sm:rounded-none border-none bg-gradient-to-b from-background via-background to-primary/10 overflow-hidden p-0 m-0 top-0 translate-y-0 [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="flex flex-col items-center justify-center h-full px-6 py-8 relative overflow-y-auto">
            <motion.div 
              className="text-center max-w-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.img
                src={remiMascot}
                alt="Remi"
                className="w-32 h-auto max-h-32 object-contain mx-auto mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              />
              
              <motion.h2 
                className="text-2xl font-bold text-foreground mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {currentStepData.title}
              </motion.h2>
              
              <motion.p 
                className="text-foreground/70 text-lg mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {currentStepData.body}
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button onClick={handleNext} className="w-full" size="lg">
                  Let's go! 🚀
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // For subsequent steps, show an overlay with spotlight effect
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Dark overlay */}
          <motion.div
            className="fixed inset-0 bg-black/70 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleNext}
          />
          
          {/* Tooltip pointing to the target */}
          <motion.div
            className="fixed z-[101] left-4 right-4 mx-auto max-w-sm"
            style={{
              top: currentStepData.targetId === 'any-hello-card' ? '35%' :
                   currentStepData.targetId === 'todays-hello-card' ? '50%' :
                   currentStepData.targetId === 'weekly-challenge-card' ? '65%' : '50%'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="bg-card border border-border rounded-2xl p-5 shadow-xl">
              <div className="flex items-start gap-3 mb-3">
                <img 
                  src={remiMascot} 
                  alt="Remi" 
                  className="w-10 h-10 object-contain"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {currentStepData.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-foreground/80 whitespace-pre-line mb-4">
                {currentStepData.body}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                
                <Button onClick={handleNext} size="sm">
                  {isLastStep ? "Got it! ✨" : "Next"}
                </Button>
              </div>
            </div>
            
            {/* Arrow pointing down to the card */}
            <div className="flex justify-center mt-2">
              <motion.div 
                className="text-primary"
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 16l-6-6h12l-6 6z"/>
                </svg>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
