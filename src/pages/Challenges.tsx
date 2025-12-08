import { useState } from "react";
import { Card } from "@/components/ui/card";
import { InspirationCard } from "@/components/InspirationCard";
import { sevenWaysToSayHello, onboardingChallenges } from "@/data/onboardingChallenges";
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import remiMascot from "@/assets/remi-waving.webp";

export default function Challenges() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <img src={remiMascot} alt="Remi" className="w-12 h-12 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inspiration</h1>
            <p className="text-sm text-muted-foreground">Ideas to help you say hello</p>
          </div>
        </div>

        <InspirationCard />

        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">7 Ways to Say Hello</h2>
          </div>
          
          <div className="space-y-3">
            {sevenWaysToSayHello.map((category) => (
              <Card key={category.category} className="overflow-hidden">
                <button
                  className="w-full p-4 flex items-center justify-between text-left"
                  onClick={() => setExpandedCategory(
                    expandedCategory === category.category ? null : category.category
                  )}
                >
                  <span className="font-medium text-foreground">{category.category}</span>
                  {expandedCategory === category.category 
                    ? <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    : <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  }
                </button>
                
                {expandedCategory === category.category && (
                  <div className="px-4 pb-4 space-y-2">
                    {category.scripts.map((script, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg text-sm text-foreground">
                        "{script}"
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">The 7 First Week Challenges</h2>
          <div className="space-y-3">
            {onboardingChallenges.map((challenge) => (
              <Card key={challenge.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {challenge.id}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
