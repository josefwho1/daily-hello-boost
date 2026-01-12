import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { getAuthCallbackUrl } from '@/lib/publicUrls';
import { toast } from 'sonner';
import { z } from 'zod';
import { Mail, Sparkles, ArrowLeft, KeyRound, Check, RefreshCw, AlertCircle } from 'lucide-react';
import remiWaving from '@/assets/remi-waving.webp';

const emailSchema = z.string().trim().email({ message: "Please enter a valid email" });

const RESEND_COOLDOWN_SECONDS = 60;

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
  const [step, setStep] = useState<'prompt' | 'email' | 'sent'>('prompt');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleMaybeLater = () => {
    onDismiss();
    onOpenChange(false);
    setStep('prompt');
    setEmail('');
    setOtp('');
    setOtpError(null);
  };

  const handleSaveProgress = () => {
    setStep('email');
  };

  const handleSendLink = async () => {
    try {
      const validatedEmail = emailSchema.parse(email);
      setLoading(true);
      setOtpError(null);

      const { error } = await supabase.auth.signInWithOtp({
        email: validatedEmail,
        options: {
          emailRedirectTo: getAuthCallbackUrl(),
        },
      });

      if (error) throw error;

      setStep('sent');
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success('Check your email for the magic link or code!');
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

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    try {
      setLoading(true);
      setOtpError(null);
      setOtp('');

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getAuthCallbackUrl(),
        },
      });

      if (error) throw error;

      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success('New code sent! Check your email.');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }

    try {
      setVerifying(true);
      setOtpError(null);
      
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });

      if (error) throw error;

      toast.success('Signed in successfully!');
      handleClose();
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          setOtpError('This code has expired. Please request a new one.');
        } else if (error.message.includes('invalid') || error.message.includes('Token')) {
          setOtpError('Invalid code. Please check and try again.');
        } else {
          setOtpError(error.message);
        }
      }
      setOtp('');
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setStep('prompt');
      setEmail('');
      setOtp('');
      setOtpError(null);
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
                Enter your email and we'll send a sign-in link and code.
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
                We sent a sign-in link and code to <span className="font-medium text-foreground">{email}</span>.
              </DialogDescription>
            </DialogHeader>
            
            {/* OTP Entry Section */}
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                <KeyRound className="w-4 h-4" />
                <span>Enter your 6-digit code</span>
              </div>
              
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => {
                    setOtp(value);
                    setOtpError(null);
                  }}
                  onComplete={handleVerifyOtp}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {/* Error message */}
              {otpError && (
                <div className="flex items-center gap-2 justify-center text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span>{otpError}</span>
                </div>
              )}

              <Button 
                onClick={handleVerifyOtp}
                className="w-full"
                disabled={otp.length !== 6 || verifying}
              >
                {verifying ? (
                  <span className="animate-pulse">Verifying...</span>
                ) : (
                  'Verify code'
                )}
              </Button>

              {/* Resend button with cooldown */}
              <Button
                onClick={handleResendCode}
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                disabled={resendCooldown > 0 || loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {resendCooldown > 0 
                  ? `Resend code in ${resendCooldown}s`
                  : "Didn't receive it? Resend code"
                }
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">or click the link in your email</span>
                </div>
              </div>

              <Button 
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setOtpError(null);
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
