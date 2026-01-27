import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
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
import { Trash2, MapPin, X, Check } from "lucide-react";
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
      // Small delay to ensure input is rendered
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
    // Reset to original values
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[85vh] rounded-2xl p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Hello Details</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatTimestamp(log.created_at, true)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Name Section */}
          <div 
            className={`rounded-xl p-4 transition-colors ${
              editingField === 'name' 
                ? 'bg-primary/5 ring-2 ring-primary/20' 
                : 'bg-muted/30 hover:bg-muted/50 cursor-pointer'
            }`}
            onClick={() => editingField !== 'name' && setEditingField('name')}
          >
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Name
            </label>
            {editingField === 'name' ? (
              <div className="mt-2 space-y-2">
                <Input
                  ref={inputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Who did you meet?"
                  className="rounded-xl"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveField}
                    disabled={isSubmitting}
                    className="rounded-lg"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className={`mt-1 text-base ${name ? 'text-foreground font-medium' : 'text-muted-foreground italic'}`}>
                {name || "Tap to add name"}
              </p>
            )}
          </div>

          {/* Location Section */}
          <div 
            className={`rounded-xl p-4 transition-colors ${
              editingField === 'location' 
                ? 'bg-primary/5 ring-2 ring-primary/20' 
                : 'bg-muted/30 hover:bg-muted/50 cursor-pointer'
            }`}
            onClick={() => editingField !== 'location' && setEditingField('location')}
          >
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Where you met
            </label>
            {editingField === 'location' ? (
              <div className="mt-2 space-y-2">
                <Input
                  ref={inputRef}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Coffee shop, gym, park..."
                  className="rounded-xl"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveField}
                    disabled={isSubmitting}
                    className="rounded-lg"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className={`mt-1 text-base ${location ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                {location || "Tap to add location"}
              </p>
            )}
          </div>

          {/* Notes Section */}
          <div 
            className={`rounded-xl p-4 transition-colors ${
              editingField === 'notes' 
                ? 'bg-primary/5 ring-2 ring-primary/20' 
                : 'bg-muted/30 hover:bg-muted/50 cursor-pointer'
            }`}
            onClick={() => editingField !== 'notes' && setEditingField('notes')}
          >
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Notes
            </label>
            {editingField === 'notes' ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  ref={textareaRef}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  placeholder="Any details you want to remember..."
                  className="rounded-xl min-h-[120px]"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveField}
                    disabled={isSubmitting}
                    className="rounded-lg"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className={`mt-1 text-base whitespace-pre-wrap ${notes ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                {notes || "Tap to add notes"}
              </p>
            )}
          </div>
        </div>

        {/* Footer with delete */}
        {onDelete && (
          <div className="p-4 border-t border-border">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete this hello
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this hello?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove this entry from your Hellobook. This action cannot be undone.
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewHelloDialog;
