import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface AnyHelloCardProps {
  onLog: () => void;
}

export const AnyHelloCard = ({ onLog }: AnyHelloCardProps) => {
  return (
    <Card className="p-5 border-border/50 bg-card">
      <div className="flex items-center gap-3 mb-3">
        <MessageCircle className="w-6 h-6 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          Any Hello
        </h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Log any interaction you had today. Add a name and notes to remember them!
      </p>
      
      <Button 
        variant="outline"
        className="w-full"
        onClick={onLog}
      >
        Log a Hello
      </Button>
    </Card>
  );
};
