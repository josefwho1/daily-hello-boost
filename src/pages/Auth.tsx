import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const usernameSchema = z.object({
  name: z.string().trim().min(1, { message: "Username is required" }).max(50, { message: "Username must be less than 50 characters" }),
});

const Auth = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = usernameSchema.parse({ name });
      setLoading(true);

      // Create email and password from username
      const email = `${validated.name.toLowerCase()}@onehello.app`;
      const password = `onehello_${validated.name.toLowerCase()}_secure`;

      // Check if user exists by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // User doesn't exist, create new account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: validated.name
            }
          }
        });

        if (signUpError) throw signUpError;

        // Create profile
        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({ 
              id: signUpData.user.id,
              name: validated.name 
            });

          if (profileError) {
            // Profile might already exist from trigger
            console.log('Profile creation note:', profileError);
          }
        }

        toast({
          title: "Welcome!",
          description: `Hi ${validated.name}, let's start your journey!`,
        });
      } else {
        // User exists, signed in successfully
        toast({
          title: "Welcome back!",
          description: `Hi ${validated.name}, good to see you again!`,
        });
      }
      
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
            src="/src/assets/one-hello-logo.png" 
            alt="One Hello" 
            className="h-96 w-auto mx-auto mb-2"
          />
          <CardTitle>Welcome to the 7-Day Challenge pilot</CardTitle>
          <CardDescription>
            Enter your instagram username to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleContinue} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">IG Handle (minus the @ - i.e. josefwho)</Label>
              <Input
                id="name"
                type="text"
                placeholder="username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={50}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Please wait...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
