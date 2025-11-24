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

      // Sign in anonymously
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();

      if (authError) throw authError;

      // Update profile with username
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ name: validated.name })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;
      }

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
            src="/src/assets/one-hello-logo.png" 
            alt="One Hello" 
            className="h-96 w-auto mx-auto mb-4"
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
