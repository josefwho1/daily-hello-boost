import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";

export type OnboardingStep = 
  | 'welcome'
  | 'greeting'
  | 'reflection'
  | 'acknowledgement'
  | 'challenge_intro'
  | 'public_place'
  | 'first_hello_prompt'
  | 'first_hello_done'
  | 'log_hello'
  | 'skip_for_now'
  | 'at_home';

export type ReflectionAnswer = 'this_week' | 'last_week' | 'few_weeks' | 'dont_remember' | null;

interface OnboardingState {
  step: OnboardingStep;
  userName: string;
  reflectionAnswer: ReflectionAnswer;
  connectionName: string;
  connectionLocation: string;
  connectionNotes: string;
  isSubmitting: boolean;
  assetsLoaded: boolean;
}

interface OnboardingContextValue extends OnboardingState {
  setStep: (step: OnboardingStep) => void;
  setUserName: (name: string) => void;
  setReflectionAnswer: (answer: ReflectionAnswer) => void;
  setConnectionName: (name: string) => void;
  setConnectionLocation: (location: string) => void;
  setConnectionNotes: (notes: string) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setAssetsLoaded: (loaded: boolean) => void;
  resetState: () => void;
}

const initialState: OnboardingState = {
  step: 'welcome',
  userName: '',
  reflectionAnswer: null,
  connectionName: '',
  connectionLocation: '',
  connectionNotes: '',
  isSubmitting: false,
  assetsLoaded: false,
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const setStep = useCallback((step: OnboardingStep) => setState(prev => ({ ...prev, step })), []);
  const setUserName = useCallback((userName: string) => setState(prev => ({ ...prev, userName })), []);
  const setReflectionAnswer = useCallback((reflectionAnswer: ReflectionAnswer) => setState(prev => ({ ...prev, reflectionAnswer })), []);
  const setConnectionName = useCallback((connectionName: string) => setState(prev => ({ ...prev, connectionName })), []);
  const setConnectionLocation = useCallback((connectionLocation: string) => setState(prev => ({ ...prev, connectionLocation })), []);
  const setConnectionNotes = useCallback((connectionNotes: string) => setState(prev => ({ ...prev, connectionNotes })), []);
  const setIsSubmitting = useCallback((isSubmitting: boolean) => setState(prev => ({ ...prev, isSubmitting })), []);
  const setAssetsLoaded = useCallback((assetsLoaded: boolean) => setState(prev => ({ ...prev, assetsLoaded })), []);
  const resetState = useCallback(() => setState(initialState), []);

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        setStep,
        setUserName,
        setReflectionAnswer,
        setConnectionName,
        setConnectionLocation,
        setConnectionNotes,
        setIsSubmitting,
        setAssetsLoaded,
        resetState,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
