import { cn } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: number;
  strokeWidth?: number;
}

export default function ScoreGauge({
  score,
  label,
  size = 180,
  strokeWidth = 14,
}: ScoreGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  const getColorClass = () => {
    if (clampedScore >= 80) return 'text-jade-500';
    if (clampedScore >= 60) return 'text-museum-500';
    if (clampedScore >= 40) return 'text-coral-400';
    return 'text-coral-500';
  };

  const getStrokeColor = () => {
    if (clampedScore >= 80) return '#2d7a4f';
    if (clampedScore >= 60) return '#c9a962';
    if (clampedScore >= 40) return '#e8957d';
    return '#e07b5f';
  };

  const colorClass = getColorClass();
  const strokeColor = getStrokeColor();

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e0d5c2"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-5xl font-bold font-serif', colorClass)}>
            {Math.round(clampedScore)}
          </span>
          <span className="text-deep-400 text-sm mt-1">分</span>
        </div>
      </div>
      <span className="mt-3 text-deep-600 font-medium">{label}</span>
    </div>
  );
}
