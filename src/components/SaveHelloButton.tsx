import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface SaveHelloButtonProps {
  onClick: () => void;
}

export const SaveHelloButton = ({ onClick }: SaveHelloButtonProps) => {
  return (
    <div className="text-center space-y-3">
      <Button 
        onClick={onClick}
        size="lg"
        className="w-full max-w-xs h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
      >
        <UserPlus className="w-5 h-5 mr-2" />
        Save a Hello
      </Button>
      <p className="text-sm text-muted-foreground">
        Save their name so you remember them next time.
      </p>
    </div>
  );
};
