import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { getAuthCallbackUrl } from '@/lib/publicUrls';
import { toast } from 'sonner';
import { z } from 'zod';
import { Mail, ArrowLeft, Check, KeyRound, RefreshCw, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import logo from '@/assets/one-hello-logo-tagline.svg';

const emailSchema = z.string().trim().email({ message: "Please enter a valid email" });

const RESEND_COOLDOWN_SECONDS = 60;

type AuthMode = 'choose' | 'magic-link' | 'password' | 'forgot-password';

export default function MagicLinkSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [authMode, setAuthMode] = useState<AuthMode>('choose');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendLink = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
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

      setSent(true);
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
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        // Provide user-friendly error messages
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

  const handlePasswordSignIn = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    try {
      const validatedEmail = emailSchema.parse(email);
      setLoading(true);
      setPasswordError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email: validatedEmail,
        password,
      });

      if (error) {
        // Check if it's "Invalid login credentials" which could mean no password set
        if (error.message.includes('Invalid login credentials')) {
          setPasswordError("Invalid email or password. If you haven't set a password yet, use the magic link option.");
        } else {
          setPasswordError(error.message);
        }
        return;
      }

      toast.success('Signed in successfully!');
      navigate('/');
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPasswordError(error.errors[0].message);
      } else if (error instanceof Error) {
        setPasswordError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    try {
      const validatedEmail = emailSchema.parse(email);
      setLoading(true);
      setPasswordError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(validatedEmail, {
        redirectTo: getAuthCallbackUrl(),
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast.success('Check your email for the password reset link!');
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPasswordError(error.errors[0].message);
      } else if (error instanceof Error) {
        setPasswordError(error.message);
      }
    }
  };

  // OTP verification screen (after magic link sent)
  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md text-center space-y-8">
          <img 
            src={logo}
            alt="One Hello" 
            className="w-full max-w-xs mx-auto"
          />
          
          <Card>
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Check your email!</CardTitle>
              <CardDescription className="text-base">
                We sent a sign-in link and code to <span className="font-medium text-foreground">{email}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OTP Entry Section */}
              <div className="space-y-4">
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
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or click the link in your email</span>
                </div>
              </div>

              <Button 
                onClick={() => {
                  setSent(false);
                  setOtp('');
                  setOtpError(null);
                }} 
                variant="outline" 
                className="w-full"
              >
                Use a different email
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="ghost" 
                className="w-full"
              >
                Continue as guest
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Forgot password mode
  if (authMode === 'forgot-password') {
    // Show success screen after email sent
    if (resetEmailSent) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
          <div className="w-full max-w-md text-center space-y-8">
            <img 
              src={logo}
              alt="One Hello" 
              className="w-full max-w-xs mx-auto"
            />
            
            <Card>
              <CardHeader className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>Check your email!</CardTitle>
                <CardDescription className="text-base">
                  We sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Click the link in your email to set a new password.
                </p>
                <Button 
                  onClick={() => {
                    setAuthMode('password');
                    setResetEmailSent(false);
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to sign in
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    // Email input form for forgot password
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <Button
            variant="ghost"
            onClick={() => {
              setAuthMode('password');
              setPasswordError(null);
            }}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <img 
            src={logo}
            alt="One Hello" 
            className="w-full max-w-xs mx-auto"
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Reset your password</CardTitle>
              <CardDescription>
                Enter your email and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setPasswordError(null);
                    }}
                    autoFocus
                    required
                  />
                </div>

                {/* Error message */}
                {passwordError && (
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}
                
                <Button 
                  type="submit"
                  size="lg" 
                  className="w-full"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <span className="animate-pulse">Sending...</span>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send reset link
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Password sign-in mode
  if (authMode === 'password') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <Button
            variant="ghost"
            onClick={() => {
              setAuthMode('choose');
              setPasswordError(null);
              setPassword('');
            }}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <img 
            src={logo}
            alt="One Hello" 
            className="w-full max-w-xs mx-auto"
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Sign in with password</CardTitle>
              <CardDescription>
                Enter your email and password to sign in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError(null);
                      }}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Error message */}
                {passwordError && (
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}
                
                <Button 
                  type="submit"
                  size="lg" 
                  className="w-full"
                  disabled={loading || !email || !password}
                >
                  {loading ? (
                    <span className="animate-pulse">Signing in...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Sign in
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="link"
                    className="text-muted-foreground p-0 h-auto text-sm"
                    onClick={() => {
                      setAuthMode('forgot-password');
                      setPasswordError(null);
                    }}
                  >
                    Forgot password?
                  </Button>
                  
                  <Button
                    type="button"
                    variant="link"
                    className="text-muted-foreground p-0 h-auto text-sm"
                    onClick={() => setAuthMode('magic-link')}
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    Use magic link
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            New here?{' '}
            <button 
              onClick={() => navigate('/onboarding')}
              className="text-primary hover:underline"
            >
              Get started
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Magic link mode
  if (authMode === 'magic-link') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <Button
            variant="ghost"
            onClick={() => setAuthMode('choose')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <img 
            src={logo}
            alt="One Hello" 
            className="w-full max-w-xs mx-auto"
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Sign in with magic link</CardTitle>
              <CardDescription>
                Enter your email and we'll send you a magic link or code.
                <span className="block mt-1 font-medium text-foreground">
                  No password needed.
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  size="lg" 
                  className="w-full"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <span className="animate-pulse">Sending...</span>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send magic link
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setAuthMode('password')}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Use password instead
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            New here?{' '}
            <button 
              onClick={() => navigate('/onboarding')}
              className="text-primary hover:underline"
            >
              Get started
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Choose auth method (default)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <img 
          src={logo}
          alt="One Hello" 
          className="w-full max-w-xs mx-auto"
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Choose how you'd like to sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setAuthMode('magic-link')}
              size="lg" 
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Continue with magic link
            </Button>

            <Button 
              onClick={() => setAuthMode('password')}
              size="lg" 
              variant="outline"
              className="w-full"
            >
              <Lock className="w-4 h-4 mr-2" />
              Continue with password
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          New here?{' '}
          <button 
            onClick={() => navigate('/onboarding')}
            className="text-primary hover:underline"
          >
            Get started
          </button>
        </p>
      </div>
    </div>
  );
}
