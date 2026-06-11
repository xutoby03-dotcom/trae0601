import { cn } from '@/lib/utils';

interface RatingSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  colorFrom?: string;
  colorTo?: string;
  description?: string;
}

export function RatingSlider({
  label,
  value,
  onChange,
  min = 1,
  max = 5,
  colorFrom = 'from-blue-300',
  colorTo = 'to-primary-500',
  description,
}: RatingSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const newValue = Math.round(min + percent * (max - min));
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-brown-800">{label}</span>
        <span className="text-sm font-bold text-primary-600">{value}分</span>
      </div>
      {description && (
        <p className="text-xs text-brown-500">{description}</p>
      )}
      <div
        className="relative h-3 bg-brown-100 rounded-full cursor-pointer group"
        onClick={handleClick}
      >
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-200',
            colorFrom,
            colorTo
          )}
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-md border-2 border-primary-500 transition-all duration-200 group-hover:scale-110"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-brown-400">
        <span>低</span>
        <span>适中</span>
        <span>高</span>
      </div>
    </div>
  );
}
