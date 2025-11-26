import { Pack } from "@/types/pack";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Check } from "lucide-react";

interface PackSelectorProps {
  packs: Pack[];
  selectedPackId: string;
  onSelectPack: (packId: string) => void;
}

export const PackSelector = ({ packs, selectedPackId, onSelectPack }: PackSelectorProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {packs.map((pack) => (
          <Card
            key={pack.id}
            className={`cursor-pointer transition-all ${
              selectedPackId === pack.id
                ? "border-primary ring-2 ring-primary"
                : "hover:border-primary/50"
            }`}
            onClick={() => pack.challenges.length > 0 && onSelectPack(pack.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="text-4xl mb-2">{pack.icon}</div>
                {selectedPackId === pack.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
              <CardTitle className="text-xl">{pack.name}</CardTitle>
              <CardDescription>{pack.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {pack.challenges.length} challenges
                </span>
                {pack.challenges.length > 0 ? (
                  <Button
                    variant={selectedPackId === pack.id ? "default" : "outline"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPack(pack.id);
                    }}
                  >
                    {selectedPackId === pack.id ? "Selected" : "Select"}
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground">Coming Soon</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
