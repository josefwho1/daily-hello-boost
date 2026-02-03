import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { getAuthCallbackUrl } from '@/lib/publicUrls';
import { toast } from 'sonner';
import { z } from 'zod';
import { Mail, ArrowLeft, Check, AlertCircle, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import logo from '@/assets/one-hello-logo-tagline.svg';

const emailSchema = z.string().trim().email({ message: "Please enter a valid email" });

type AuthMode = 'choose' | 'email-code' | 'verify-code' | 'password' | 'password-signup' | 'forgot-password';

export default function MagicLinkSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('choose');
  const [error, setError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  // Code verification state
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer countdown
  useEffect(() => {
    if (authMode === 'verify-code' && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [authMode, resendTimer]);

  // Auto-focus first code input when entering verify mode
  useEffect(() => {
    if (authMode === 'verify-code') {
      codeInputRefs.current[0]?.focus();
    }
  }, [authMode]);

  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    try {
      const validatedEmail = emailSchema.parse(email);
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-auth-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ email: validatedEmail }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send code');
      }

      setIsNewUser(!data.isExistingUser);
      setAuthMode('verify-code');
      setResendTimer(30);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      toast.success('Code sent to your email!');
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeInput = (index: number, value: string) => {
    // Only allow numbers
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);

    // Auto-advance to next input
    if (digit && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 filled
    const fullCode = newCode.join('');
    if (fullCode.length === 6 && newCode.every(d => d !== '')) {
      handleVerifyCode(fullCode);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace: go to previous input if current is empty
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      codeInputRefs.current[5]?.focus();
      handleVerifyCode(pastedData);
    }
  };

  const handleVerifyCode = async (codeString?: string) => {
    const fullCode = codeString || code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-auth-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ email, code: fullCode }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify code');
      }

      // Use the token to verify OTP and sign in
      if (data.token && data.type) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: data.token,
          type: data.type,
        });

        if (verifyError) {
          throw new Error('Failed to complete authentication');
        }
      }

      // Handle post-auth flow
      await handlePostAuth(data.userId, data.isNewUser);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        // Clear code inputs on error
        setCode(['', '', '', '', '', '']);
        codeInputRefs.current[0]?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePostAuth = async (userId: string, isNew: boolean) => {
    try {
      // Check/create user progress
      const { data: progressRow, error: progressReadError } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (progressReadError) throw progressReadError;

      if (!progressRow) {
        // New user - will go through onboarding
        toast.success(isNew ? 'Account created!' : 'Signed in successfully!');
        window.location.replace('/onboarding');
        return;
      }

      // Normalize legacy rows
      await supabase
        .from('user_progress')
        .update({
          has_completed_onboarding: true,
          is_onboarding_week: false,
          current_phase: 'active',
          mode: 'daily',
        })
        .eq('user_id', userId);

      toast.success('Signed in successfully!');
      window.location.replace('/');
    } catch (error) {
      console.error('Post-auth error:', error);
      toast.success('Signed in successfully!');
      window.location.replace('/');
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    await handleSendCode();
  };

  const handlePasswordSignIn = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    try {
      const validatedEmail = emailSchema.parse(email);
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedEmail,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError("Invalid email or password. If you don't have a password, use the email code option.");
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        await handlePostAuth(data.user.id, false);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSignUp = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    try {
      const validatedEmail = emailSchema.parse(email);
      
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email: validatedEmail,
        password,
        options: {
          data: { name: 'User' },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError('This email is already registered. Try signing in instead.');
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success('Account created!');
        window.location.replace('/onboarding');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else if (error instanceof Error) {
        setError(error.message);
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
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(validatedEmail, {
        redirectTo: getAuthCallbackUrl(),
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast.success('Check your email for the password reset link!');
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Code verification screen
  if (authMode === 'verify-code') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <Button
            variant="ghost"
            onClick={() => {
              setAuthMode('choose');
              setCode(['', '', '', '', '', '']);
              setError(null);
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
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Check your email 📧</CardTitle>
              <CardDescription className="text-base">
                We sent a 6-digit code to:<br />
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code-0" className="sr-only">Enter code</Label>
                <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      ref={(el) => (codeInputRefs.current[index] = el)}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      className="w-12 h-14 text-center text-2xl font-bold border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                      value={code[index]}
                      onChange={(e) => handleCodeInput(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-start gap-2 text-sm text-destructive justify-center">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                onClick={() => handleVerifyCode()}
                size="lg" 
                className="w-full"
                disabled={loading || code.some(d => d === '')}
              >
                {loading ? (
                  <span className="animate-pulse">Verifying...</span>
                ) : (
                  'Verify Code'
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Didn't receive it?</p>
                {canResend ? (
                  <Button
                    variant="link"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="p-0 h-auto"
                  >
                    Resend Code
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Resend available in {resendTimer}s
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                onClick={() => {
                  setAuthMode('choose');
                  setCode(['', '', '', '', '', '']);
                  setError(null);
                }}
                className="w-full text-muted-foreground"
              >
                Wrong email? Change Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Forgot password - success screen
  if (authMode === 'forgot-password' && resetEmailSent) {
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
              <p className="text-xs text-muted-foreground mt-2">
                📬 Can't find it? Check your junk or spam folder.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
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

  // Forgot password - email input
  if (authMode === 'forgot-password') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <Button
            variant="ghost"
            onClick={() => {
              setAuthMode('password');
              setError(null);
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
                      setError(null);
                    }}
                    autoFocus
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
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

  // Password signup screen
  if (authMode === 'password-signup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <Button
            variant="ghost"
            onClick={() => {
              setAuthMode('password');
              setError(null);
              setPassword('');
              setConfirmPassword('');
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
              <CardTitle>Create Account</CardTitle>
              <CardDescription>
                Set up your account with email and password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
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
                  <p className="text-xs text-muted-foreground">At least 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <Button 
                  type="submit"
                  size="lg" 
                  className="w-full"
                  disabled={loading || !email || !password || !confirmPassword}
                >
                  {loading ? (
                    <span className="animate-pulse">Creating account...</span>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => {
                    setAuthMode('choose');
                    setError(null);
                  }}
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Prefer email code? Use Code
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Password sign-in screen
  if (authMode === 'password') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <Button
            variant="ghost"
            onClick={() => {
              setAuthMode('choose');
              setError(null);
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
              <CardTitle>Sign In with Password</CardTitle>
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
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
                        setError(null);
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

                {error && (
                  <div className="flex items-start gap-2 text-sm text-destructive">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
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
                      Sign In
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
                      setError(null);
                    }}
                  >
                    Forgot password?
                  </Button>
                  
                  <Button
                    type="button"
                    variant="link"
                    className="text-muted-foreground p-0 h-auto text-sm"
                    onClick={() => {
                      setAuthMode('choose');
                      setError(null);
                    }}
                  >
                    <KeyRound className="w-3 h-3 mr-1" />
                    Use Code
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            New here?{' '}
            <button 
              onClick={() => setAuthMode('password-signup')}
              className="text-primary hover:underline"
            >
              Create account
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
            <CardTitle>Welcome to One Hello 🦝</CardTitle>
            <CardDescription>
              Enter your email to sign in or create an account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                type="submit"
                size="lg" 
                className="w-full"
                disabled={loading || !email}
              >
                {loading ? (
                  <span className="animate-pulse">Sending code...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    Continue with Email Code
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button 
              onClick={() => setAuthMode('password')}
              size="lg" 
              variant="outline"
              className="w-full"
            >
              <Lock className="w-4 h-4 mr-2" />
              Sign in with Password
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          New user? Same flow for sign up!
        </p>
      </div>
    </div>
  );
}
