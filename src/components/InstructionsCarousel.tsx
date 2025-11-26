import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import howItWorks from '@/assets/instructions/how-it-works.png';
import dailyChallenge from '@/assets/instructions/daily-challenge.png';
import interaction from '@/assets/instructions/interaction.png';
import logResults from '@/assets/instructions/log-results.png';
import earnStreaks from '@/assets/instructions/earn-streaks.png';
import benefits from '@/assets/instructions/benefits.png';
import oneHello from '@/assets/instructions/one-hello.png';

const instructionImages = [
  { src: howItWorks, alt: 'How it works' },
  { src: dailyChallenge, alt: 'Daily challenges' },
  { src: interaction, alt: 'Interact with strangers' },
  { src: logResults, alt: 'Log your results' },
  { src: earnStreaks, alt: 'Earn streaks' },
  { src: benefits, alt: 'Benefits' },
  { src: oneHello, alt: 'One Hello' },
];

export const InstructionsCarousel = () => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <Card className="border-2 border-primary/20 overflow-hidden animate-fade-in">
      <div 
        className="bg-primary/10 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-primary/15 transition-colors"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <h3 className="text-lg font-bold text-foreground">How It Works</h3>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0"
        >
          {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>
      
      {!isMinimized && (
        <CardContent className="p-4 animate-fade-in">
          <Carousel className="w-full">
            <CarouselContent>
              {instructionImages.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <img 
                      src={image.src} 
                      alt={image.alt}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>
          <div className="text-center mt-3 text-sm text-muted-foreground">
            Swipe or use arrows to navigate
          </div>
        </CardContent>
      )}
    </Card>
  );
};
