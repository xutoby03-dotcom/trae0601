import { useMemo } from 'react';

interface DrynessProgressProps {
  value: number;
  isCompleted: boolean;
}

export default function DrynessProgress({ value, isCompleted }: DrynessProgressProps) {
  const gradientStyle = useMemo(() => {
    if (isCompleted) {
      return 'linear-gradient(90deg, #B8860B, #DAA520, #FFD700)';
    }
    if (value >= 80) {
      return 'linear-gradient(90deg, #4A7237, #6B8E4E, #A5C897)';
    }
    if (value >= 50) {
      return 'linear-gradient(90deg, #6B8E4E, #A5C897, #C9DEC0)';
    }
    return 'linear-gradient(90deg, #A5C897, #C9DEC0, #E8F0E3)';
  }, [value, isCompleted]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-semibold text-gray-600">干燥进度</span>
        <span
          className={`text-sm font-bold font-serif ${
            isCompleted ? 'text-warning-gold' : 'text-forest-600'
          }`}
        >
          {value}%
        </span>
      </div>
      <div className="h-2.5 bg-paper-200 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
          style={{
            width: `${value}%`,
            background: gradientStyle,
          }}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s linear infinite',
            }}
          />
        </div>
      </div>
    </div>
  );
}
