import { useState, useEffect, useRef } from "react";
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
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

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

  // Calculate tooltip position based on target element
  useEffect(() => {
    if (!open || isFirstStep || !currentStepData.targetId) {
      setTooltipPosition(null);
      return;
    }

    const updatePosition = () => {
      const targetElement = document.getElementById(currentStepData.targetId!);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const tooltipHeight = tooltipRef.current?.offsetHeight || 180;
        
        // Position tooltip above the target element
        setTooltipPosition({
          top: rect.top - tooltipHeight - 16, // 16px gap above element
          left: rect.left,
          width: rect.width,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [open, currentStep, isFirstStep, currentStepData.targetId]);

  const handleNext = () => {
    if (isLastStep) {
      setCurrentStep(0); // Reset for next time
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

  // For subsequent steps, show a floating tooltip above the target element (no overlay)
  return (
    <AnimatePresence>
      {open && tooltipPosition && (
        <motion.div
          ref={tooltipRef}
          className="fixed z-[101] mx-4"
          style={{
            top: tooltipPosition.top,
            left: Math.max(16, tooltipPosition.left + (tooltipPosition.width / 2) - 160), // Center tooltip, but keep 16px margin
            maxWidth: 'calc(100vw - 32px)',
            width: 320,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
        >
          <div className="bg-card border-2 border-primary rounded-2xl p-5 shadow-xl">
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
          <div className="flex justify-center mt-1">
            <motion.div 
              className="text-primary"
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 16l-6-6h12l-6 6z"/>
              </svg>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};