import { useState, useEffect, useRef, useCallback } from "react";
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";
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
import { Trash2, MapPin, Check, X, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
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

type EditingField = 'name' | 'location' | 'notes' | null;

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
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [direction, setDirection] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { formatTimestamp } = useTimezone();
  
  // Use ref callbacks to focus immediately on mount (preserves user gesture for keyboard)
  const inputRefCallback = useCallback((el: HTMLInputElement | null) => {
    if (el) {
      // Use requestAnimationFrame to ensure DOM is ready, but still within gesture context
      requestAnimationFrame(() => {
        el.focus({ preventScroll: true });
      });
    }
  }, []);

  const textareaRefCallback = useCallback((el: HTMLTextAreaElement | null) => {
    if (el) {
      requestAnimationFrame(() => {
        el.focus({ preventScroll: true });
      });
    }
  }, []);

  useEffect(() => {
    if (log) {
      setName(log.name || "");
      setLocation(log.location || "");
      setNotes(log.notes || "");
      setEditingField(null);
    }
  }, [log]);

  // Track keyboard height using Visual Viewport API
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const keyboardH = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardHeight(keyboardH);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  const startEditing = useCallback((field: Exclude<EditingField, null>) => {
    setEditingField(field);
  }, []);

  const handleSaveField = async () => {
    if (!log) return;
    
    setIsSubmitting(true);
    const result = await onSave(log.id, {
      name: name || null,
      location: location || null,
      notes: notes || null
    });
    
    if (result) {
      setEditingField(null);
    }
    setIsSubmitting(false);
  };

  const handleCancelEdit = () => {
    if (log) {
      setName(log.name || "");
      setLocation(log.location || "");
      setNotes(log.notes || "");
    }
    setEditingField(null);
  };

  const handleDelete = async () => {
    if (!log || !onDelete) return;
    
    setIsDeleting(true);
    await onDelete(log.id);
    setIsDeleting(false);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editingField !== 'notes') {
      e.preventDefault();
      handleSaveField();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
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

  if (!log) return null;

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

  const getFieldPlaceholder = (field: EditingField) => {
    switch (field) {
      case 'name': return 'Who did you meet?';
      case 'location': return 'Coffee shop, gym...';
      case 'notes': return 'Details to remember...';
      default: return '';
    }
  };

  const getFieldValue = (field: EditingField) => {
    switch (field) {
      case 'name': return name;
      case 'location': return location;
      case 'notes': return notes;
      default: return '';
    }
  };

  const setFieldValue = (field: EditingField, value: string) => {
    switch (field) {
      case 'name': setName(value); break;
      case 'location': setLocation(value); break;
      case 'notes': setNotes(value); break;
    }
  };

  const fieldConfig = {
    name: { label: 'Name', icon: null },
    location: { label: 'Location', icon: <MapPin className="w-3 h-3" /> },
    notes: { label: 'Notes', icon: null }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[95dvh] rounded-t-2xl flex flex-col">
        {/* Full view when not editing */}
        <AnimatePresence mode="wait">
          {!editingField ? (
            <motion.div
              key="full-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col h-full"
            >
              {/* Drag handle + favorite button row */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="w-10" />
                <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
                {onToggleFavorite && log ? (
                  <button
                    onClick={() => onToggleFavorite(log.id, !log.is_favorite)}
                    className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    aria-label={log.is_favorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Bookmark 
                      className={`w-5 h-5 transition-colors ${
                        log.is_favorite 
                          ? 'fill-primary text-primary' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`} 
                    />
                  </button>
                ) : (
                  <div className="w-10" /> 
                )}
              </div>

              {/* Content area - scrollable */}
              <div className="flex-1 overflow-y-auto px-4 overscroll-contain [-webkit-overflow-scrolling:touch] pb-4">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={log.id}
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                    {/* Timestamp header */}
                    <div className="text-center pb-2">
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(log.created_at, true)}
                      </p>
                      {logs.length > 1 && (
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {currentIndex + 1} of {logs.length}
                        </p>
                      )}
                    </div>

                    {/* Name field */}
                    <div 
                      className="rounded-xl p-4 transition-colors bg-muted/30 active:bg-muted/50"
                      onClick={() => startEditing('name')}
                    >
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Name
                      </label>
                      <p className={`mt-1 text-lg font-medium ${name ? 'text-foreground' : 'text-muted-foreground/60 italic'}`}>
                        {name || "Tap to add"}
                      </p>
                    </div>

                    {/* Location field */}
                    <div 
                      className="rounded-xl p-4 transition-colors bg-muted/30 active:bg-muted/50"
                      onClick={() => startEditing('location')}
                    >
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Location
                      </label>
                      <p className={`mt-1 text-base ${location ? 'text-foreground' : 'text-muted-foreground/60 italic'}`}>
                        {location || "Tap to add"}
                      </p>
                    </div>

                    {/* Notes field */}
                    <div 
                      className="rounded-xl p-4 transition-colors bg-muted/30 active:bg-muted/50"
                      onClick={() => startEditing('notes')}
                    >
                      <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Notes
                      </label>
                      <p className={`mt-1 text-base whitespace-pre-wrap ${notes ? 'text-foreground' : 'text-muted-foreground/60 italic'}`}>
                        {notes || "Tap to add"}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom action bar */}
              <div className="flex-shrink-0 border-t border-border bg-background px-4 py-3 safe-area-inset-bottom">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrev}
                    disabled={!canNavigatePrev}
                    className="h-10 w-10 rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <div className="flex items-center gap-2">
                    {onDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full text-destructive/70 hover:text-destructive hover:bg-destructive/10"
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

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onOpenChange(false)}
                      className="h-10 w-10 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    disabled={!canNavigateNext}
                    className="h-10 w-10 rounded-full"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Cropped edit view - just the field card pinned above keyboard */
            <motion.div
              key="edit-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-background z-50 flex flex-col"
            >
              {/* Spacer to push card above keyboard */}
              <div className="flex-1" />
              
              {/* The field card - pinned above keyboard */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="px-4 pb-3"
                style={{ marginBottom: keyboardHeight }}
              >
                <div className="rounded-xl p-4 bg-muted/50 border border-border shadow-lg">
                  {/* Header with label and action buttons */}
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      {fieldConfig[editingField].icon}
                      {fieldConfig[editingField].label}
                    </label>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="h-8 px-3 text-muted-foreground"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveField}
                        disabled={isSubmitting}
                        className="h-8 px-3"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {isSubmitting ? "..." : "Save"}
                      </Button>
                    </div>
                  </div>

                  {/* Input field */}
                  {editingField === 'notes' ? (
                    <Textarea
                      ref={textareaRefCallback}
                      value={getFieldValue(editingField)}
                      onChange={(e) => setFieldValue(editingField, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      placeholder={getFieldPlaceholder(editingField)}
                      className="rounded-xl min-h-[120px] max-h-[200px] text-base resize-none bg-background"
                      autoComplete="off"
                    />
                  ) : (
                    <Input
                      ref={inputRefCallback}
                      value={getFieldValue(editingField)}
                      onChange={(e) => setFieldValue(editingField, e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={getFieldPlaceholder(editingField)}
                      className="rounded-xl h-12 text-base bg-background"
                      autoComplete="off"
                    />
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DrawerContent>
    </Drawer>
  );
};

export default ViewHelloDialog;
