import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/one-hello-logo-tagline.svg';
import remiMascot from '@/assets/remi-waving.webp';

const Auth = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Logo */}
        <img 
          src={logo}
          alt="One Hello - Reconnecting the world, One Hello at a time" 
          className="w-full max-w-2xl mx-auto"
        />

        {/* Mascot */}
        <img 
          src={remiMascot} 
          alt="Remi" 
          className="w-64 max-w-full h-auto mx-auto object-contain"
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
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
