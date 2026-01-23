// App entry point
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useGuestMode } from "@/hooks/useGuestMode";
import Dashboard from "./pages/Dashboard";
import Hellobook from "./pages/Hellobook";
import Vault from "./pages/Vault";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import MagicLinkSignIn from "./pages/MagicLinkSignIn";
import AuthCallback from "./pages/AuthCallback";
import Onboarding from "./pages/Onboarding";
import Landing from "./pages/Landing";
import Community from "./pages/Community";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

// Routes that work for both guests and authenticated users
const AppRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { guestProgress, loading: guestLoading, isAnonymous } = useGuestMode();
  const { progress, loading: progressLoading } = useUserProgress();

  const loading = authLoading || guestLoading || progressLoading;

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

  // If not logged in at all (no user), redirect to onboarding
  if (!user) {
    return <Navigate to="/onboarding" replace />;
  }

  // For anonymous users, check if they have progress (created during onboarding)
  if (isAnonymous && !guestProgress) {
    return <Navigate to="/onboarding" replace />;
  }

  // For authenticated (non-anonymous) users, check if they have progress
  if (!isAnonymous && !progress) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const OnboardingCheck = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { progress, loading: progressLoading } = useUserProgress();
  const { guestProgress, loading: guestLoading, isAnonymous } = useGuestMode();

  const loading = progressLoading || guestLoading;

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

  // Get the relevant progress
  // For anonymous users, use guestProgress; for regular auth users, use progress
  const currentProgress = isAnonymous ? guestProgress : progress;

  // If no progress exists at all, redirect to onboarding
  if (!currentProgress) {
    return <Navigate to="/onboarding" replace />;
  }

  // Users who haven't completed onboarding AND aren't in onboarding week 
  // need to start/restart onboarding
  if (!currentProgress.has_completed_onboarding && !currentProgress.is_onboarding_week) {
    return <Navigate to="/onboarding" replace />;
  }

  // Users in first_hellos mode who haven't selected a final mode yet
  // should stay in the app (Dashboard will show First Hellos challenges)
  // But if they somehow have mode='first_hellos' with no onboarding context, redirect
  if (currentProgress.mode === 'first_hellos' && 
      !currentProgress.is_onboarding_week && 
      !currentProgress.has_completed_onboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

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

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/landing" element={<Landing />} />
          <Route path="/auth" element={<AuthRedirect><Auth /></AuthRedirect>} />
          <Route path="/signin" element={<AuthRedirect><MagicLinkSignIn /></AuthRedirect>} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/onboarding" element={<Onboarding />} />
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
            path="/community" 
            element={
              <AppRoute>
                <OnboardingCheck>
                  <Community />
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
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
