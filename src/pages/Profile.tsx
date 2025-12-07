import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTimezone } from "@/hooks/useTimezone";
import { useUserProgress } from "@/hooks/useUserProgress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LogOut, Clock, User, Pencil, Check, X, Flame, Calendar } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import remiMascot from "@/assets/remi-mascot.png";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { timezoneOffset, updateTimezone } = useTimezone();
  const { progress, updateProgress } = useUserProgress();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  // Generate timezone options
  const timezoneOptions = [];
  for (let i = -12; i <= 12; i++) {
    const sign = i >= 0 ? '+' : '';
    const hours = Math.abs(i).toString().padStart(2, '0');
    const value = `${sign}${hours}:00`;
    const label = `GMT${sign}${i}`;
    timezoneOptions.push({ value, label });
  }

  const handleStartEditName = () => {
    setEditName(user?.user_metadata?.name || '');
    setIsEditingName(true);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditName("");
  };

  const handleSaveName = async () => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (editName.trim().length > 50) {
      toast.error("Name must be less than 50 characters");
      return;
    }

    setIsSavingName(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { name: editName.trim() }
      });

      if (error) throw error;

      await supabase
        .from('profiles')
        .update({ username: editName.trim() })
        .eq('id', user?.id);

      toast.success("Name updated successfully");
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
      toast.success("Signed out successfully");
      navigate('/auth');
    } catch (error) {
      console.log("Sign out error (navigating anyway):", error);
      navigate('/auth');
    }
  };

  const handleTimezoneChange = async (value: string) => {
    try {
      await updateTimezone(value);
      toast.success("Timezone updated");
    } catch (error) {
      console.error("Error updating timezone:", error);
      toast.error("Failed to update timezone");
    }
  };

  const handleModeChange = async (mode: 'daily' | 'connect') => {
    const target = mode === 'daily' ? 7 : 5;
    try {
      await updateProgress({
        mode,
        target_hellos_per_week: target,
        // Reset relevant streaks when switching modes
        ...(mode === 'daily' ? { daily_streak: 0 } : { weekly_streak: 0 }),
        hellos_this_week: 0
      });
      toast.success(`Switched to ${mode === 'daily' ? 'Daily' : 'Connect'} Mode`);
    } catch (error) {
      console.error("Error updating mode:", error);
      toast.error("Failed to update mode");
    }
  };

  const currentMode = progress?.mode || 'daily';

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <img src={remiMascot} alt="Remi" className="w-10 h-10" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">Your settings & preferences</p>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="p-6 mb-4 rounded-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={50}
                    disabled={isSavingName}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveName}
                    disabled={isSavingName}
                  >
                    <Check className="h-4 w-4 text-success" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCancelEditName}
                    disabled={isSavingName}
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">
                    {user?.user_metadata?.name || 'Friend'}
                  </h2>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleStartEditName}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Mode Selection */}
        <Card className="p-5 mb-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="text-primary w-5 h-5" />
            <h3 className="font-semibold text-foreground">Challenge Mode</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleModeChange('daily')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                currentMode === 'daily' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">Daily Mode</span>
              </div>
              <p className="text-xs text-muted-foreground">One Hello a Day</p>
              <p className="text-xs text-primary mt-1">7 hellos/week</p>
            </button>

            <button
              onClick={() => handleModeChange('connect')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                currentMode === 'connect' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">Connect</span>
              </div>
              <p className="text-xs text-muted-foreground">5 Hellos a Week</p>
              <p className="text-xs text-primary mt-1">Flexible schedule</p>
            </button>
          </div>
        </Card>

        {/* Timezone */}
        <Card className="p-5 mb-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-primary w-5 h-5" />
            <h3 className="font-semibold text-foreground">Timezone</h3>
          </div>
          
          <Select value={timezoneOffset} onValueChange={handleTimezoneChange}>
            <SelectTrigger className="rounded-xl">
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
        </Card>

        {/* Sign Out */}
        <Card className="p-5 mb-4 rounded-2xl">
          <Button
            variant="outline"
            className="w-full justify-center rounded-xl"
            onClick={handleSignOut}
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </Card>

        {/* About */}
        <Card className="p-5 rounded-2xl">
          <h3 className="font-semibold mb-2 text-foreground">About One Hello</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            One Hello helps you build confidence and connect with others through small daily challenges.
          </p>
          <p className="text-xs text-muted-foreground mt-3">Version 2.0.0</p>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
