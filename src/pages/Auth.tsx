import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logo from '@/assets/one-hello-logo-sticker.png';
import remiMascot from '@/assets/remi-waving.png';

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
          className="w-96 h-96 mx-auto"
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
