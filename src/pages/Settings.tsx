import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    
    // Get username directly from user metadata
    const name = user.user_metadata?.name || 'User';
    setUsername(name);
  }, [user]);

  const handleSignOut = async () => {
    try {
      // Sign out from Supabase (ignore session not found errors)
      await supabase.auth.signOut({ scope: 'local' });
      
      toast.success("Signed out successfully");
      navigate('/auth');
    } catch (error) {
      // Even if signout fails, still navigate to auth page
      console.log("Sign out error (navigating anyway):", error);
      navigate('/auth');
    }
  };


  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Settings</h1>
        <p className="text-muted-foreground mb-6">
          Manage your One Hello experience
        </p>


        {/* Account */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <LogOut className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-foreground">Account</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Username</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-foreground">{username}</p>
              </div>
            </div>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </Card>

        {/* About */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-2 text-foreground">About One Hello</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            One Hello helps you build confidence and connect with others through small daily challenges. 
            Complete one task per day for 7 days and track your progress.
          </p>
          <p className="text-xs text-muted-foreground mt-4">Version 1.0.0</p>
        </Card>

      </div>
    </div>
  );
};

export default Settings;
