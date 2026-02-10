import { Button } from "@/components/ui/button";
import { UserPlus, Mic } from "lucide-react";

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
        variant="ghost"
        className="flex-1 h-10 text-sm font-medium text-muted-foreground/80 border border-border/50 hover:text-foreground hover:border-border"
      >
        <UserPlus className="w-4 h-4 mr-1.5" />
        Log another hello
      </Button>
      {onDictateClick && (
        <Button 
          id="tutorial-dictate-btn"
          onClick={onDictateClick}
          size="sm"
          variant="ghost"
          className="h-10 px-3 text-muted-foreground/50 hover:text-muted-foreground"
          title="Quick dictate"
        >
          <Mic className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
