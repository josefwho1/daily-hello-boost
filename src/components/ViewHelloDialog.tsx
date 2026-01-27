import { useState, useEffect, useRef } from "react";
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
import { Trash2, MapPin, Check } from "lucide-react";
import { HelloLog } from "@/hooks/useHelloLogs";
import { useTimezone } from "@/hooks/useTimezone";

interface ViewHelloDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: HelloLog | null;
  onSave: (id: string, updates: {
    name?: string | null;
    location?: string | null;
    notes?: string | null;
    rating?: 'positive' | 'neutral' | 'negative' | null;
    difficulty_rating?: number | null;
  }) => Promise<any>;
  onDelete?: (id: string) => Promise<void>;
}

type EditingField = 'name' | 'location' | 'notes' | null;

const ViewHelloDialog = ({ open, onOpenChange, log, onSave, onDelete }: ViewHelloDialogProps) => {
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { formatTimestamp } = useTimezone();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (log) {
      setName(log.name || "");
      setLocation(log.location || "");
      setNotes(log.notes || "");
      setEditingField(null);
    }
  }, [log]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingField === 'name' || editingField === 'location') {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else if (editingField === 'notes') {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [editingField]);

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

  if (!log) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] rounded-t-2xl">
        {/* Drag handle */}
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted-foreground/20 my-3" />
        
        {/* Timestamp header */}
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground text-center">
            {formatTimestamp(log.created_at, true)}
          </p>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-4 pb-4 space-y-3">
          {/* Name Section */}
          <div 
            className={`rounded-xl p-3 transition-colors ${
              editingField === 'name' 
                ? 'bg-primary/5 ring-1 ring-primary/20' 
                : 'bg-muted/30 active:bg-muted/50'
            }`}
            onClick={() => editingField !== 'name' && setEditingField('name')}
          >
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Name
            </label>
            {editingField === 'name' ? (
              <div className="mt-1.5 space-y-2">
                <Input
                  ref={inputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Who did you meet?"
                  className="rounded-lg h-9 text-sm"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}
                    className="h-7 text-xs rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleSaveField(); }}
                    disabled={isSubmitting}
                    className="h-7 text-xs rounded-lg"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className={`mt-0.5 text-sm ${name ? 'text-foreground font-medium' : 'text-muted-foreground/60 italic'}`}>
                {name || "Tap to add"}
              </p>
            )}
          </div>

          {/* Location Section */}
          <div 
            className={`rounded-xl p-3 transition-colors ${
              editingField === 'location' 
                ? 'bg-primary/5 ring-1 ring-primary/20' 
                : 'bg-muted/30 active:bg-muted/50'
            }`}
            onClick={() => editingField !== 'location' && setEditingField('location')}
          >
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />
              Location
            </label>
            {editingField === 'location' ? (
              <div className="mt-1.5 space-y-2">
                <Input
                  ref={inputRef}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Coffee shop, gym..."
                  className="rounded-lg h-9 text-sm"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}
                    className="h-7 text-xs rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleSaveField(); }}
                    disabled={isSubmitting}
                    className="h-7 text-xs rounded-lg"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className={`mt-0.5 text-sm ${location ? 'text-foreground' : 'text-muted-foreground/60 italic'}`}>
                {location || "Tap to add"}
              </p>
            )}
          </div>

          {/* Notes Section */}
          <div 
            className={`rounded-xl p-3 transition-colors ${
              editingField === 'notes' 
                ? 'bg-primary/5 ring-1 ring-primary/20' 
                : 'bg-muted/30 active:bg-muted/50'
            }`}
            onClick={() => editingField !== 'notes' && setEditingField('notes')}
          >
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Notes
            </label>
            {editingField === 'notes' ? (
              <div className="mt-1.5 space-y-2">
                <Textarea
                  ref={textareaRef}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  placeholder="Details to remember..."
                  className="rounded-lg min-h-[80px] text-sm"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}
                    className="h-7 text-xs rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleSaveField(); }}
                    disabled={isSubmitting}
                    className="h-7 text-xs rounded-lg"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className={`mt-0.5 text-sm whitespace-pre-wrap ${notes ? 'text-foreground' : 'text-muted-foreground/60 italic'}`}>
                {notes || "Tap to add"}
              </p>
            )}
          </div>

          {/* Delete button */}
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full rounded-xl text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-9 text-sm"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
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
      </DrawerContent>
    </Drawer>
  );
};

export default ViewHelloDialog;
