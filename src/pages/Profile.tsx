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
import { Switch } from "@/components/ui/switch";
import { XpProgressBar } from "@/components/XpProgressBar";
import { DailyModeSelectedDialog } from "@/components/DailyModeSelectedDialog";
import { ChillModeSelectedDialog } from "@/components/ChillModeSelectedDialog";
import { LogOut, Clock, User, Pencil, Check, X, Flame, Calendar, Route, Hand, Bell } from "lucide-react";
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
  const [showDailyModeConfirm, setShowDailyModeConfirm] = useState(false);
  const [showChillModeConfirm, setShowChillModeConfirm] = useState(false);
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
      value: 'daily', 
      label: 'Daily', 
      description: '1 hello per day',
      icon: Flame
    },
    { 
      value: 'chill', 
      label: 'Chill', 
      description: '5 hellos per week',
      icon: Calendar
    },
  ];

  const getTargetFromMode = (mode: string) => {
    switch (mode) {
      case '7-day-starter': return 7;
      case 'daily': return 7;
      case 'chill': return 5;
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
      // Show mode-specific confirmation dialog
      setShowModeChangeDialog(false);
      if (pendingMode === 'daily') {
        setShowDailyModeConfirm(true);
      } else {
        setShowChillModeConfirm(true);
      }
    } catch (error) {
      console.error("Error updating mode:", error);
      toast.error("Failed to update mode");
      setShowModeChangeDialog(false);
      setPendingMode(null);
    }
  };

  const handleModeConfirmContinue = async () => {
    if (!pendingMode) return;
    
    try {
      await updateProgress({
        mode: pendingMode,
        target_hellos_per_week: getTargetFromMode(pendingMode),
        has_completed_onboarding: true,
        is_onboarding_week: false,
      });
      toast.success(`🎉 You're now in ${pendingMode === 'daily' ? 'Daily' : 'Chill'} Mode!`);
    } catch (error) {
      console.error("Error updating mode:", error);
      toast.error("Failed to update mode");
    }
    
    setShowDailyModeConfirm(false);
    setShowChillModeConfirm(false);
    setPendingMode(null);
  };

  const handleCancelModeChange = () => {
    setShowModeChangeDialog(false);
    setPendingMode(null);
  };

  // Determine current mode - if still in onboarding week with 'normal' default, show as 7-day-starter
  const currentMode = (progress?.is_onboarding_week && !progress?.has_completed_onboarding) 
    ? '7-day-starter' 
    : (progress?.mode === 'normal' ? 'chill' : (progress?.mode === 'connect' ? 'chill' : (progress?.mode || '7-day-starter')));

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

        {/* XP & Level Progress */}
        <div className="mb-4">
          <XpProgressBar
            totalXp={progress?.total_xp || 0}
            currentLevel={progress?.current_level || 1}
          />
        </div>

        {/* Lifetime Stats */}
        <Card className="p-5 mb-4 rounded-2xl bg-gradient-to-br from-[#FFF4F5] to-white border border-[#FF6B35]/10">
          <div className="flex items-center gap-3 mb-3">
            <Hand className="text-[#FF6B35] w-5 h-5" />
            <h3 className="font-semibold text-[#502a13]">Lifetime Hellos</h3>
          </div>
          <p className="text-3xl font-bold text-[#FF6B35]">{progress?.total_hellos || 0}</p>
        </Card>

        {/* Path - Only show after onboarding is complete */}
        {progress?.has_completed_onboarding && (
          <Card className="p-5 mb-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Route className="text-primary w-5 h-5" />
              <h3 className="font-semibold text-foreground">Path</h3>
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
        )}

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

        {/* Email Notifications */}
        <Card className="p-5 mb-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-primary w-5 h-5" />
            <h3 className="font-semibold text-foreground">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            {/* Show relevant toggle based on current phase */}
            {progress?.current_phase === 'onboarding' && (
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Onboarding reminders</Label>
                  <p className="text-xs text-muted-foreground">One email per day to help you finish the 7-day challenge</p>
                </div>
                <Switch
                  checked={progress?.onboarding_email_opt_in !== false}
                  onCheckedChange={async (checked) => {
                    try {
                      await updateProgress({ onboarding_email_opt_in: checked });
                      toast.success(checked ? "Reminders enabled" : "Reminders disabled");
                    } catch (error) {
                      toast.error("Failed to update preference");
                    }
                  }}
                />
              </div>
            )}
            
            {progress?.current_phase === 'daily_path' && (
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Daily Hello reminders</Label>
                  <p className="text-xs text-muted-foreground">Email reminders if you haven't said your hello yet today</p>
                </div>
                <Switch
                  checked={progress?.daily_email_opt_in !== false}
                  onCheckedChange={async (checked) => {
                    try {
                      await updateProgress({ daily_email_opt_in: checked });
                      toast.success(checked ? "Reminders enabled" : "Reminders disabled");
                    } catch (error) {
                      toast.error("Failed to update preference");
                    }
                  }}
                />
              </div>
            )}
            
            {progress?.current_phase === 'chill_path' && (
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Weekly Hello reminders</Label>
                  <p className="text-xs text-muted-foreground">Email reminders to help you reach 5 hellos each week</p>
                </div>
                <Switch
                  checked={progress?.chill_email_opt_in !== false}
                  onCheckedChange={async (checked) => {
                    try {
                      await updateProgress({ chill_email_opt_in: checked });
                      toast.success(checked ? "Reminders enabled" : "Reminders disabled");
                    } catch (error) {
                      toast.error("Failed to update preference");
                    }
                  }}
                />
              </div>
            )}

            {/* Fallback for users without current_phase set */}
            {!progress?.current_phase && (
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-foreground">Email reminders</Label>
                  <p className="text-xs text-muted-foreground">Receive helpful reminder emails</p>
                </div>
                <Switch
                  checked={progress?.daily_email_opt_in !== false}
                  onCheckedChange={async (checked) => {
                    try {
                      await updateProgress({ 
                        daily_email_opt_in: checked,
                        chill_email_opt_in: checked,
                        onboarding_email_opt_in: checked
                      });
                      toast.success(checked ? "Reminders enabled" : "Reminders disabled");
                    } catch (error) {
                      toast.error("Failed to update preference");
                    }
                  }}
                />
              </div>
            )}
          </div>
        </Card>
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
            <DialogTitle>Change your path?</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>Switching your path will affect how your progress is tracked (daily vs weekly).</p>
              <p>You'll keep your stats and orbs don't worry.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancelModeChange}>
              No
            </Button>
            <Button onClick={handleConfirmModeChange}>
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DailyModeSelectedDialog
        open={showDailyModeConfirm}
        onContinue={handleModeConfirmContinue}
      />

      <ChillModeSelectedDialog
        open={showChillModeConfirm}
        onContinue={handleModeConfirmContinue}
      />
    </div>
  );
};

export default Profile;
