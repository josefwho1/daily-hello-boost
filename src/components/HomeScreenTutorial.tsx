import { useState, useEffect, useRef, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserPlus, Mic } from "lucide-react";
import remiWaving from "@/assets/remi-waving.webp";
import { useAssetPreloader } from "@/hooks/useAssetPreloader";

interface TutorialStep {
  id: string;
  emoji?: string;
  title: string;
  body?: string;
  bodyBefore?: string;
  bodyAfter?: string;
  position?: 'center';
  highlight?: 'home-nav' | 'hellobook-nav' | 'quests-nav';
  showButtonPreview?: boolean;
  showRemi?: boolean;
}

interface HomeScreenTutorialProps {
  open: boolean;
  onComplete: () => void;
  onMarkSeen?: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'home',
    title: "This is Home",
    body: "Here you'll see:\n\n• Today's challenge\n• Your current streak\n• Your hello stats",
    position: 'center',
    highlight: 'home-nav',
    showRemi: true,
  },
  {
    id: 'complete-challenge',
    emoji: "✅",
    title: "Complete Your Challenge",
    bodyBefore: "Tap here when you've done today's hello.",
    bodyAfter: "You can log extra hellos anytime from the home screen.",
    position: 'center',
    showButtonPreview: true,
  },
  {
    id: 'hellobook',
    emoji: "📖",
    title: "Your Hellobook",
    body: "This is where your hellos live.\n\nSearch by name, place or notes to revisit anyone you've met.",
    position: 'center',
    highlight: 'hellobook-nav',
  },
  {
    id: 'quests',
    emoji: "🎯",
    title: "Quests",
    body: "This is where you'll find packs to help you start more conversations.\n\nYou're starting with the 7-Day Challenge.\n\nMore challenge packs coming soon!",
    position: 'center',
    highlight: 'quests-nav',
  },
];

// Preload tutorial assets
const TUTORIAL_ASSETS = [remiWaving];

// Helper to get highlight selector
const getHighlightSelector = (highlight?: TutorialStep['highlight']): string | null => {
  switch (highlight) {
    case 'home-nav': return '[href="/"]';
    case 'hellobook-nav': return '[href="/hellobook"]';
    case 'quests-nav': return '[href="/challenges"]';
    default: return null;
  }
};

// Memoized button preview component
const LogHelloButtonPreview = memo(() => (
  <div className="flex justify-center my-4">
    <div className="max-w-[220px] h-10 bg-orange-500 text-white rounded-full flex items-center justify-center gap-2 text-sm font-semibold shadow-md px-5">
      Complete Challenge
    </div>
  </div>
));
LogHelloButtonPreview.displayName = 'LogHelloButtonPreview';

// Memoized highlight overlay
const HighlightOverlay = memo(({ highlight }: { highlight?: TutorialStep['highlight'] }) => {
  const [rects, setRects] = useState<DOMRect[]>([]);

  useEffect(() => {
    const selector = getHighlightSelector(highlight);
    if (!selector) {
      setRects([]);
      return;
    }

    const updateRects = () => {
      const elements = document.querySelectorAll(selector);
      const newRects: DOMRect[] = [];
      elements.forEach(el => newRects.push(el.getBoundingClientRect()));
      setRects(newRects);
    };

    updateRects();
    window.addEventListener('resize', updateRects);
    return () => window.removeEventListener('resize', updateRects);
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
          transition={{ duration: 0.15 }}
        />
      ))}
    </>,
    document.body
  );
});
HighlightOverlay.displayName = 'HighlightOverlay';

// Memoized step content component
const StepContent = memo(({ 
  step, 
  isLast, 
  onNext, 
  onSkip 
}: { 
  step: TutorialStep; 
  isLast: boolean; 
  onNext: () => void; 
  onSkip: () => void;
}) => {
  const formatBody = useCallback((text: string) => {
    return text.split('\n').map((line, i, arr) => (
      <span key={i}>
        {line}
        {i < arr.length - 1 && <br />}
      </span>
    ));
  }, []);

  return (
    <motion.div
      className="bg-card border-2 border-primary rounded-2xl p-5 shadow-2xl w-full max-w-[calc(100vw-2.5rem)] sm:max-w-sm pointer-events-auto"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Remi avatar for first step */}
      {step.showRemi && (
        <div className="flex justify-center mb-4">
          <img 
            src={remiWaving} 
            alt="Remi" 
            className="w-20 h-20 object-contain"
            loading="eager"
          />
        </div>
      )}

      {/* Emoji for other steps */}
      {step.emoji && !step.showRemi && (
        <div className="flex justify-center mb-3">
          <span className="text-4xl">{step.emoji}</span>
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-bold text-foreground text-center mb-2">
        {step.title}
      </h3>

      {/* Body content */}
      {step.body && (
        <p className="text-muted-foreground text-center leading-relaxed text-sm">
          {formatBody(step.body)}
        </p>
      )}
      
      {step.bodyBefore && (
        <p className="text-muted-foreground text-center leading-relaxed text-sm">
          {step.bodyBefore}
        </p>
      )}

      {step.showButtonPreview && <LogHelloButtonPreview />}
      
      {step.bodyAfter && (
        <p className="text-muted-foreground text-center leading-relaxed text-sm">
          {step.bodyAfter}
        </p>
      )}

      {!step.showButtonPreview && <div className="mb-5" />}

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mb-4">
        {tutorialSteps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-150 ${
              index === tutorialSteps.findIndex(s => s.id === step.id) ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onNext}
          className="w-full bg-primary text-primary-foreground font-medium py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors duration-150"
        >
          {isLast ? "Let's begin" : "Next"}
        </button>
        {!isLast && (
          <button
            onClick={onSkip}
            className="w-full text-muted-foreground font-medium py-2 px-6 rounded-xl hover:text-foreground transition-colors duration-150 text-sm"
          >
            Skip tutorial
          </button>
        )}
      </div>
    </motion.div>
  );
});
StepContent.displayName = 'StepContent';

export const HomeScreenTutorial = memo(({ open, onComplete, onMarkSeen }: HomeScreenTutorialProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const markedSeenRef = useRef(false);

  // Preload tutorial assets
  useAssetPreloader(TUTORIAL_ASSETS);

  // Mark as seen immediately when tutorial opens
  useEffect(() => {
    if (open && !markedSeenRef.current && onMarkSeen) {
      markedSeenRef.current = true;
      onMarkSeen();
    }
  }, [open, onMarkSeen]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
    }
  }, [open]);

  const handleNext = useCallback(() => {
    if (currentStep === tutorialSteps.length - 1) {
      navigate('/');
      setCurrentStep(0);
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, navigate, onComplete]);

  const handleSkip = useCallback(() => {
    setCurrentStep(0);
    onComplete();
  }, [onComplete]);

  if (!open) return null;

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          <HighlightOverlay highlight={currentStepData.highlight} />
          
          {/* Dark overlay - instant render */}
          <motion.div
            className="fixed inset-0 bg-black/75 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
          
          {/* Click layer */}
          <div className="fixed inset-0 z-[101]" onClick={handleNext} />

          {/* Tooltip card container */}
          <motion.div
            className="fixed z-[102] px-5 inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <AnimatePresence mode="wait">
              <StepContent 
                key={currentStep}
                step={currentStepData}
                isLast={isLastStep}
                onNext={handleNext}
                onSkip={handleSkip}
              />
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

HomeScreenTutorial.displayName = 'HomeScreenTutorial';
