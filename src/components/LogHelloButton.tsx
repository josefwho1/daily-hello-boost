import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface LogHelloButtonProps {
  onClick: () => void;
}

export const LogHelloButton = ({ onClick }: LogHelloButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      size="lg"
      className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
    >
      <Plus className="w-5 h-5 mr-2" />
      Log a Hello
    </Button>
  );
};
