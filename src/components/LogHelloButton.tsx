import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface LogHelloButtonProps {
  onClick: () => void;
  variant?: "default" | "onboarding";
}

export const LogHelloButton = ({ onClick, variant = "default" }: LogHelloButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      size="lg"
      className={`w-full h-14 text-lg font-semibold transition-all ${
        variant === "onboarding" 
          ? "opacity-70 hover:opacity-90 shadow-md hover:shadow-lg" 
          : "shadow-lg hover:shadow-xl"
      }`}
    >
      <Plus className="w-5 h-5 mr-2" />
      Log a Hello
    </Button>
  );
};
