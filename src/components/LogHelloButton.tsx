import { Button } from "@/components/ui/button";
import { Plus, Mic } from "lucide-react";

interface LogHelloButtonProps {
  onClick: () => void;
  onDictateClick?: () => void;
  variant?: "default" | "onboarding";
}

export const LogHelloButton = ({ onClick, onDictateClick, variant = "default" }: LogHelloButtonProps) => {
  return (
    <div id="any-hello-card" className="flex gap-2">
      <Button 
        onClick={onClick}
        size="lg"
        className={`flex-1 h-14 text-lg font-semibold transition-all ${
          variant === "onboarding" 
            ? "opacity-70 hover:opacity-90 shadow-md hover:shadow-lg" 
            : "shadow-lg hover:shadow-xl"
        }`}
      >
        <Plus className="w-5 h-5 mr-2" />
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
