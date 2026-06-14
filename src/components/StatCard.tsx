import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  color?: 'orange' | 'blue' | 'green' | 'purple';
  size?: 'normal' | 'small';
}

const COLOR_MAP = {
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-500',
    iconBg: 'bg-orange-100',
    value: 'text-orange-600',
    border: 'border-orange-100',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-500',
    iconBg: 'bg-blue-100',
    value: 'text-blue-600',
    border: 'border-blue-100',
  },
  green: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-500',
    iconBg: 'bg-emerald-100',
    value: 'text-emerald-600',
    border: 'border-emerald-100',
  },
  purple: {
    bg: 'bg-violet-50',
    icon: 'text-violet-500',
    iconBg: 'bg-violet-100',
    value: 'text-violet-600',
    border: 'border-violet-100',
  },
};

export default function StatCard({
  title,
  value,
  description,
  icon,
  color = 'orange',
  size = 'normal',
}: StatCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div
      className={twMerge(
        'rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
        c.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p
            className={twMerge(
              'text-gray-500 font-medium',
              size === 'small' ? 'text-xs' : 'text-sm'
            )}
          >
            {title}
          </p>
          <p
            className={twMerge(
              'font-bold mt-2 truncate',
              c.value,
              size === 'small' ? 'text-2xl' : 'text-3xl'
            )}
          >
            {value}
          </p>
          {description && (
            <p
              className={twMerge(
                'text-gray-400 mt-1 truncate',
                size === 'small' ? 'text-xs' : 'text-sm'
              )}
            >
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={twMerge(
              'flex items-center justify-center rounded-lg flex-shrink-0 ml-3',
              c.iconBg,
              c.icon,
              size === 'small' ? 'w-10 h-10' : 'w-12 h-12'
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
