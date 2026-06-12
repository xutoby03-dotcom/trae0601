import { FC, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
  accent?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const StatCard: FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  accent = 'primary',
  className,
}) => {
  const accentColors = {
    primary: 'text-[#4A3728]',
    success: 'text-[#5A8A3B]',
    warning: 'text-[#C28B3B]',
    danger: 'text-[#C2563B]',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-[#E8DFD3] p-5 transition-all duration-300 hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-[#6B5748] font-medium">{title}</p>
        {icon && (
          <div className="p-2 rounded-xl bg-[#F5EFE6] text-[#6B5748]">
            {icon}
          </div>
        )}
      </div>
      <p
        className={cn(
          'text-3xl font-bold mb-1',
          accentColors[accent],
        )}
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {value}
      </p>
      {subtitle && <p className="text-xs text-[#9B8B7D]">{subtitle}</p>}
    </div>
  );
};

export default StatCard;
