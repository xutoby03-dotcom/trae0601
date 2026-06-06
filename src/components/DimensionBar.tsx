import { useEffect, useState } from 'react';

interface DimensionBarProps {
  labelLeft: string;
  labelRight: string;
  percentage: number;
  color: string;
  delay?: number;
}

export default function DimensionBar({
  labelLeft,
  labelRight,
  percentage,
  color,
  delay = 0,
}: DimensionBarProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, delay);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-white/70 text-sm font-medium">
          {labelLeft}
        </span>
        <span className="text-white/90 font-bold" style={{ color }}>
          {animatedPercentage}%
        </span>
        <span className="text-white/70 text-sm font-medium">
          {labelRight}
        </span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${animatedPercentage}%`,
            background: `linear-gradient(90deg, ${color}, ${color}aa)`,
            boxShadow: `0 0 10px ${color}60`,
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-white/50 text-xs">
          {labelLeft.charAt(0)}
        </span>
        <span className="text-white/50 text-xs">
          {labelRight.charAt(0)}
        </span>
      </div>
    </div>
  );
}
