import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { HelloLog } from "@/hooks/useHelloLogs";
import { useTimezone } from "@/hooks/useTimezone";
import { motion, AnimatePresence } from "framer-motion";

interface ViewHelloDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: HelloLog | null;
  logs?: HelloLog[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
  onSave: (id: string, updates: {
    name?: string | null;
    location?: string | null;
    notes?: string | null;
    rating?: 'positive' | 'neutral' | 'negative' | null;
    difficulty_rating?: number | null;
  }) => Promise<any>;
  onDelete?: (id: string) => Promise<void>;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
}

const ViewHelloDialog = ({ 
  open, 
  onOpenChange, 
  log, 
  logs = [],
  currentIndex = 0,
  onNavigate,
  onSave, 
  onDelete,
  onToggleFavorite
}: ViewHelloDialogProps) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [direction, setDirection] = useState(0);
  const { formatTimestamp } = useTimezone();

  useEffect(() => {
    if (log) {
      setName(log.name || "");
      setLocation(log.location || "");
      setNotes(log.notes || "");
      setIsFavorite(log.is_favorite || false);
    }
  }, [log]);

  const handleSave = async () => {
    if (!log) return;
    
    setIsSubmitting(true);
    await onSave(log.id, {
      name: name || null,
      location: location || null,
      notes: notes || null
    });
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!log || !onDelete) return;
    
    setIsDeleting(true);
    await onDelete(log.id);
    setIsDeleting(false);
    onOpenChange(false);
  };

  const canNavigatePrev = logs.length > 1 && currentIndex > 0;
  const canNavigateNext = logs.length > 1 && currentIndex < logs.length - 1;

  const handlePrev = () => {
    if (canNavigatePrev && onNavigate) {
      setDirection(-1);
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (canNavigateNext && onNavigate) {
      setDirection(1);
      onNavigate(currentIndex + 1);
    }
  };

  if (!open || !log) return null;

  const pageVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Hello log</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite(log.id, !log.is_favorite)}
              aria-label={log.is_favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Bookmark 
                className={`w-5 h-5 transition-colors ${
                  log.is_favorite 
                    ? 'fill-primary text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`} 
              />
            </Button>
          )}
          
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl max-w-[90vw]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this hello?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove this entry. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      
      {/* Content - scrollable */}
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={log.id}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="space-y-5"
          >
            {/* Timestamp */}
            <div className="text-center pb-2">
              <p className="text-sm text-muted-foreground">
                {formatTimestamp(log.created_at, true)}
              </p>
              {logs.length > 1 && (
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {currentIndex + 1} of {logs.length}
                </p>
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="view-name">Name</Label>
              <Input
                id="view-name"
                placeholder="What's their name?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-base"
              />
            </div>

            {/* Location Field */}
            <div className="space-y-2">
              <Label htmlFor="view-location">Where you met</Label>
              <Input
                id="view-location"
                placeholder="Coffee shop, gym, work..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="text-base"
              />
            </div>

            {/* Notes Field */}
            <div className="space-y-2">
              <Label htmlFor="view-notes">Notes</Label>
              <Textarea
                id="view-notes"
                placeholder="What do you want to remember about them?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-28 text-base"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action bar - positioned above the navigation bar */}
      <div className="flex-shrink-0 border-t border-border bg-background px-4 py-3 pb-20">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={!canNavigatePrev}
            className="h-12 w-12 rounded-xl flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <Button 
            variant="outline"
            onClick={() => onOpenChange(false)} 
            className="flex-1 h-12 text-lg"
          >
            Exit
          </Button>

          <Button 
            onClick={handleSave} 
            className="flex-1 h-12 text-lg" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={!canNavigateNext}
            className="h-12 w-12 rounded-xl flex-shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewHelloDialog;