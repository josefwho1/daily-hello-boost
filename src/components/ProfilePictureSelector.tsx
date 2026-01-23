import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Check, Lock } from "lucide-react";

// Import all Remi images
import remiWaving from "@/assets/remi-waving.webp";
import remiWaving1 from "@/assets/remi-waving-1.webp";
import remiWaving2 from "@/assets/remi-waving-2.webp";
import remiWaving3 from "@/assets/remi-waving-3.webp";
import remiWaving4 from "@/assets/remi-waving-4.webp";
import remiCurious1 from "@/assets/remi-curious-1.webp";
import remiCurious2 from "@/assets/remi-curious-2.webp";
import remiCurious3 from "@/assets/remi-curious-3.webp";
import remiCurious4 from "@/assets/remi-curious-4.webp";
import remiCelebrating1 from "@/assets/remi-celebrating-1.webp";
import remiCelebrating2 from "@/assets/remi-celebrating-2.webp";
import remiCelebrating3 from "@/assets/remi-celebrating-3.webp";
import remiCelebrating4 from "@/assets/remi-celebrating-4.webp";
import remiCelebrating5 from "@/assets/remi-celebrating-5.webp";
import remiCelebrating6 from "@/assets/remi-celebrating-6.webp";
import remiCelebrating7 from "@/assets/remi-celebrating-7.webp";
import remiCelebrating8 from "@/assets/remi-celebrating-8.webp";
import remiCelebrating9 from "@/assets/remi-celebrating-9.webp";
import remiCelebrating10 from "@/assets/remi-celebrating-10.webp";
import remiCongrats1 from "@/assets/remi-congrats-1.webp";
import remiCongrats2 from "@/assets/remi-congrats-2.webp";
import remiSurprised1 from "@/assets/remi-surprised-1.webp";
import remiSurprised2 from "@/assets/remi-surprised-2.webp";
import remiLogging1 from "@/assets/remi-logging-1.webp";
import remiLogging2 from "@/assets/remi-logging-2.webp";
import remiLogging3 from "@/assets/remi-logging-3.webp";
import remiLogging4 from "@/assets/remi-logging-4.webp";
import remiLogging5 from "@/assets/remi-logging-5.webp";
import remiHoldingOrb from "@/assets/remi-holding-orb.webp";
import remiSuper1 from "@/assets/remi-super-1.webp";
import remiOrbCelebration from "@/assets/remi-orb-celebration.webp";

export const remiImages: { id: string; src: string; label: string; requiredLevel?: number }[] = [
  { id: "remi-waving.webp", src: remiWaving, label: "Waving Remi" },
  { id: "remi-waving-1.webp", src: remiWaving1, label: "Waving Remi 1" },
  { id: "remi-waving-2.webp", src: remiWaving2, label: "Waving Remi 2" },
  { id: "remi-waving-3.webp", src: remiWaving3, label: "Waving Remi 3" },
  { id: "remi-waving-4.webp", src: remiWaving4, label: "Waving Remi 4" },
  { id: "remi-curious-1.webp", src: remiCurious1, label: "Curious Remi 1" },
  { id: "remi-curious-2.webp", src: remiCurious2, label: "Curious Remi 2" },
  { id: "remi-curious-3.webp", src: remiCurious3, label: "Curious Remi 3" },
  { id: "remi-curious-4.webp", src: remiCurious4, label: "Curious Remi 4" },
  { id: "remi-celebrating-1.webp", src: remiCelebrating1, label: "Celebrating 1" },
  { id: "remi-celebrating-2.webp", src: remiCelebrating2, label: "Celebrating 2" },
  { id: "remi-celebrating-3.webp", src: remiCelebrating3, label: "Celebrating 3" },
  { id: "remi-celebrating-4.webp", src: remiCelebrating4, label: "Celebrating 4" },
  { id: "remi-celebrating-5.webp", src: remiCelebrating5, label: "Celebrating 5" },
  { id: "remi-celebrating-6.webp", src: remiCelebrating6, label: "Celebrating 6" },
  { id: "remi-celebrating-7.webp", src: remiCelebrating7, label: "Celebrating 7" },
  { id: "remi-celebrating-8.webp", src: remiCelebrating8, label: "Celebrating 8" },
  { id: "remi-celebrating-9.webp", src: remiCelebrating9, label: "Celebrating 9" },
  { id: "remi-celebrating-10.webp", src: remiCelebrating10, label: "Celebrating 10" },
  { id: "remi-congrats-1.webp", src: remiCongrats1, label: "Congrats 1" },
  { id: "remi-congrats-2.webp", src: remiCongrats2, label: "Congrats 2" },
  { id: "remi-surprised-1.webp", src: remiSurprised1, label: "Surprised 1" },
  { id: "remi-surprised-2.webp", src: remiSurprised2, label: "Surprised 2" },
  { id: "remi-logging-1.webp", src: remiLogging1, label: "Logging 1" },
  { id: "remi-logging-2.webp", src: remiLogging2, label: "Logging 2" },
  { id: "remi-logging-3.webp", src: remiLogging3, label: "Logging 3" },
  { id: "remi-logging-4.webp", src: remiLogging4, label: "Logging 4" },
  { id: "remi-logging-5.webp", src: remiLogging5, label: "Logging 5" },
  { id: "remi-holding-orb.webp", src: remiHoldingOrb, label: "Holding Orb", requiredLevel: 5 },
  { id: "remi-super-1.webp", src: remiSuper1, label: "Super Remi", requiredLevel: 10 },
  { id: "remi-orb-celebration.webp", src: remiOrbCelebration, label: "Orb Celebration" },
];

// Helper function to get image source from id
export const getProfilePictureSrc = (id: string | null | undefined): string => {
  const image = remiImages.find((img) => img.id === id);
  return image?.src || remiWaving;
};

interface ProfilePictureSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  userLevel?: number;
}

export const ProfilePictureSelector = ({
  open,
  onOpenChange,
  selectedId,
  onSelect,
  userLevel = 1,
}: ProfilePictureSelectorProps) => {
  const handleSelect = (id: string, requiredLevel?: number) => {
    if (requiredLevel && userLevel < requiredLevel) {
      return; // Don't allow selection if locked
    }
    onSelect(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center">Choose Your Remi</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 pr-2">
          <div className="grid grid-cols-3 gap-3 pb-4">
            {remiImages.map((image) => {
              const isLocked = image.requiredLevel && userLevel < image.requiredLevel;
              
              return (
                <button
                  key={image.id}
                  onClick={() => handleSelect(image.id, image.requiredLevel)}
                  disabled={isLocked}
                  className={cn(
                    "relative aspect-square rounded-xl border-2 p-2 transition-all bg-muted/30",
                    isLocked 
                      ? "opacity-60 cursor-not-allowed border-border"
                      : "hover:scale-105",
                    selectedId === image.id && !isLocked
                      ? "border-primary bg-primary/10"
                      : !isLocked && "border-border hover:border-primary/50"
                  )}
                >
                  <img
                    src={image.src}
                    alt={image.label}
                    className={cn(
                      "w-full h-full object-contain",
                      isLocked && "grayscale"
                    )}
                  />
                  {isLocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-xl">
                      <Lock className="w-5 h-5 text-white mb-1" />
                      <span className="text-[10px] text-white font-medium">Lvl {image.requiredLevel}</span>
                    </div>
                  )}
                  {selectedId === image.id && !isLocked && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
