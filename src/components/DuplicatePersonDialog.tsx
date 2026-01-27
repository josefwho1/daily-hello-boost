import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { HelloLog } from "@/hooks/useHelloLogs";

interface DuplicatePersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingLog: HelloLog;
  newName: string;
  description: string;
  onConfirmSamePerson: () => void;
  onConfirmDifferentPerson: () => void;
  isLoading?: boolean;
}

export const DuplicatePersonDialog = ({
  open,
  onOpenChange,
  existingLog,
  newName,
  description,
  onConfirmSamePerson,
  onConfirmDifferentPerson,
  isLoading = false,
}: DuplicatePersonDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            Same person? 🤔
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            <p>
              Is <span className="font-semibold text-foreground">{newName}</span> the same person as{" "}
              <span className="font-semibold text-foreground">{existingLog.name}</span> you met {description}?
            </p>
            {existingLog.notes && (
              <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2 text-left">
                "{existingLog.notes.slice(0, 100)}{existingLog.notes.length > 100 ? '...' : ''}"
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button 
            onClick={onConfirmSamePerson} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Updating..." : "Yes, same person! 🎉"}
          </Button>
          <Button 
            variant="outline" 
            onClick={onConfirmDifferentPerson}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Creating..." : "No, different person"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
