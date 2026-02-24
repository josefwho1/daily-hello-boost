import { Button } from "@/components/ui/button";
import { UserPlus, Mic } from "lucide-react";
import { toast } from "sonner";

interface SaveHelloButtonProps {
  onClick: () => void;
  onDictateClick?: () => void;
}

export const SaveHelloButton = ({ onClick, onDictateClick }: SaveHelloButtonProps) => {
  return (
    <div className="flex gap-2">
      <Button 
        id="tutorial-log-hello-btn"
        onClick={onClick}
        size="sm"
        className="flex-1 h-10 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
      >
        <UserPlus className="w-4 h-4 mr-1.5" />
        Log a hello
      </Button>
      {onDictateClick && (
        <Button 
          id="tutorial-dictate-btn"
          onClick={() => {
            if (!navigator.onLine) {
              toast("You're offline", { description: "Voice dictation requires an internet connection." });
              return;
            }
            onDictateClick();
          }}
          size="sm"
          className={`h-10 px-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full ${!navigator.onLine ? "opacity-50" : ""}`}
          title={!navigator.onLine ? "Dictation unavailable offline" : "Quick dictate"}
        >
          <Mic className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
