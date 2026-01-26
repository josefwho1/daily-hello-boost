import { Button } from "@/components/ui/button";
import { UserPlus, Mic } from "lucide-react";

interface SaveHelloButtonProps {
  onClick: () => void;
  onDictateClick?: () => void;
}

export const SaveHelloButton = ({ onClick, onDictateClick }: SaveHelloButtonProps) => {
  return (
    <div className="flex gap-2 justify-center">
      <Button 
        onClick={onClick}
        size="lg"
        className="flex-1 max-w-xs h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        <UserPlus className="w-5 h-5 mr-2" />
        Log a Hello
      </Button>
      {onDictateClick && (
        <Button 
          onClick={onDictateClick}
          size="lg"
          variant="outline"
          className="h-14 px-4 shadow-md hover:shadow-lg"
          title="Quick dictate"
        >
          <Mic className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};
