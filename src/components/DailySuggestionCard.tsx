import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface DailySuggestionCardProps {
  title: string;
  description: string;
}

export const DailySuggestionCard = ({ title, description }: DailySuggestionCardProps) => {
  return (
    <Card className="p-4 border-border/30 bg-muted/30">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <Lightbulb className="w-4 h-4 text-primary/70" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Today's Hello
          </p>
          <p className="text-sm text-foreground font-medium">
            {title}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
};
