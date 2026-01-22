import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { getAuthCallbackUrl } from '@/lib/publicUrls';
import { toast } from 'sonner';
import { z } from 'zod';
import { Mail, Sparkles, ArrowLeft, Check, Lock } from 'lucide-react';
import remiWaving from '@/assets/remi-waving.webp';

const emailSchema = z.string().trim().email({ message: "Please enter a valid email" });
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });

interface SaveProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss: () => void;
  totalHellos?: number;
}

export const SaveProgressDialog = ({ 
  open, 
  onOpenChange, 
  onDismiss,
  totalHellos = 1 
}: SaveProgressDialogProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'prompt' | 'email' | 'password' | 'sent'>('prompt');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMaybeLater = () => {
    onDismiss();
    onOpenChange(false);
    setStep('prompt');
    setEmail('');
    setPassword('');
  };

  const handleSaveProgress = () => {
    setStep('password');
  };

  const handleSignUpWithPassword = async () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      setLoading(true);

      // Link anonymous account to email/password (converts anonymous to full account)
      const { error } = await supabase.auth.updateUser({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      // Get current user to update profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Update profile to mark as no longer anonymous
        await supabase.from('profiles').update({
          is_anonymous: false,
          email: email.trim(),
        }).eq('id', user.id);
      }

      toast.success('Account created successfully! Your progress is now saved.');
      handleClose();
      navigate('/');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUseMagicLink = () => {
    setStep('email');
  };

  const handleSendLink = async () => {
    try {
      const validatedEmail = emailSchema.parse(email);
      setLoading(true);

      const { error } = await supabase.auth.signInWithOtp({
        email: validatedEmail,
        options: {
          emailRedirectTo: getAuthCallbackUrl(),
        },
      });

      if (error) throw error;

      setStep('sent');
      toast.success('Check your email for the magic link!');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setStep('prompt');
      setEmail('');
      setPassword('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'prompt' && (
          <>
            <DialogHeader className="text-center space-y-4">
              <img 
                src={remiWaving} 
                alt="Remi" 
                className="w-24 h-24 mx-auto object-contain"
              />
              <DialogTitle className="text-xl">Save your hellos?</DialogTitle>
              <DialogDescription className="text-base leading-relaxed">
                You've started something good. Add an email to keep your progress and come back anytime.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col gap-3 mt-4">
              <Button 
                onClick={handleSaveProgress} 
                size="lg" 
                className="w-full"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Save my progress
              </Button>
              <Button 
                onClick={handleMaybeLater} 
                variant="ghost" 
                className="w-full text-muted-foreground"
              >
                Maybe later
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground mt-2">
              You can keep using One Hello without signing up.
            </p>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <button 
                  onClick={() => {
                    handleClose();
                    navigate('/signin');
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </>
        )}

        {step === 'password' && (
          <>
            <DialogHeader className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-fit -ml-2"
                onClick={() => setStep('prompt')}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <DialogTitle className="text-xl">Create your account</DialogTitle>
              <DialogDescription>
                Enter your email and create a password.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignUpWithPassword()}
                />
              </div>
              
              <Button 
                onClick={handleSignUpWithPassword} 
                size="lg" 
                className="w-full"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <span className="animate-pulse">Creating account...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Create account
                  </>
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button 
                onClick={handleUseMagicLink} 
                variant="outline" 
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Use magic link instead
              </Button>
            </div>
          </>
        )}

        {step === 'email' && (
          <>
            <DialogHeader className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-fit -ml-2"
                onClick={() => setStep('password')}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <DialogTitle className="text-xl">Magic link</DialogTitle>
              <DialogDescription>
                Enter your email and we'll send a sign-in link.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendLink()}
                  autoFocus
                />
              </div>
              
              <Button 
                onClick={handleSendLink} 
                size="lg" 
                className="w-full"
                disabled={loading || !email}
              >
                {loading ? (
                  <span className="animate-pulse">Sending...</span>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send link
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {step === 'sent' && (
          <>
            <DialogHeader className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-xl">Check your email!</DialogTitle>
              <DialogDescription className="text-base">
                We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>.
              </DialogDescription>
              <p className="text-xs text-muted-foreground mt-2">
                📬 Can't find it? Check your junk or spam folder.
              </p>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground text-center">
                Click the link in your email to sign in.
              </p>

              <Button 
                onClick={() => {
                  setStep('email');
                }} 
                variant="outline" 
                className="w-full"
              >
                Use a different email
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
