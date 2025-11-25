import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/integrations/supabase/client";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useChallengeCompletions } from "@/hooks/useChallengeCompletions";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Bell, RotateCcw, Trash2, Globe, LogOut } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resetProgress } = useUserProgress();
  const { clearCompletions } = useChallengeCompletions();
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage("notificationsEnabled", true);
  const [reminderTime, setReminderTime] = useLocalStorage("reminderTime", "09:00");
  const [timezone, setTimezone] = useLocalStorage("timezone", "Europe/London");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
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

  const handleResetStreak = async () => {
    await resetProgress();
    setShowResetDialog(false);
    toast.success("Streak reset successfully");
  };

  const handleClearData = async () => {
    await resetProgress();
    await clearCompletions();
    setShowClearDialog(false);
    toast.success("All progress cleared");
  };

  const timeOptions = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00"
  ];

  const timezones = [
    { value: "Etc/GMT+12", label: "Baker Island (GMT-12)" },
    { value: "Pacific/Midway", label: "Midway Island (GMT-11)" },
    { value: "Pacific/Honolulu", label: "Honolulu (GMT-10)" },
    { value: "America/Anchorage", label: "Anchorage (GMT-9)" },
    { value: "America/Los_Angeles", label: "Los Angeles (GMT-8)" },
    { value: "America/Denver", label: "Denver (GMT-7)" },
    { value: "America/Chicago", label: "Chicago (GMT-6)" },
    { value: "America/New_York", label: "New York (GMT-5)" },
    { value: "America/Halifax", label: "Halifax (GMT-4)" },
    { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
    { value: "Atlantic/South_Georgia", label: "South Georgia (GMT-2)" },
    { value: "Atlantic/Cape_Verde", label: "Cape Verde (GMT-1)" },
    { value: "Europe/London", label: "London (GMT+0)" },
    { value: "Europe/Paris", label: "Paris (GMT+1)" },
    { value: "Europe/Athens", label: "Athens (GMT+2)" },
    { value: "Europe/Moscow", label: "Moscow (GMT+3)" },
    { value: "Asia/Dubai", label: "Dubai (GMT+4)" },
    { value: "Asia/Karachi", label: "Karachi (GMT+5)" },
    { value: "Asia/Dhaka", label: "Dhaka (GMT+6)" },
    { value: "Asia/Bangkok", label: "Bangkok (GMT+7)" },
    { value: "Asia/Singapore", label: "Singapore (GMT+8)" },
    { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
    { value: "Australia/Sydney", label: "Sydney (GMT+10)" },
    { value: "Pacific/Guadalcanal", label: "Solomon Islands (GMT+11)" },
    { value: "Pacific/Auckland", label: "Auckland (GMT+12)" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Settings</h1>
        <p className="text-muted-foreground mb-6">
          Manage your One Hello experience
        </p>

        {/* Notifications */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-sm">
                Daily Reminders
              </Label>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>

            {notificationsEnabled && (
              <div className="space-y-2">
                <Label htmlFor="reminder-time" className="text-sm">
                  Reminder Time
                </Label>
                <Select value={reminderTime} onValueChange={setReminderTime}>
                  <SelectTrigger id="reminder-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  You'll receive a daily reminder at this time
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Timezone */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-foreground">Timezone</h2>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-sm">
              Your Timezone
            </Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Challenges unlock at midnight in your timezone
            </p>
          </div>
        </Card>

        {/* Program Management */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <RotateCcw className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-foreground">Program</h2>
          </div>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowResetDialog(true)}
            >
              Reset Streak
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => setShowClearDialog(true)}
            >
              <Trash2 size={16} className="mr-2" />
              Clear All Progress
            </Button>
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

        {/* Reset Streak Dialog */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Streak?</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset your streak counter to 0. Your completed challenges and notes will remain intact.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetStreak}>
                Reset Streak
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Clear Data Dialog */}
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear All Progress?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your completed challenges, notes, and streak. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleClearData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Settings;
