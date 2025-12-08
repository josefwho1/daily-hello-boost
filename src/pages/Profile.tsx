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
import { LogOut, Clock, User, Pencil, Check, X, Flame, Calendar, Sparkles, Target } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import remiMascot from "@/assets/remi-waving.webp";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { timezoneOffset, updateTimezone } = useTimezone();
  const { progress, updateProgress } = useUserProgress();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [showModeChangeDialog, setShowModeChangeDialog] = useState(false);
  const [pendingMode, setPendingMode] = useState<string | null>(null);

  // Generate timezone options
  const timezoneOptions = [];
  for (let i = -12; i <= 12; i++) {
    const sign = i >= 0 ? '+' : '';
    const hours = Math.abs(i).toString().padStart(2, '0');
    const value = `${sign}${hours}:00`;
    const label = `GMT${sign}${i}`;
    timezoneOptions.push({ value, label });
  }

  const modeOptions = [
    { 
      value: '7-day-starter', 
      label: '7-Day Starter', 
      description: 'Complete 7-day challenge',
      icon: Sparkles
    },
    { 
      value: 'daily', 
      label: 'Daily Mode', 
      description: '1 hello per day',
      icon: Flame
    },
    { 
      value: 'connect', 
      label: 'Connect Mode', 
      description: '5 hellos per week',
      icon: Calendar
    },
  ];

  const getTargetFromMode = (mode: string) => {
    switch (mode) {
      case '7-day-starter': return 7;
      case 'daily': return 7;
      case 'connect': return 5;
      default: return 5;
    }
  };

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

  const handleModeClick = (value: string) => {
    setPendingMode(value);
    setShowModeChangeDialog(true);
  };

  const handleConfirmModeChange = async () => {
    if (!pendingMode) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (pendingMode === '7-day-starter') {
        // Reset to 7-day starter mode - restart onboarding
        await updateProgress({
          mode: pendingMode,
          target_hellos_per_week: 7,
          has_completed_onboarding: false,
          is_onboarding_week: true,
          onboarding_week_start: today,
          hellos_this_week: 0,
          daily_streak: 0,
        });
        toast.success("7-Day Starter challenge restarted!");
      } else {
        // Switching to daily or connect mode
        await updateProgress({
          mode: pendingMode,
          target_hellos_per_week: getTargetFromMode(pendingMode),
          has_completed_onboarding: true,
          is_onboarding_week: false,
        });
        toast.success("Challenge mode updated successfully");
      }
    } catch (error) {
      console.error("Error updating mode:", error);
      toast.error("Failed to update mode");
    }
    setShowModeChangeDialog(false);
    setPendingMode(null);
  };

  const handleCancelModeChange = () => {
    setShowModeChangeDialog(false);
    setPendingMode(null);
  };

  // Determine current mode - if still in onboarding week with 'normal' default, show as 7-day-starter
  const currentMode = (progress?.is_onboarding_week && !progress?.has_completed_onboarding) 
    ? '7-day-starter' 
    : (progress?.mode === 'normal' ? 'connect' : (progress?.mode || '7-day-starter'));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <img src={remiMascot} alt="Remi" className="w-10 h-auto max-h-10 object-contain" />
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

        {/* Challenge Mode - 3 Buttons */}
        <Card className="p-5 mb-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-primary w-5 h-5" />
            <h3 className="font-semibold text-foreground">Challenge Mode</h3>
          </div>
          
          <div className="space-y-2">
            {modeOptions.map((mode) => {
              const Icon = mode.icon;
              const isSelected = currentMode === mode.value;
              
              return (
                <button
                  key={mode.value}
                  onClick={() => handleModeClick(mode.value)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                    isSelected 
                      ? "border-primary bg-primary/10" 
                      : "border-border hover:border-primary/50 bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {mode.label}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{mode.description}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </button>
              );
            })}
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

      {/* Mode Change Confirmation Dialog */}
      <Dialog open={showModeChangeDialog} onOpenChange={setShowModeChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingMode === '7-day-starter' 
                ? "Restart 7-Day Starter Challenge?" 
                : "Are you sure you want to change modes?"}
            </DialogTitle>
            <DialogDescription>
              {pendingMode === '7-day-starter' ? (
                <span>
                  This will restart your 7-day challenge from Day 1. Your daily streak will reset, but your lifetime hellos and orbs will be kept.
                </span>
              ) : pendingMode !== '7-day-starter' && currentMode === '7-day-starter' && !progress?.has_completed_onboarding ? (
                <span>
                  You haven't completed the 7-day challenge yet. Switching modes now will skip the remaining days of your starter journey.
                </span>
              ) : (
                <span>
                  Changing your challenge mode will affect how your progress is tracked.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancelModeChange}>
              No
            </Button>
            <Button onClick={handleConfirmModeChange}>
              {pendingMode === '7-day-starter' ? "Restart" : "Yes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
