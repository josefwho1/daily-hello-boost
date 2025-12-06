import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTimezone } from "@/hooks/useTimezone";
import { useUserProgress } from "@/hooks/useUserProgress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LogOut, Clock, Target } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { timezoneOffset, updateTimezone } = useTimezone();
  const { progress, updateProgress } = useUserProgress();
  

  // Generate timezone options from GMT-12 to GMT+12
  const timezoneOptions = [];
  for (let i = -12; i <= 12; i++) {
    const sign = i >= 0 ? '+' : '';
    const hours = Math.abs(i).toString().padStart(2, '0');
    const value = `${sign}${hours}:00`;
    const label = `GMT${sign}${i}`;
    timezoneOptions.push({ value, label });
  }

  const modeOptions = [
    { value: 'easy', label: 'Easy', description: '3 hellos per week' },
    { value: 'normal', label: 'Normal', description: '5 hellos per week' },
    { value: 'hard', label: 'Hard', description: '7 hellos per week' },
  ];

  const getTargetFromMode = (mode: string) => {
    switch (mode) {
      case 'easy': return 3;
      case 'hard': return 7;
      default: return 5;
    }
  };


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

  const handleTimezoneChange = async (value: string) => {
    try {
      await updateTimezone(value);
      toast.success("Timezone updated successfully");
    } catch (error) {
      console.error("Error updating timezone:", error);
      toast.error("Failed to update timezone");
    }
  };

  const handleModeChange = async (value: string) => {
    try {
      await updateProgress({
        mode: value,
        target_hellos_per_week: getTargetFromMode(value)
      });
      toast.success("Challenge mode updated successfully");
    } catch (error) {
      console.error("Error updating mode:", error);
      toast.error("Failed to update mode");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Settings</h1>
        <p className="text-muted-foreground mb-6">
          Manage your One Hello experience
        </p>

        {/* Challenge Mode */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-foreground">Challenge Mode</h2>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">How many hellos per week?</Label>
            <Select value={progress?.mode || 'normal'} onValueChange={handleModeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {modeOptions.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    <span className="font-medium">{mode.label}</span>
                    <span className="text-muted-foreground ml-2">({mode.description})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Timezone */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-foreground">Timezone</h2>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Select your timezone</Label>
            <Select value={timezoneOffset} onValueChange={handleTimezoneChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezoneOptions.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Account */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <LogOut className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-foreground">Account</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Name</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-foreground">{user?.user_metadata?.name || 'User'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-foreground">{user?.email || 'Not set'}</p>
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
