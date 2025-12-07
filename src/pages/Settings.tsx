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
import { LogOut, Clock, Target, User, Pencil, Check, X } from "lucide-react";
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

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { timezoneOffset, updateTimezone } = useTimezone();
  const { progress, updateProgress } = useUserProgress();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [showExitStarterDialog, setShowExitStarterDialog] = useState(false);
  const [pendingMode, setPendingMode] = useState<string | null>(null);

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
    { value: '7-day-starter', label: '7-Day Starter', description: 'Complete 7-day challenge' },
    { value: 'daily', label: 'Daily', description: '1 hello per day' },
    { value: 'connect', label: 'Connect', description: '5 hellos per week' },
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

  const handleModeChange = async (value: string) => {
    // Check if user is leaving 7-day-starter before completing it
    if (progress?.mode === '7-day-starter' && value !== '7-day-starter' && !progress?.has_completed_onboarding) {
      setPendingMode(value);
      setShowExitStarterDialog(true);
      return;
    }
    
    await applyModeChange(value);
  };

  const applyModeChange = async (value: string) => {
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

  const handleConfirmExitStarter = async () => {
    if (pendingMode) {
      await applyModeChange(pendingMode);
    }
    setShowExitStarterDialog(false);
    setPendingMode(null);
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

      {/* Exit 7-Day Starter Confirmation Dialog */}
      <AlertDialog open={showExitStarterDialog} onOpenChange={setShowExitStarterDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to exit the 7-Day Starter?</AlertDialogTitle>
            <AlertDialogDescription>
              You haven't completed the 7-day challenge yet. Switching modes now will skip the remaining days of your starter journey.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingMode(null)}>
              Stay in 7-Day Starter
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExitStarter}>
              Yes, switch mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
