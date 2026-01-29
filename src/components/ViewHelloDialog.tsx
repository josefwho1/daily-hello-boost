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
  
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorBarRef = useRef<HTMLDivElement>(null);

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
      // When keyboard opens, visualViewport.height shrinks
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

  // Focus input when editing field changes
  useEffect(() => {
    if (!editingField) return;
    
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const el = editingField === 'notes' ? textareaRef.current : inputRef.current;
      if (el) {
        el.focus({ preventScroll: true });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [editingField]);

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

  const getFieldLabel = (field: EditingField) => {
    switch (field) {
      case 'name': return 'Name';
      case 'location': return 'Location';
      case 'notes': return 'Notes';
      default: return '';
    }
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[95dvh] rounded-t-2xl flex flex-col">
        {/* Drag handle + favorite button row */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="w-10" /> {/* Spacer for symmetry */}
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
        <div
          className="flex-1 overflow-y-auto px-4 overscroll-contain [-webkit-overflow-scrolling:touch]"
          style={{ paddingBottom: editingField ? 120 + keyboardHeight : 16 }}
        >
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

              {/* Name Section - hide when editing this field */}
              {editingField !== 'name' && (
                <div 
                  className="rounded-xl p-4 transition-colors bg-muted/30 active:bg-muted/50"
                  onClick={() => !editingField && startEditing('name')}
                >
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </label>
                  <p className={`mt-1 text-lg ${name ? 'text-foreground font-medium' : 'text-muted-foreground/60 italic'}`}>
                    {name || "Tap to add"}
                  </p>
                </div>
              )}

              {/* Location Section - hide when editing this field */}
              {editingField !== 'location' && (
                <div 
                  className="rounded-xl p-4 transition-colors bg-muted/30 active:bg-muted/50"
                  onClick={() => !editingField && startEditing('location')}
                >
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Location
                  </label>
                  <p className={`mt-1 text-base ${location ? 'text-foreground' : 'text-muted-foreground/60 italic'}`}>
                    {location || "Tap to add"}
                  </p>
                </div>
              )}

              {/* Notes Section - hide when editing this field */}
              {editingField !== 'notes' && (
                <div 
                  className="rounded-xl p-4 transition-colors bg-muted/30 active:bg-muted/50"
                  onClick={() => !editingField && startEditing('notes')}
                >
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Notes
                  </label>
                  <p className={`mt-1 text-base whitespace-pre-wrap ${notes ? 'text-foreground' : 'text-muted-foreground/60 italic'}`}>
                    {notes || "Tap to add"}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pinned Editor Bar - appears when editing */}
        <AnimatePresence>
          {editingField && (
            <motion.div
              ref={editorBarRef}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-0 right-0 bg-background border-t border-border shadow-lg z-50"
              style={{ 
                bottom: keyboardHeight,
              }}
            >
              <div className="px-4 py-3 space-y-3">
                {/* Field label */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Editing {getFieldLabel(editingField)}
                  </span>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Input field */}
                {editingField === 'notes' ? (
                  <Textarea
                    ref={textareaRef}
                    value={getFieldValue(editingField)}
                    onChange={(e) => setFieldValue(editingField, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    placeholder={getFieldPlaceholder(editingField)}
                    className="rounded-xl min-h-[80px] max-h-[120px] text-base resize-none"
                    autoComplete="off"
                    autoFocus
                  />
                ) : (
                  <Input
                    ref={inputRef}
                    value={getFieldValue(editingField)}
                    onChange={(e) => setFieldValue(editingField, e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={getFieldPlaceholder(editingField)}
                    className="rounded-xl h-11 text-base"
                    autoComplete="off"
                    autoFocus
                  />
                )}

                {/* Action buttons */}
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="h-10 px-4 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveField}
                    disabled={isSubmitting}
                    className="h-10 px-5 rounded-xl"
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom action bar - hide when editing */}
        {!editingField && (
          <div className="flex-shrink-0 border-t border-border bg-background px-4 py-3 safe-area-inset-bottom">
            <div className="flex items-center justify-between">
              {/* Left nav button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                disabled={!canNavigatePrev}
                className="h-10 w-10 rounded-full"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              {/* Center actions */}
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

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-10 w-10 rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Right nav button */}
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
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default ViewHelloDialog;
