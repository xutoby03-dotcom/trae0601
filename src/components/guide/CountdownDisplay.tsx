import { cn } from '@/lib/utils';
import { formatDuration } from '@/utils/time';

interface CountdownDisplayProps {
  remainingSeconds: number;
  totalSeconds: number;
}

export default function CountdownDisplay({
  remainingSeconds,
  totalSeconds,
}: CountdownDisplayProps) {
  const safeRemaining = Math.max(0, remainingSeconds);
  const ratio = totalSeconds > 0 ? Math.min(1, safeRemaining / totalSeconds) : 0;

  let colorClass = 'text-jade-500';
  let strokeColor = '#2d7a4f';
  let pulseClass = '';

  if (ratio <= 0.1) {
    colorClass = 'text-red-500';
    strokeColor = '#ef4444';
    pulseClass = 'animate-pulse';
  } else if (ratio <= 0.25) {
    colorClass = 'text-coral-500';
    strokeColor = '#e07b5f';
  } else if (ratio <= 0.5) {
    colorClass = 'text-yellow-500';
    strokeColor = '#eab308';
  }

  const size = 280;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-museum-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            'text-7xl font-bold font-mono tracking-tight',
            colorClass,
            pulseClass
          )}
        >
          {formatDuration(safeRemaining)}
        </span>
        <span className="mt-2 text-sm text-deep-400">剩余时间</span>
      </div>
    </div>
  );
}
