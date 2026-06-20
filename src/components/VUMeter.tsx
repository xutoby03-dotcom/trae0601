import { memo } from 'react';

interface VUMeterProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

const BAR_COUNT = 12;

export const VUMeter = memo(function VUMeter({ level, size = 'md', showLabels = false }: VUMeterProps) {
  const activeBars = Math.floor(level * BAR_COUNT);

  const sizes = {
    sm: { bar: 'h-8 w-0.5', gap: 'gap-px', container: 'h-8' },
    md: { bar: 'h-12 w-1', gap: 'gap-0.5', container: 'h-12' },
    lg: { bar: 'h-16 w-1.5', gap: 'gap-1', container: 'h-16' },
  };

  return (
    <div className="flex flex-col items-center">
      {showLabels && (
        <div className="flex justify-between w-full mb-1 px-0.5">
          <span className="text-[10px] text-studio-textDim">-20</span>
          <span className="text-[10px] text-studio-textDim">0</span>
          <span className="text-[10px] text-studio-textDim">+6</span>
        </div>
      )}
      <div className={`flex items-end ${sizes[size].gap} ${sizes[size].container}`}>
        {Array.from({ length: BAR_COUNT }).map((_, i) => {
          const isActive = i < activeBars;
          const isWarning = i >= BAR_COUNT - 3;
          const isDanger = i >= BAR_COUNT - 1;

          let colorClass = 'bg-green-500';
          if (isDanger && isActive) colorClass = 'bg-red-500';
          else if (isWarning && isActive) colorClass = 'bg-yellow-500';
          else if (isActive) colorClass = 'bg-emerald-400';
          else colorClass = 'bg-studio-border';

          return (
            <div
              key={i}
              className={`${sizes[size].bar} rounded-sm transition-all duration-75 ${colorClass}`}
              style={{
                opacity: isActive ? 1 : 0.3,
                transform: isActive ? 'scaleY(1)' : 'scaleY(0.2)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
});
