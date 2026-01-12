import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, Leaf } from "lucide-react";

interface ModeSelectionDialogProps {
  open: boolean;
  onSelectMode: (mode: 'daily' | 'chill') => void;
}

export const ModeSelectionDialog = ({ open, onSelectMode }: ModeSelectionDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md mx-auto [&>button]:hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Choose Your Mode
          </DialogTitle>
          <DialogDescription className="text-base">
            Pick the pace that works best for you
          </DialogDescription>
        </DialogHeader>
          
        <div className="space-y-4">
            {/* Daily Mode */}
            <div className="border border-primary/20 rounded-xl p-4 bg-primary/5 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-bold">Daily Mode</h3>
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Recommended</span>
              </div>
              
              <p className="text-sm text-muted-foreground italic mb-3">
                One Hello a Day
              </p>
              
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• Builds powerful habits</li>
                <li>• Daily streak + XP boosts</li>
                <li>• Best way to stay connected</li>
              </ul>
              
              <Button 
                onClick={() => onSelectMode('daily')} 
                className="w-full"
                size="lg"
              >
                <Flame className="w-4 h-4 mr-2" />
                Daily Mode
              </Button>
            </div>

            {/* Chill Mode */}
            <div className="border border-border rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-bold">Chill Mode</h3>
              </div>
              
              <p className="text-sm text-muted-foreground italic mb-3">
                5 Hellos per Week
              </p>
              
              <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                <li>• More flexible</li>
                <li>• Weekly streak</li>
                <li>• Perfect for busy schedules</li>
              </ul>
              
              <Button 
                onClick={() => onSelectMode('chill')} 
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Leaf className="w-4 h-4 mr-2" />
                Chill Mode
              </Button>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
};
