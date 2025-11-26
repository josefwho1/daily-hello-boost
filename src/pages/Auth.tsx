import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import logo from '@/assets/one-hello-logo.png';

const signupSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }).max(50, { message: "Name must be less than 50 characters" }),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(50, { message: "Password must be less than 50 characters" }),
});

const Auth = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = signupSchema.parse({ name, email, password });
      setLoading(true);

      const redirectUrl = `${window.location.origin}/`;

      const { error: signUpError } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: validated.name
          }
        }
      });

      if (signUpError) throw signUpError;

      toast({
        title: "Welcome!",
        description: `Hi ${validated.name}, let's start your journey!`,
      });
      
      navigate('/');
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#ffeeee' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img 
            src={logo}
            alt="One Hello Logo" 
            className="w-full max-w-xs h-auto mx-auto mb-4 object-contain"
            loading="eager"
            fetchPriority="high"
          />
          <CardTitle className="text-2xl">Welcome to One Hello!</CardTitle>
          <CardDescription className="text-base">
            The social app that actually helps you socialise
          </CardDescription>
          <p className="text-sm text-muted-foreground mt-4">
            To get started please fill in the details below to sign up!
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Simple letters & numbers"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Use simple letters & numbers (minimum 6 characters)
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
