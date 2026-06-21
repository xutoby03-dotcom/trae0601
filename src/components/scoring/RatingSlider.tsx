import { useState } from 'react';
import { cn } from '@/lib/utils';

interface RatingSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function RatingSlider({
  label,
  value,
  onChange,
  color,
  description,
  min = 0,
  max = 10,
  step = 0.5,
}: RatingSliderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(Math.round(newValue / step) * step);
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return '极佳';
    if (score >= 7.5) return '优秀';
    if (score >= 6) return '良好';
    if (score >= 4.5) return '一般';
    if (score >= 3) return '较弱';
    return '很弱';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-semibold text-coffee-800">{label}</label>
          {description && (
            <p className="text-xs text-coffee-400">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'text-2xl font-bold font-serif transition-all duration-200',
              isDragging && 'scale-110'
            )}
            style={{ color }}
          >
            {value.toFixed(1)}
          </span>
          <span className="text-xs text-coffee-500 font-medium">
            {getScoreLabel(value)}
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="h-3 bg-coffee-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-150 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
              boxShadow: isDragging ? `0 0 10px ${color}40` : 'none',
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full shadow-lg pointer-events-none transition-transform duration-150"
          style={{
            left: `calc(${percentage}% - 12px)`,
            backgroundColor: color,
            transform: `translateY(-50%) ${isDragging ? 'scale(1.2)' : 'scale(1)'}`,
          }}
        />
      </div>

      <div className="flex justify-between text-xs text-coffee-400">
        <span>{min}</span>
        <span>{(max / 2).toFixed(1)}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
