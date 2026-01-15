import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import remiWaving from "@/assets/remi-waving.webp";
import logo from "@/assets/one-hello-logo-tagline.svg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
      <div className="text-center max-w-md w-full space-y-8">
        {/* Logo */}
        <img 
          src={logo} 
          alt="One Hello" 
          className="h-24 sm:h-32 mx-auto"
        />
        
        {/* Remi mascot */}
        <img 
          src={remiWaving} 
          alt="Remi waving" 
          className="w-48 h-auto mx-auto animate-bounce-soft"
        />
        
        {/* Action buttons */}
        <div className="space-y-3 pt-4">
          <Button 
            onClick={() => navigate('/onboarding')} 
            className="w-full" 
            size="lg"
          >
            Get Started
          </Button>
          <Button 
            onClick={() => navigate('/auth')} 
            variant="outline" 
            className="w-full" 
            size="lg"
          >
            Sign In
          </Button>
        </div>
        
        {/* Bottom text */}
        <p className="text-sm text-muted-foreground pt-4">
          No account needed to start. Just jump in!
        </p>
      </div>
    </div>
  );
};

export default Index;