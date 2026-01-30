import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type PackStatus = "not-started" | "active" | "paused" | "completed";

interface IntroSeriesCardProps {
  status: PackStatus;
  completedCount: number;
  totalCount: number;
  onClick: () => void;
}

const getStatusLabel = (status: PackStatus): string => {
  switch (status) {
    case "active": return "Active";
    case "paused": return "Paused";
    case "completed": return "Completed";
    default: return "Not Started";
  }
};

const getStatusBadgeClasses = (status: PackStatus): string => {
  switch (status) {
    case "active": return "bg-primary text-primary-foreground";
    case "paused": return "bg-muted-foreground/20 text-muted-foreground";
    case "completed": return "bg-success/20 text-success";
    default: return "bg-muted text-muted-foreground";
  }
};

export const IntroSeriesCard = ({
  status,
  completedCount,
  totalCount,
  onClick,
}: IntroSeriesCardProps) => {
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isActive = status === "active";
  const isCompleted = status === "completed";

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isActive && "border-primary border-2"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center text-2xl",
            isActive ? "bg-primary/20" : "bg-muted"
          )}>
            👋
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-foreground">One Hello Intro Series</h3>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
                getStatusBadgeClasses(status)
              )}>
                {isCompleted && <Check className="w-3 h-3" />}
                {getStatusLabel(status)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Perfect for beginners. Helping you turn faces into friends.
            </p>
            
            {/* Progress bar */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {completedCount}/{totalCount}
              </span>
            </div>
            
            {/* Free badge */}
            <div className="mt-2">
              <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                Free
              </span>
            </div>
          </div>
          
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};
