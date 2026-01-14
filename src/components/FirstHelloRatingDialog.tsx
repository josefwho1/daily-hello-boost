import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import remiCongrats1 from "@/assets/remi-congrats-1.webp";

interface FirstHelloRatingDialogProps {
  open: boolean;
  onRate: (rating: 'loved' | 'easy' | 'nogood') => void;
}

export const FirstHelloRatingDialog = ({
  open,
  onRate,
}: FirstHelloRatingDialogProps) => {
  return (
    <Dialog open={open}>
      <DialogContent 
        className="sm:max-w-md" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={remiCongrats1} 
              alt="Remi celebrating" 
              className="w-40 h-auto max-h-40 object-contain" 
            />
          </div>
          <DialogTitle className="text-2xl text-center">
            Congratulations!
          </DialogTitle>
          <p className="text-sm font-bold text-primary tracking-wide mt-2">
            FIRST HELLO COMPLETE
          </p>
        </DialogHeader>

        <div className="text-center py-4">
          <p className="text-lg text-foreground font-medium">How was that?</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => onRate('loved')} 
            className="w-full" 
            size="lg"
            variant="default"
          >
            😍 Loved it
          </Button>
          <Button 
            onClick={() => onRate('easy')} 
            className="w-full" 
            size="lg"
            variant="outline"
          >
            💪 Easy money
          </Button>
          <Button 
            onClick={() => onRate('nogood')} 
            className="w-full" 
            size="lg"
            variant="outline"
          >
            😬 No good
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
