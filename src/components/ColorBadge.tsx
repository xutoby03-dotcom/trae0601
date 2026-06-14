import { COLOR_OPTIONS } from '@/types';
import { cn } from '@/utils';

interface ColorBadgeProps {
  color: string;
  colorName?: string;
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export default function ColorBadge({
  color,
  colorName,
  showName = true,
  size = 'md',
}: ColorBadgeProps) {
  const option = COLOR_OPTIONS.find((c) => c.color === color);
  const hex = option?.hex || '#6b7280';
  const name = colorName || option?.colorName || color;

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'rounded-full border-2 border-white shadow-md ring-2 ring-offset-1 ring-slate-200/50',
          sizeClasses[size]
        )}
        style={{ backgroundColor: hex }}
      />
      {showName && <span className="text-sm font-medium text-slate-700">{name}</span>}
    </div>
  );
}
