import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import type { Wallpaper } from "@/data/wallpapers";

interface WallpaperPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  wallpaper: Wallpaper | null;
}

export const WallpaperPreviewDialog = ({
  open,
  onClose,
  wallpaper,
}: WallpaperPreviewDialogProps) => {
  if (!wallpaper) return null;

  const handleDownload = () => {
    // Open the image in a new tab for the user to save
    window.open(wallpaper.imageUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-background border-0 rounded-2xl">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Wallpaper preview */}
          <img
            src={wallpaper.imageUrl}
            alt={wallpaper.name}
            className="w-full h-auto max-h-[70vh] object-contain"
            loading="lazy"
          />

          {/* Download section */}
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-foreground text-center">
              {wallpaper.name}
            </h3>
            <Button
              onClick={handleDownload}
              className="w-full gap-2 rounded-xl"
              size="lg"
            >
              <Download className="w-4 h-4" />
              Save to Device
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
