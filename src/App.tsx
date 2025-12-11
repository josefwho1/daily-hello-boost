// App entry point
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/hooks/useUserProgress";
import Dashboard from "./pages/Dashboard";
import Hellobook from "./pages/Hellobook";
import Vault from "./pages/Vault";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import SignIn from "./pages/SignIn";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import EmailPreview from "./pages/EmailPreview";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
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

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const OnboardingCheck = ({ children }: { children: React.ReactNode }) => {
  const { progress, loading } = useUserProgress();

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

  // Allow access if:
  // 1. User has completed onboarding (has_completed_onboarding: true)
  // 2. User is in their 7-day challenge period (is_onboarding_week: true)
  // Only redirect to /onboarding if neither condition is met (fresh user)
  if (progress && !progress.has_completed_onboarding && !progress.is_onboarding_week) {
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
          <Route path="/auth" element={<AuthRedirect><Auth /></AuthRedirect>} />
          <Route path="/signin" element={<AuthRedirect><SignIn /></AuthRedirect>} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/email-preview" element={<EmailPreview />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <OnboardingCheck>
                  <Dashboard />
                </OnboardingCheck>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hellobook" 
            element={
              <ProtectedRoute>
                <OnboardingCheck>
                  <Hellobook />
                </OnboardingCheck>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vault" 
            element={
              <ProtectedRoute>
                <OnboardingCheck>
                  <Vault />
                </OnboardingCheck>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <OnboardingCheck>
                  <Profile />
                </OnboardingCheck>
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
