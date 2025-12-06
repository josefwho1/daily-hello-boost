import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Lightbulb } from "lucide-react";
import { sevenWaysToSayHello } from "@/data/onboardingChallenges";

export const InspirationCard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scriptIndex, setScriptIndex] = useState(0);

  const currentCategory = sevenWaysToSayHello[currentIndex];
  const currentScript = currentCategory.scripts[scriptIndex];

  const showAnother = () => {
    // Cycle through scripts first, then categories
    if (scriptIndex < currentCategory.scripts.length - 1) {
      setScriptIndex(scriptIndex + 1);
    } else {
      setScriptIndex(0);
      setCurrentIndex((currentIndex + 1) % sevenWaysToSayHello.length);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-full bg-primary/20">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Need inspiration?</h3>
          <p className="text-sm text-muted-foreground">Try one of these ways to say hello</p>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 mb-4">
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">
          {currentCategory.category}
        </p>
        <p className="text-lg text-foreground font-medium">
          "{currentScript}"
        </p>
      </div>

      <Button 
        variant="outline" 
        onClick={showAnother}
        className="w-full"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Show me another
      </Button>
    </Card>
  );
};
