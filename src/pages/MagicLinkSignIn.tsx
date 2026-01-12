import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import logo from '@/assets/one-hello-logo-tagline.svg';

const emailSchema = z.string().trim().email({ message: "Please enter a valid email" });

export default function MagicLinkSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      setSent(true);
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
                We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>.
                <span className="block mt-2">
                  Click the link to sign in and access your hellos.
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setSent(false)} 
                variant="outline" 
                className="w-full"
              >
                Send to a different email
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
              Enter your email and we'll send you a magic link.
              <span className="block mt-1 font-medium text-foreground">
                No passwords needed.
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
