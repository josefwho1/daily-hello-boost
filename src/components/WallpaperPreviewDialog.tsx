import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Wallpaper } from "@/data/wallpapers";
import { toast } from "sonner";

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

  const handleDownload = async () => {
    try {
      // Fetch the image as a blob
      const response = await fetch(wallpaper.imageUrl);
      const blob = await response.blob();
      
      // Try Web Share API first (works better on mobile for saving to photos)
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `${wallpaper.name}.png`, { type: 'image/png' });
        const shareData = { files: [file] };
        
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast.success("Image ready to save!");
          return;
        }
      }
      
      // Fallback: Download the file directly
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${wallpaper.name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Wallpaper downloaded!");
    } catch (error) {
      console.error('Download failed:', error);
      // Ultimate fallback: open in new tab
      window.open(wallpaper.imageUrl, "_blank");
      toast.info("Long press the image to save it");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden bg-background border-0 rounded-2xl [&>button]:hidden">
        <div className="relative">
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
              Save to Photos
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full rounded-xl"
              size="lg"
            >
              Back
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
