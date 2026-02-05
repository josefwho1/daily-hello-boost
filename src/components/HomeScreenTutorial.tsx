import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserPlus, Mic } from "lucide-react";
import remiWaving from "@/assets/remi-waving.webp";

interface TutorialStep {
  id: string;
  emoji?: string;
  title: string;
  body: string;
  position?: 'center';
  highlight?: 'home-nav' | 'hellobook-nav' | 'quests-nav';
  showButtonPreview?: boolean;
  showRemi?: boolean;
}

interface HomeScreenTutorialProps {
  open: boolean;
  onComplete: () => void;
  /** Called immediately when the tutorial opens so the caller can persist "seen" state */
  onMarkSeen?: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'home',
    title: "Welcome to the home page.",
    body: "Here you'll find your:\n\n• Hello stats (streak + all time)\n• Friendly prompts & challenges\n• A place to log new hellos",
    position: 'center',
    highlight: 'home-nav',
    showRemi: true,
  },
  {
    id: 'log-hello',
    emoji: "✏️",
    title: "Log a Hello",
    bodyBefore: "Tap here anytime you meet someone new.",
    bodyAfter: "💡 Use our AI dictate 🎙️ to log multiple hellos at once.",
    position: 'center',
    showButtonPreview: true,
  },
  {
    id: 'hellobook',
    emoji: "📖",
    title: "Your Hellobook",
    body: "This is where your hellos live.\n\nSearch by name, place or notes to revisit the stories you've collected along the way.",
    position: 'center',
    highlight: 'hellobook-nav',
  },
  {
    id: 'quests',
    emoji: "🎯",
    title: "Quests",
    body: "Optional packs & challenges to create more stories.\n\nThe 30 Hellos is the best way to start.\n\nToggle Daily Mode on/off to track your streak.",
    position: 'center',
    highlight: 'quests-nav',
  },
];

// Helper to get highlight selector based on step
const getHighlightSelector = (highlight?: TutorialStep['highlight']): string | null => {
  switch (highlight) {
    case 'home-nav':
      return '[href="/"]';
    case 'hellobook-nav':
      return '[href="/hellobook"]';
    case 'quests-nav':
      return '[href="/challenges"]';
    default:
      return null;
  }
};

// Visual mockup of Log Hello buttons for the tutorial
const LogHelloButtonPreview = () => (
  <div className="flex gap-2 justify-center my-4">
    <div className="flex-1 max-w-[200px] h-12 bg-primary text-primary-foreground rounded-md flex items-center justify-center gap-2 text-sm font-semibold shadow-md">
      <UserPlus className="w-4 h-4" />
      Log a Hello
    </div>
    <div className="h-12 w-12 bg-background border border-border rounded-md flex items-center justify-center shadow-sm">
      <Mic className="w-4 h-4 text-foreground" />
    </div>
  </div>
);

// Highlight overlay component
const HighlightOverlay = ({ highlight }: { highlight?: TutorialStep['highlight'] }) => {
  const [rects, setRects] = useState<DOMRect[]>([]);

  useEffect(() => {
    const selector = getHighlightSelector(highlight);
    if (!selector) {
      setRects([]);
      return;
    }

    const elements = document.querySelectorAll(selector);
    const newRects: DOMRect[] = [];
    elements.forEach(el => {
      newRects.push(el.getBoundingClientRect());
    });
    setRects(newRects);

    const handleResize = () => {
      const updatedRects: DOMRect[] = [];
      elements.forEach(el => {
        updatedRects.push(el.getBoundingClientRect());
      });
      setRects(updatedRects);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [highlight]);

  if (rects.length === 0) return null;

  return createPortal(
    <>
      {rects.map((rect, index) => (
        <motion.div
          key={`highlight-${index}`}
          className="fixed pointer-events-none z-[103] rounded-xl"
          style={{
            top: rect.top - 4,
            left: rect.left - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            boxShadow: '0 0 0 4px hsl(var(--primary)), 0 0 20px 4px hsl(var(--primary) / 0.5)',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        />
      ))}
    </>,
    document.body
  );
};

export const HomeScreenTutorial = ({ open, onComplete, onMarkSeen }: HomeScreenTutorialProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const hasStartedRef = useRef(false);
  const markedSeenRef = useRef(false);

  // Mark as seen immediately when tutorial opens (only once)
  useEffect(() => {
    if (open && !markedSeenRef.current && onMarkSeen) {
      markedSeenRef.current = true;
      onMarkSeen();
    }
  }, [open, onMarkSeen]);

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      navigate('/');
      setCurrentStep(0);
      hasStartedRef.current = false;
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Reset step when closed
  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      hasStartedRef.current = false;
    } else {
      hasStartedRef.current = true;
    }
  }, [open]);

  if (!open) return null;

  // Format body text with line breaks
  const formatBody = (text: string) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Highlight overlay for current step */}
          <HighlightOverlay highlight={currentStepData.highlight} />
          
          {/* Dark overlay */}
          <motion.div
            className="fixed inset-0 bg-black/75 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Click layer to advance */}
          <div 
            className="fixed inset-0 z-[101]" 
            onClick={handleNext}
          />

          {/* Tooltip card - always centered */}
          <motion.div
            className="fixed z-[102] px-5 inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              key={currentStep}
              className="bg-card border-2 border-primary rounded-2xl p-5 shadow-2xl w-full max-w-[calc(100vw-2.5rem)] sm:max-w-sm pointer-events-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Remi avatar for first step */}
              {currentStepData.showRemi && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={remiWaving} 
                    alt="Remi" 
                    className="w-20 h-20 object-contain"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Emoji for other steps */}
              {currentStepData.emoji && !currentStepData.showRemi && (
                <div className="flex justify-center mb-3">
                  <span className="text-4xl">{currentStepData.emoji}</span>
                </div>
              )}

              {/* Title */}
              <h3 className="text-xl font-bold text-foreground text-center mb-2">
                {currentStepData.title}
              </h3>

              {/* Body */}
              <p className="text-muted-foreground text-center leading-relaxed text-sm">
                {formatBody(currentStepData.body)}
              </p>

              {/* Button preview for Log a Hello step */}
              {currentStepData.showButtonPreview && <LogHelloButtonPreview />}

              {/* Spacer when no button preview */}
              {!currentStepData.showButtonPreview && <div className="mb-5" />}

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

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleNext}
                  className="w-full bg-primary text-primary-foreground font-medium py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  {isLastStep ? "Let's begin" : "Next"}
                </button>
                {!isLastStep && (
                  <button
                    onClick={() => {
                      setCurrentStep(0);
                      hasStartedRef.current = false;
                      onComplete();
                    }}
                    className="w-full text-muted-foreground font-medium py-2 px-6 rounded-xl hover:text-foreground transition-colors text-sm"
                  >
                    Skip tutorial
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
