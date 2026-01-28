import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import remiWaving from "@/assets/remi-waving.webp";

interface TutorialStep {
  id: string;
  emoji: string;
  title: string;
  body: string;
  targetId?: string; // Element to spotlight
  position?: 'above' | 'below' | 'center'; // Where to position tooltip relative to target
  navigateTo?: string; // Route to navigate to for this step
  highlightNav?: string; // Nav item to highlight (for Hellobook step)
}

interface HomeScreenTutorialProps {
  open: boolean;
  onComplete: () => void;
  /** Called immediately when the tutorial opens so the caller can persist "seen" state */
  onMarkSeen?: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    emoji: "👋",
    title: "Welcome to the Home page",
    body: "This is your daily dashboard where you'll track your connections and progress.",
    position: 'center',
  },
  {
    id: 'log-hello',
    emoji: "👇",
    title: "Log a Hello",
    body: "Log a Hello anytime you meet someone and want to remember them.",
    targetId: 'tutorial-log-hello-btn',
    position: 'above',
  },
  {
    id: 'dictate',
    emoji: "🗣️",
    title: "Voice to text",
    body: "Use our AI dictate function to easily add multiple connections in one go.",
    targetId: 'tutorial-dictate-btn',
    position: 'above',
  },
  {
    id: 'todays-hello',
    emoji: "💡",
    title: "Today's Hello",
    body: "Today's Hello gives you daily prompts and suggestions on how to connect with more people.",
    targetId: 'tutorial-todays-hello-card',
    position: 'below',
  },
  {
    id: 'hellobook',
    emoji: "📖",
    title: "The Hellobook",
    body: "The Hellobook is where we store all your connections. You can search and filter to find people so you never forget.",
    highlightNav: '/hellobook',
    position: 'above',
  },
];

export const HomeScreenTutorial = ({ open, onComplete, onMarkSeen }: HomeScreenTutorialProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
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

  // Find and measure target element
  const updateTargetRect = useCallback(() => {
    if (!currentStepData.targetId && !currentStepData.highlightNav) {
      setTargetRect(null);
      return;
    }

    let element: HTMLElement | null = null;
    
    if (currentStepData.highlightNav) {
      // Find the nav link for Hellobook
      element = document.querySelector(`nav a[href="${currentStepData.highlightNav}"]`);
    } else if (currentStepData.targetId) {
      element = document.getElementById(currentStepData.targetId);
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [currentStepData]);

  // Navigate if step requires it
  useEffect(() => {
    if (!open) return;
    
    if (currentStepData.navigateTo && location.pathname !== currentStepData.navigateTo) {
      navigate(currentStepData.navigateTo);
    }
  }, [open, currentStep, currentStepData, location.pathname, navigate]);

  // Update target rect when step changes or window resizes
  useEffect(() => {
    if (!open) return;
    
    // Small delay to let navigation/rendering complete
    const timer = setTimeout(updateTargetRect, 100);
    
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [open, currentStep, updateTargetRect, location.pathname]);

  const handleNext = () => {
    if (isLastStep) {
      // Navigate back to home before completing
      if (location.pathname !== '/') {
        navigate('/');
      }
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

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect || currentStepData.position === 'center') {
      return {};
    }

    const padding = 16;
    const tooltipHeight = 200; // Approximate
    
    if (currentStepData.position === 'above') {
      return {
        position: 'fixed',
        bottom: `${window.innerHeight - targetRect.top + padding}px`,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    }
    
    if (currentStepData.position === 'below') {
      return {
        position: 'fixed',
        top: `${targetRect.bottom + padding}px`,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    }

    return {};
  };

  // Create spotlight cutout path
  const getSpotlightPath = () => {
    if (!targetRect) return '';
    
    const padding = 8;
    const radius = 12;
    const x = targetRect.left - padding;
    const y = targetRect.top - padding;
    const w = targetRect.width + padding * 2;
    const h = targetRect.height + padding * 2;
    
    // Full screen path minus rounded rectangle cutout
    return `
      M 0 0
      L ${window.innerWidth} 0
      L ${window.innerWidth} ${window.innerHeight}
      L 0 ${window.innerHeight}
      Z
      M ${x + radius} ${y}
      L ${x + w - radius} ${y}
      Q ${x + w} ${y} ${x + w} ${y + radius}
      L ${x + w} ${y + h - radius}
      Q ${x + w} ${y + h} ${x + w - radius} ${y + h}
      L ${x + radius} ${y + h}
      Q ${x} ${y + h} ${x} ${y + h - radius}
      L ${x} ${y + radius}
      Q ${x} ${y} ${x + radius} ${y}
      Z
    `;
  };

  const isCentered = !targetRect || currentStepData.position === 'center';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Dark overlay with optional spotlight cutout */}
          {targetRect ? (
            <motion.svg
              className="fixed inset-0 z-[100] pointer-events-none"
              style={{ width: '100vw', height: '100vh' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <path
                d={getSpotlightPath()}
                fill="rgba(0, 0, 0, 0.75)"
                fillRule="evenodd"
              />
              {/* Highlight ring around target */}
              <rect
                x={targetRect.left - 4}
                y={targetRect.top - 4}
                width={targetRect.width + 8}
                height={targetRect.height + 8}
                rx="10"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                className="animate-pulse"
              />
            </motion.svg>
          ) : (
            <motion.div
              className="fixed inset-0 bg-black/75 z-[100]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
          
          {/* Click layer to advance */}
          <div 
            className="fixed inset-0 z-[101]" 
            onClick={handleNext}
          />

          {/* Tooltip card */}
          <motion.div
            className={`fixed z-[102] p-4 ${isCentered ? 'inset-0 flex items-center justify-center' : ''}`}
            style={isCentered ? {} : getTooltipStyle()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              key={currentStep}
              className="bg-card border-2 border-primary rounded-2xl p-5 shadow-2xl max-w-sm w-full pointer-events-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
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
              <p className="text-muted-foreground text-center mb-5 leading-relaxed">
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

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleNext}
                  className="w-full bg-primary text-primary-foreground font-medium py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  {isLastStep ? "Let's go! ✨" : "Next"}
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
