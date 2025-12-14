import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { XpProgressBar } from "@/components/XpProgressBar";
import { DailyModeSelectedDialog } from "@/components/DailyModeSelectedDialog";
import { ChillModeSelectedDialog } from "@/components/ChillModeSelectedDialog";
import { ProfilePictureSelector, getProfilePictureSrc } from "@/components/ProfilePictureSelector";
import { LogOut, Clock, Pencil, Check, X, Flame, Calendar, Route, Bell, Camera, Instagram, Globe, Mail, Sun, Moon, Monitor, Smartphone, Share, ChevronDown, ChevronUp } from "lucide-react";
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
  const { theme, setTheme } = useTheme();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [showModeChangeDialog, setShowModeChangeDialog] = useState(false);
  const [showDailyModeConfirm, setShowDailyModeConfirm] = useState(false);
  const [showChillModeConfirm, setShowChillModeConfirm] = useState(false);
  const [pendingMode, setPendingMode] = useState<string | null>(null);
  const [showProfilePictureSelector, setShowProfilePictureSelector] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [showInstallSteps, setShowInstallSteps] = useState(false);

  // Fetch profile picture from profiles table
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('profile_picture')
        .eq('id', user.id)
        .single();
      if (data?.profile_picture) {
        setProfilePicture(data.profile_picture);
      }
    };
    fetchProfilePicture();
  }, [user]);

  const handleProfilePictureSelect = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ profile_picture: id })
        .eq('id', user.id);
      if (error) throw error;
      setProfilePicture(id);
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture");
    }
  };

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
        <Card className="p-4 mb-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowProfilePictureSelector(true)}
              className="relative w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden group"
            >
              <img 
                src={getProfilePictureSrc(profilePicture)} 
                alt="Profile" 
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <Camera className="w-5 h-5 text-white" />
              </div>
            </button>
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
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className={cn(
                        "font-medium",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {mode.label}
                      </span>
                      <span className="text-sm text-muted-foreground">• {mode.description}</span>
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
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-foreground">Email reminders</Label>
                <p className="text-xs text-muted-foreground">Get reminders from Remi to keep you on track 🦝</p>
              </div>
              <Switch
                checked={
                  progress?.current_phase === 'onboarding' 
                    ? progress?.onboarding_email_opt_in !== false
                    : progress?.current_phase === 'daily_path'
                    ? progress?.daily_email_opt_in !== false
                    : progress?.chill_email_opt_in !== false
                }
                onCheckedChange={async (checked) => {
                  try {
                    if (progress?.current_phase === 'onboarding') {
                      await updateProgress({ onboarding_email_opt_in: checked });
                    } else if (progress?.current_phase === 'daily_path') {
                      await updateProgress({ daily_email_opt_in: checked });
                    } else {
                      await updateProgress({ chill_email_opt_in: checked });
                    }
                    toast.success(checked ? "Reminders enabled" : "Reminders disabled");
                  } catch (error) {
                    toast.error("Failed to update preference");
                  }
                }}
              />
            </div>
          </div>
        </Card>

        {/* Add to Home Screen */}
        <Card className="p-5 mb-4 rounded-2xl">
          <button
            onClick={() => setShowInstallSteps(!showInstallSteps)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="text-primary w-5 h-5" />
              <h3 className="font-semibold text-foreground">Add One Hello to your home screen</h3>
            </div>
            {showInstallSteps ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          
          {showInstallSteps && (
            <div className="mt-4 space-y-3 pl-8">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">1</span>
                <p className="text-sm text-muted-foreground">Open this site in Chrome or Safari</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">2</span>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">Tap the share icon</p>
                  <Share className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">3</span>
                <p className="text-sm text-muted-foreground">Select "Add to Home Screen"</p>
              </div>
            </div>
          )}
        </Card>

        {/* Appearance */}
        <Card className="p-5 mb-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Sun className="text-primary w-5 h-5" />
            <h3 className="font-semibold text-foreground">Appearance</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
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
                    "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
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
        </Card>

        {/* Social & Support Links */}
        <Card className="p-5 mb-4 rounded-2xl">
          <h3 className="font-semibold mb-4 text-foreground">Follow us on</h3>
          <div className="flex justify-center gap-6 mb-6">
            <a 
              href="https://www.instagram.com/onehelloapp/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <Instagram className="w-6 h-6 text-primary" />
            </a>
            <a 
              href="https://www.tiktok.com/@onehelloapp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            <a 
              href="https://www.youtube.com/@onehelloapp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a 
              href="https://www.facebook.com/profile.php?id=61584209248453" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <a 
              href="https://onehello.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>onehello.io</span>
            </a>
            <a 
              href="mailto:remi@onehello.io"
              className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Something not working? Email remi@onehello.io</span>
            </a>
          </div>
        </Card>

        {/* Sign Out */}
        <Card className="p-5 rounded-2xl">
          <Button
            variant="outline"
            className="w-full justify-center rounded-xl"
            onClick={handleSignOut}
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
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

      <ProfilePictureSelector
        open={showProfilePictureSelector}
        onOpenChange={setShowProfilePictureSelector}
        selectedId={profilePicture}
        onSelect={handleProfilePictureSelect}
        userLevel={progress?.current_level || 1}
      />
    </div>
  );
};

export default Profile;
