import { useState, useEffect, useCallback } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Instagram, Twitter, MessageCircle, Download, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  MilestoneType as ShareMilestoneType,
  generateShareCard,
  downloadShareImage,
  copyLink,
  shareNative,
  shareToTwitter,
} from '@/lib/shareCardGenerator';

interface ShareOptionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: ShareMilestoneType | null;
  username?: string;
  onShare?: (milestone: ShareMilestoneType, platform: string) => void;
}

export function ShareOptionsSheet({
  open,
  onOpenChange,
  milestone,
  username,
  onShare,
}: ShareOptionsSheetProps) {
  const [shareCardUrl, setShareCardUrl] = useState<string | null>(null);
  const [shareCardBlob, setShareCardBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate share card when sheet opens
  useEffect(() => {
    if (open && milestone && !shareCardBlob) {
      setIsGenerating(true);
      generateShareCard(milestone, username)
        .then((blob) => {
          setShareCardBlob(blob);
          setShareCardUrl(URL.createObjectURL(blob));
        })
        .catch(() => {
          toast.error('Failed to generate share card');
        })
        .finally(() => {
          setIsGenerating(false);
        });
    }
  }, [open, milestone, username, shareCardBlob]);

  // Cleanup URL on unmount or close
  useEffect(() => {
    return () => {
      if (shareCardUrl) {
        URL.revokeObjectURL(shareCardUrl);
      }
    };
  }, [shareCardUrl]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(() => {
      setShareCardUrl(null);
      setShareCardBlob(null);
    }, 300);
  }, [onOpenChange]);

  const handleInstagramShare = async () => {
    if (!shareCardBlob || !milestone) return;

    const shared = await shareNative(shareCardBlob, milestone);
    if (shared) {
      onShare?.(milestone, 'instagram');
      toast.success('Shared successfully!');
      handleClose();
    } else {
      // Fallback: download image
      await downloadShareImage(shareCardBlob, milestone);
      toast.success('Image downloaded! Open Instagram and upload to your story.');
      onShare?.(milestone, 'instagram');
    }
  };

  const handleTwitterShare = async () => {
    if (!shareCardBlob || !milestone) return;

    shareToTwitter(milestone);
    await downloadShareImage(shareCardBlob, milestone);
    toast.success('Image downloaded! Attach it to your tweet.');
    onShare?.(milestone, 'twitter');
  };

  const handleMessagesShare = async () => {
    if (!shareCardBlob || !milestone) return;

    const shared = await shareNative(shareCardBlob, milestone);
    if (shared) {
      onShare?.(milestone, 'messages');
      toast.success('Shared successfully!');
      handleClose();
    } else {
      await downloadShareImage(shareCardBlob, milestone);
      await copyLink();
      toast.success('Image downloaded and link copied!');
      onShare?.(milestone, 'messages');
    }
  };

  const handleSaveImage = async () => {
    if (!shareCardBlob || !milestone) return;

    await downloadShareImage(shareCardBlob, milestone);
    toast.success('Image saved to your device! 💾');
    onShare?.(milestone, 'save');
  };

  const handleCopyLink = async () => {
    await copyLink();
    toast.success('Link copied to clipboard! 🔗');
    if (milestone) onShare?.(milestone, 'copy');
  };

  if (!milestone) return null;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle>Share Your Achievement</SheetTitle>
        </SheetHeader>

        <div className="py-4">
          {/* Share card preview */}
          <div className="mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 p-3">
            {isGenerating ? (
              <div className="aspect-square flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : shareCardUrl ? (
              <img
                src={shareCardUrl}
                alt="Share card preview"
                className="w-full aspect-square object-contain rounded-lg"
              />
            ) : (
              <div className="aspect-square flex items-center justify-center text-muted-foreground">
                Generating preview...
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-3">Share to:</p>

          <div className="space-y-2 mb-4">
            <Button
              onClick={handleInstagramShare}
              variant="outline"
              className="w-full justify-start h-12"
              disabled={isGenerating}
            >
              <Instagram className="w-5 h-5 mr-3" />
              Instagram Story
            </Button>
            <Button
              onClick={handleTwitterShare}
              variant="outline"
              className="w-full justify-start h-12"
              disabled={isGenerating}
            >
              <Twitter className="w-5 h-5 mr-3" />
              Twitter / X
            </Button>
            <Button
              onClick={handleMessagesShare}
              variant="outline"
              className="w-full justify-start h-12"
              disabled={isGenerating}
            >
              <MessageCircle className="w-5 h-5 mr-3" />
              Messages
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-3">Or:</p>

          <div className="space-y-2">
            <Button
              onClick={handleSaveImage}
              variant="outline"
              className="w-full justify-start h-12"
              disabled={isGenerating}
            >
              <Download className="w-5 h-5 mr-3" />
              Save Image to Photos
            </Button>
            <Button 
              onClick={handleCopyLink} 
              variant="outline" 
              className="w-full justify-start h-12"
            >
              <Link2 className="w-5 h-5 mr-3" />
              Copy Link
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
