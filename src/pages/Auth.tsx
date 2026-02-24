import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/one-hello-logo.svg';
import remiHoldingOrb from '@/assets/remi-holding-orb.webp';

const Auth = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Logo */}
        <img 
          src={logo}
          alt="One Hello" 
          className="h-24 sm:h-32 mx-auto"
        />

        {/* Remi mascot */}
        <img 
          src={remiHoldingOrb} 
          alt="Remi holding orb" 
          className="w-48 h-auto mx-auto"
        />

        {/* Buttons */}
        <div className="space-y-4 pt-4">
          <Button 
            onClick={() => navigate('/onboarding')} 
            className="w-full" 
            size="lg"
          >
            Get Started
          </Button>
          
          <Button 
            onClick={() => navigate('/signin')} 
            variant="outline"
            className="w-full" 
            size="lg"
          >
            I already have an account
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          No account needed to start. Just jump in!
        </p>
      </div>
    </div>
  );
};

export default Auth;
