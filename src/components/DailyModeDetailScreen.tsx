import { useState } from "react";
import { ArrowLeft, Flame, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
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
import remiSuper1 from "@/assets/remi-super-1.webp";

interface DailyModeDetailScreenProps {
  isActive: boolean;
  currentStreak: number;
  bestStreak: number;
  startDate: string | null;
  onActivate: () => Promise<void>;
  onDeactivate: () => Promise<void>;
  onBack: () => void;
}

export const DailyModeDetailScreen = ({
  isActive,
  currentStreak,
  bestStreak,
  startDate,
  onActivate,
  onDeactivate,
  onBack,
}: DailyModeDetailScreenProps) => {
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleActivate = async () => {
    setIsLoading(true);
    try {
      await onActivate();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setIsLoading(true);
    try {
      await onDeactivate();
      setShowDeactivateConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src={remiSuper1} alt="Remi" className="w-8 h-8 object-contain" />
            <h1 className="text-2xl font-bold text-foreground">Daily Mode</h1>
          </div>
        </div>

        {/* Tagline */}
        <div className="mb-6">
          <p className="text-lg font-semibold text-foreground mb-2">
            The ultimate challenge: log at least one hello every single day.
          </p>
        </div>

        {/* Description Card */}
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              No streak savers. No grace days. No pauses. Miss one day and your streak resets to zero. Only the committed survive.
            </p>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Two daily reminders:</p>
              <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                <li>• Morning nudge (9am)</li>
                <li>• Afternoon reminder (4pm) if no hello logged yet</li>
              </ul>
            </div>
            
            <p className="text-sm text-muted-foreground italic">
              Your best streak is saved forever—even if your current streak breaks.
            </p>
          </CardContent>
        </Card>

        {/* Stats Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-muted-foreground">Current Streak</span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {currentStreak}
                <span className="text-lg font-normal text-muted-foreground ml-1">days</span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">Best Streak</span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {bestStreak}
                <span className="text-lg font-normal text-muted-foreground ml-1">days</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Start Date */}
        {isActive && startDate && (
          <div className="text-center text-sm text-muted-foreground mb-6">
            Started: {format(new Date(startDate), 'MMMM d, yyyy')}
          </div>
        )}

        {/* Toggle Button */}
        {isActive ? (
          <Button
            variant="outline"
            className="w-full border-destructive text-destructive hover:bg-destructive/10"
            onClick={() => setShowDeactivateConfirm(true)}
            disabled={isLoading}
          >
            Deactivate Daily Mode
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={handleActivate}
            disabled={isLoading}
          >
            {isLoading ? "Starting..." : "Start Daily Mode"}
          </Button>
        )}

        {/* Deactivation Warning Dialog */}
        <AlertDialog open={showDeactivateConfirm} onOpenChange={setShowDeactivateConfirm}>
          <AlertDialogContent className="rounded-2xl max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate Daily Mode?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure? Your current streak ({currentStreak} days) will be lost. Your best streak will be saved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl" disabled={isLoading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDeactivate}
                disabled={isLoading}
              >
                {isLoading ? "Deactivating..." : "Yes, Deactivate"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
