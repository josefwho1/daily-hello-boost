import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { Mail, Sparkles, ArrowLeft } from 'lucide-react';
import remiWaving from '@/assets/remi-waving.webp';

const emailSchema = z.string().trim().email({ message: "Please enter a valid email" });

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
  const [step, setStep] = useState<'prompt' | 'email' | 'sent'>('prompt');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMaybeLater = () => {
    onDismiss();
    onOpenChange(false);
    setStep('prompt');
    setEmail('');
  };

  const handleSaveProgress = () => {
    setStep('email');
  };

  const handleSendLink = async () => {
    try {
      const validatedEmail = emailSchema.parse(email);
      setLoading(true);

      const { error } = await supabase.auth.signInWithOtp({
        email: validatedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setStep('sent');
      toast.success('Magic link sent! Check your email.');
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
                <span className="block mt-2 text-primary font-medium">
                  No passwords. No spam.
                </span>
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
          </>
        )}

        {step === 'email' && (
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
              <DialogTitle className="text-xl">Save progress</DialogTitle>
              <DialogDescription>
                Enter your email and we'll send a sign-in link.
                <span className="block mt-1 font-medium text-foreground">
                  No passwords, ever.
                </span>
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
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-xl">Check your email!</DialogTitle>
              <DialogDescription className="text-base">
                We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>.
                <span className="block mt-2">
                  Click the link to save your {totalHellos} hello{totalHellos !== 1 ? 's' : ''} and keep your progress.
                </span>
              </DialogDescription>
            </DialogHeader>
            
            <Button 
              onClick={handleClose} 
              variant="outline" 
              className="w-full mt-4"
            >
              Got it
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
