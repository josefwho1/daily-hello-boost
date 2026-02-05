import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";

export type OnboardingStep = 
  | 'welcome'
  | 'greeting'
  | 'philosophy'
  | 'last_connection'
  | 'add_to_hellobook'
  | 'log_hello'
  | 'first_entry'
  | 'no_worries';

export type LastConnectionAnswer = 'this_week' | 'last_week' | 'a_while_ago' | 'not_sure' | null;

interface OnboardingState {
  step: OnboardingStep;
  userName: string;
  lastConnectionAnswer: LastConnectionAnswer;
  connectionName: string;
  connectionLocation: string;
  connectionNotes: string;
  isSubmitting: boolean;
  assetsLoaded: boolean;
}

interface OnboardingContextValue extends OnboardingState {
  setStep: (step: OnboardingStep) => void;
  setUserName: (name: string) => void;
  setLastConnectionAnswer: (answer: LastConnectionAnswer) => void;
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
  lastConnectionAnswer: null,
  connectionName: '',
  connectionLocation: '',
  connectionNotes: '',
  isSubmitting: false,
  assetsLoaded: false,
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(initialState);
  
  // Use refs to avoid stale closures in callbacks
  const stateRef = useRef(state);
  stateRef.current = state;

  const setStep = useCallback((step: OnboardingStep) => {
    setState(prev => ({ ...prev, step }));
  }, []);

  const setUserName = useCallback((userName: string) => {
    setState(prev => ({ ...prev, userName }));
  }, []);

  const setLastConnectionAnswer = useCallback((lastConnectionAnswer: LastConnectionAnswer) => {
    setState(prev => ({ ...prev, lastConnectionAnswer }));
  }, []);

  const setConnectionName = useCallback((connectionName: string) => {
    setState(prev => ({ ...prev, connectionName }));
  }, []);

  const setConnectionLocation = useCallback((connectionLocation: string) => {
    setState(prev => ({ ...prev, connectionLocation }));
  }, []);

  const setConnectionNotes = useCallback((connectionNotes: string) => {
    setState(prev => ({ ...prev, connectionNotes }));
  }, []);

  const setIsSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting }));
  }, []);

  const setAssetsLoaded = useCallback((assetsLoaded: boolean) => {
    setState(prev => ({ ...prev, assetsLoaded }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        setStep,
        setUserName,
        setLastConnectionAnswer,
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
