import { cn } from "@/lib/utils";

interface ProgressRingProps {
  progress: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const ProgressRing = ({ 
  progress, 
  max, 
  size = 120, 
  strokeWidth = 12,
  className 
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(progress / max, 1);
  const offset = circumference - percentage * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{progress}</span>
        <span className="text-sm text-muted-foreground">/ {max}</span>
      </div>
    </div>
  );
};
