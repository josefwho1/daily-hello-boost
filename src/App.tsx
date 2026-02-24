// App entry point
import { useEffect, useState, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useGuestMode } from "@/hooks/useGuestMode";
import { getCachedProgress } from "@/lib/offlineCache";

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Hellobook = lazy(() => import("./pages/Hellobook"));
const Vault = lazy(() => import("./pages/Vault"));
const Profile = lazy(() => import("./pages/Profile"));
const Auth = lazy(() => import("./pages/Auth"));
const MagicLinkSignIn = lazy(() => import("./pages/MagicLinkSignIn"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
import Onboarding from "./pages/Onboarding";
const Landing = lazy(() => import("./pages/Landing"));
const Community = lazy(() => import("./pages/Community"));
const Challenges = lazy(() => import("./pages/Challenges"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Prevent aggressive refetching on window focus/reconnect
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // Keep data fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Retry failed queries only once
      retry: 1,
      // CRITICAL: offlineFirst prevents RQ from pausing/blocking when device goes offline
      // Queries will use cache and won't hang waiting for network
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
});

// Routes that work for both guests and authenticated users
const AppRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { guestProgress, loading: guestLoading, isAnonymous, initializeAnonymous } = useGuestMode();
  const { progress, loading: progressLoading } = useUserProgress();

  const [bootstrapAttempted, setBootstrapAttempted] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  // If there is no session, automatically start a guest (anonymous) session.
  // This ensures new users can use the app without creating an account.
  useEffect(() => {
    if (authLoading) return;
    if (user) return;
    if (bootstrapAttempted) return;

    setBootstrapAttempted(true);
    setBootstrapping(true);
    initializeAnonymous().finally(() => setBootstrapping(false));
  }, [authLoading, user, bootstrapAttempted, initializeAnonymous]);

  // For anonymous users, guestLoading already includes progress loading via React Query.
  // Don't also wait on the separate useState-based progressLoading to avoid duplicate fetches.
  const loading = authLoading || bootstrapping || guestLoading || (!isAnonymous && progressLoading);
  const cached = getCachedProgress<Record<string, unknown>>();

  // Only show full-screen spinner if we have zero cached data AND are still loading
  if (loading && !cached && !progress && !guestProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If still no user after bootstrap attempt, send them to the auth entry.
  // But only after bootstrap has actually been attempted to avoid premature redirects.
  if (!user && bootstrapAttempted && !bootstrapping) {
    return <Navigate to="/auth" replace />;
  }
  // Still waiting for auth/bootstrap — show nothing to avoid flash
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // For anonymous users, check if they have progress (created during onboarding)
  // Use cached progress as fallback to prevent false redirects on slow networks
  if (isAnonymous && !guestProgress) {
    const cached = getCachedProgress<Record<string, unknown>>();
    if (!cached?.has_completed_onboarding) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  // For authenticated (non-anonymous) users, check if they have progress
  // If no progress, they need to complete onboarding
  if (!isAnonymous && !progress) {
    const cached = getCachedProgress<Record<string, unknown>>();
    if (!cached?.has_completed_onboarding) {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <>{children}</>;
};

const OnboardingCheck = ({ children }: { children: React.ReactNode }) => {
  const { progress, loading: progressLoading } = useUserProgress();
  const { guestProgress, loading: guestLoading, isAnonymous } = useGuestMode();

  // For anonymous users, guestLoading already covers progress loading
  const loading = guestLoading || (!isAnonymous && progressLoading);
  const cached = getCachedProgress<Record<string, unknown>>();

  // Only block with spinner if we have zero cached/live progress data
  if (loading && !cached && !progress && !guestProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Get the relevant progress
  // For anonymous users, use guestProgress; for regular auth users, use progress
  const currentProgress = isAnonymous ? guestProgress : progress;

  // If no progress exists at all, check cache before redirecting
  if (!currentProgress) {
    const cached = getCachedProgress<Record<string, unknown>>();
    if (!cached?.has_completed_onboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    // Cache says onboarding is done - let through, data will load shortly
    return <>{children}</>;
  }

  // Treat legacy users as "completed" if they have onboarding_completed_at set.
  const completedOnboarding =
    Boolean(currentProgress.has_completed_onboarding) ||
    Boolean((currentProgress as any).onboarding_completed_at);

  // Users who haven't completed onboarding need to complete it
  if (!completedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isAnonymous } = useGuestMode();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow anonymous users to access auth pages (so they can sign in/link account)
  // Only redirect fully authenticated users
  if (user && !isAnonymous) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Prevent authenticated non-anonymous users from accessing onboarding
// (which would overwrite their profile data)
const OnboardingGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { isAnonymous, loading: guestLoading } = useGuestMode();
  const { progress, loading: progressLoading } = useUserProgress();

  if (loading || guestLoading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If a fully authenticated user with completed onboarding hits /onboarding, redirect home
  if (user && !isAnonymous && progress?.has_completed_onboarding) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Suspense fallback for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            {/* Always allow access to sign-in (even if already signed in) to avoid redirect loops */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/signin" element={<MagicLinkSignIn />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/onboarding" element={<OnboardingGuard><Onboarding /></OnboardingGuard>} />
            <Route 
              path="/" 
              element={
                <AppRoute>
                  <OnboardingCheck>
                    <Dashboard />
                  </OnboardingCheck>
                </AppRoute>
              } 
            />
            <Route 
              path="/hellobook" 
              element={
                <AppRoute>
                  <OnboardingCheck>
                    <Hellobook />
                  </OnboardingCheck>
                </AppRoute>
              } 
            />
            <Route 
              path="/challenges" 
              element={
                <AppRoute>
                  <OnboardingCheck>
                    <Challenges />
                  </OnboardingCheck>
                </AppRoute>
              } 
            />
            <Route 
              path="/vault" 
              element={
                <AppRoute>
                  <OnboardingCheck>
                    <Vault />
                  </OnboardingCheck>
                </AppRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <AppRoute>
                  <OnboardingCheck>
                    <Profile />
                  </OnboardingCheck>
                </AppRoute>
              } 
              />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
