import { cn } from '../lib/utils';

interface StatusBadgeProps {
  status: 'normal' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig = {
    normal: {
      label: '正常',
      className: 'bg-green-100 text-green-700 border-green-200',
    },
    warning: {
      label: '注意',
      className: 'bg-amber-100 text-amber-700 border-amber-200',
    },
    danger: {
      label: '告警',
      className: 'bg-red-100 text-red-700 border-red-200',
    },
  };

  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        sizeClass,
        config.className
      )}
    >
      <span
        className={cn(
          'rounded-full',
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
          status === 'normal' && 'bg-green-500',
          status === 'warning' && 'bg-amber-500',
          status === 'danger' && 'bg-red-500 animate-pulse'
        )}
      ></span>
      {config.label}
    </span>
  );
}

interface TasteBadgeProps {
  taste: 'light' | 'salty' | 'weak' | 'normal';
  size?: 'sm' | 'md';
}

export function TasteBadge({ taste, size = 'md' }: TasteBadgeProps) {
  const tasteConfig = {
    light: { label: '偏淡', className: 'bg-sky-100 text-sky-700' },
    salty: { label: '偏咸', className: 'bg-orange-100 text-orange-700' },
    weak: { label: '香味弱', className: 'bg-violet-100 text-violet-700' },
    normal: { label: '正常', className: 'bg-green-100 text-green-700' },
  };

  const config = tasteConfig[taste];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span className={cn('font-medium rounded-full', sizeClass, config.className)}>
      {config.label}
    </span>
  );
}

interface LevelBadgeProps {
  level: 'low' | 'normal' | 'high' | 'light' | 'dark';
  type: 'salinity' | 'color';
}

export function LevelBadge({ level, type }: LevelBadgeProps) {
  const configs = {
    salinity: {
      low: { label: '低盐', className: 'bg-sky-100 text-sky-700' },
      normal: { label: '正常', className: 'bg-green-100 text-green-700' },
      high: { label: '高盐', className: 'bg-orange-100 text-orange-700' },
    },
    color: {
      light: { label: '浅色', className: 'bg-amber-100 text-amber-700' },
      normal: { label: '正常', className: 'bg-green-100 text-green-700' },
      dark: { label: '深色', className: 'bg-braised-red-100 text-braised-red-700' },
    },
  };

  const config = configs[type][level as keyof typeof configs[typeof type]];

  return (
    <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', config.className)}>
      {config.label}
    </span>
  );
}
