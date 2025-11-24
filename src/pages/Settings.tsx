import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
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
import { Bell, RotateCcw, Trash2, Globe } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage("notificationsEnabled", true);
  const [reminderTime, setReminderTime] = useLocalStorage("reminderTime", "09:00");
  const [timezone, setTimezone] = useLocalStorage("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleResetStreak = () => {
    localStorage.setItem("streak", "0");
    localStorage.setItem("lastCompletedDate", "null");
    setShowResetDialog(false);
    toast.success("Streak reset successfully");
  };

  const handleClearData = () => {
    localStorage.setItem("completedChallenges", "[]");
    localStorage.setItem("streak", "0");
    localStorage.setItem("lastCompletedDate", "null");
    setShowClearDialog(false);
    toast.success("All progress cleared");
  };

  const timeOptions = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00"
  ];

  const timezones = [
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "America/Anchorage", label: "Alaska Time (AKT)" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
    { value: "Europe/London", label: "London (GMT/BST)" },
    { value: "Europe/Paris", label: "Paris (CET/CEST)" },
    { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
    { value: "Asia/Dubai", label: "Dubai (GST)" },
    { value: "Asia/Kolkata", label: "India (IST)" },
    { value: "Asia/Singapore", label: "Singapore (SGT)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "Asia/Shanghai", label: "Shanghai (CST)" },
    { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)" },
    { value: "Pacific/Auckland", label: "Auckland (NZDT/NZST)" },
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
