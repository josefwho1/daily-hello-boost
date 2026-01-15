import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTimezone } from "@/hooks/useTimezone";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LogOut, Clock, Target, User, Pencil, Check, X, Flame, Calendar, Sparkles, Sun, Moon, Monitor, Bell, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const Settings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { timezoneOffset, updateTimezone } = useTimezone();
  const { progress, updateProgress } = useUserProgress();
  const { theme, setTheme } = useTheme();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [showModeChangeDialog, setShowModeChangeDialog] = useState(false);
  const [pendingMode, setPendingMode] = useState<string | null>(null);

  // Handle unsubscribe URL parameter
  useEffect(() => {
    const unsubscribe = searchParams.get('unsubscribe');
    if (unsubscribe === 'true' && progress && !(progress as any).email_unsubscribed) {
      handleUnsubscribe();
    }
  }, [searchParams, progress]);

  const handleUnsubscribe = async () => {
    try {
      await updateProgress({ email_unsubscribed: true } as any);
      toast.success("You've been unsubscribed from email notifications");
      // Clear the URL parameter
      navigate('/settings', { replace: true });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      toast.error("Failed to unsubscribe");
    }
  };

  const handleEmailToggle = async (checked: boolean) => {
    try {
      await updateProgress({ email_unsubscribed: !checked } as any);
      toast.success(checked ? "Email notifications enabled" : "Email notifications disabled");
    } catch (error) {
      console.error("Error updating email preference:", error);
      toast.error("Failed to update preference");
    }
  };

  // Generate timezone options from GMT-12 to GMT+12
  const timezoneOptions = [];
  for (let i = -12; i <= 12; i++) {
    const sign = i >= 0 ? '+' : '-';
    const hours = Math.abs(i).toString().padStart(2, '0');
    const value = `${sign}${hours}:00`;
    const label = `GMT${i >= 0 ? '+' : ''}${i}`;
    timezoneOptions.push({ value, label });
  }

  const modeOptions = [
    { 
      value: '7-day-starter', 
      label: '7-Day Starter', 
      description: 'Complete 7-day challenge',
      icon: Sparkles,
      isDefault: true
    },
    { 
      value: 'daily', 
      label: 'Daily Mode', 
      description: '1 hello per day',
      icon: Flame,
      isDefault: false
    },
    { 
      value: 'connect', 
      label: 'Connect Mode', 
      description: '5 hellos per week',
      icon: Calendar,
      isDefault: false
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

      // Also update the profiles table
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
      toast.success("Timezone updated successfully");
    } catch (error) {
      console.error("Error updating timezone:", error);
      toast.error("Failed to update timezone");
    }
  };

  const handleModeClick = (value: string) => {
    if (value === progress?.mode) return; // Already selected
    
    setPendingMode(value);
    setShowModeChangeDialog(true);
  };

  const handleConfirmModeChange = async () => {
    if (!pendingMode) return;
    
    try {
      await updateProgress({
        mode: pendingMode,
        target_hellos_per_week: getTargetFromMode(pendingMode),
        // If switching away from 7-day-starter, mark as completed
        ...(pendingMode !== '7-day-starter' && { has_completed_onboarding: true, is_onboarding_week: false })
      });
      toast.success("Challenge mode updated successfully");
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

  const currentMode = progress?.mode || '7-day-starter';

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
            <User className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-foreground">Account</h2>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Name</Label>
              {isEditingName ? (
                <div className="flex gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={50}
                    disabled={isSavingName}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveName}
                    disabled={isSavingName}
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCancelEditName}
                    disabled={isSavingName}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="p-3 bg-muted rounded-lg flex-1">
                    <p className="font-medium text-foreground">{user?.user_metadata?.name || 'User'}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleStartEditName}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium text-foreground">{user?.email || 'Not set'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Challenge Mode */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-foreground">Challenge Mode</h2>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Select your challenge mode</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {modeOptions.map((mode) => {
                const Icon = mode.icon;
                const isSelected = currentMode === mode.value;
                
                return (
                  <button
                    key={mode.value}
                    onClick={() => handleModeClick(mode.value)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left",
                      isSelected 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50 bg-muted/30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium",
                          isSelected ? "text-primary" : "text-foreground"
                        )}>
                          {mode.label}
                        </span>
                        {mode.isDefault && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">{mode.description}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
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

        {/* Appearance */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Sun className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Theme</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { value: 'system' as const, label: 'System', icon: Monitor },
                { value: 'light' as const, label: 'Light', icon: Sun },
                { value: 'dark' as const, label: 'Dark', icon: Moon },
              ].map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                      isSelected 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50 bg-muted/30"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Email Notifications */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-foreground">Email Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-foreground">Email reminders</Label>
                <p className="text-xs text-muted-foreground">Get friendly nudges from Remi 🦝</p>
              </div>
              <Switch
                checked={!(progress as any)?.email_unsubscribed}
                onCheckedChange={handleEmailToggle}
              />
            </div>
          </div>
        </Card>

        {/* Sign Out */}
        <Card className="p-6 mb-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
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

      {/* Mode Change Confirmation Dialog */}
      <AlertDialog open={showModeChangeDialog} onOpenChange={setShowModeChangeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to change modes?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing your challenge mode will affect how your progress is tracked. 
              {pendingMode !== '7-day-starter' && progress?.mode === '7-day-starter' && !progress?.has_completed_onboarding && (
                <span className="block mt-2 text-destructive">
                  You haven't completed the 7-day challenge yet. Switching modes now will skip the remaining days.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelModeChange}>
              No
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmModeChange}>
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
