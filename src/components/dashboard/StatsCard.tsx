import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  iconBg: string;
  iconColor: string;
  subtitle?: string;
}

export const StatsCard = ({
  title,
  value,
  icon: Icon,
  gradientFrom,
  gradientTo,
  iconBg,
  iconColor,
  subtitle,
}: StatsCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'number' ? value : 0;
  const isNumeric = typeof value === 'number';

  useEffect(() => {
    if (!isNumeric) return;
    const duration = 800;
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + (numericValue - startValue) * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [numericValue, isNumeric]);

  return (
    <div className="card overflow-hidden animate-slide-up">
      <div
        className={`h-1.5 bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
      />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-neutral-800 font-mono">
              {isNumeric ? displayValue : value}
            </p>
            {subtitle && (
              <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}
          >
            <Icon size={24} className={iconColor} />
          </div>
        </div>
      </div>
    </div>
  );
};
