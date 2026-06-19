import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

export type StatusLevel = 'success' | 'warning' | 'danger';

export interface InspectionOption<T extends string = string> {
  value: T;
  label: string;
  level: StatusLevel;
}

export interface InspectionItemProps<T extends string = string> {
  title: string;
  description: string;
  icon: LucideIcon;
  options: InspectionOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  required?: boolean;
}

const levelCardStyles: Record<StatusLevel, { border: string; background: string }> = {
  success: {
    border: 'border-success-500/50',
    background: 'bg-success-50/30',
  },
  warning: {
    border: 'border-warning-500/50',
    background: 'bg-warning-50/30',
  },
  danger: {
    border: 'border-danger-500 ring-2 ring-danger-500/20 animate-pulse-slow',
    background: 'bg-danger-50/50',
  },
};

const levelBtnStyles: Record<StatusLevel, { base: string; active: string }> = {
  success: {
    base: 'border-success-200 text-success-600 hover:border-success-400 hover:bg-success-50',
    active: 'bg-success-500 text-white border-success-500 hover:bg-success-600 hover:border-success-600 shadow-sm shadow-success-500/30',
  },
  warning: {
    base: 'border-warning-200 text-warning-600 hover:border-warning-400 hover:bg-warning-50',
    active: 'bg-warning-500 text-white border-warning-500 hover:bg-warning-600 hover:border-warning-600 shadow-sm shadow-warning-500/30',
  },
  danger: {
    base: 'border-danger-200 text-danger-600 hover:border-danger-400 hover:bg-danger-50',
    active: 'bg-danger-500 text-white border-danger-500 hover:bg-danger-600 hover:border-danger-600 shadow-sm shadow-danger-500/30',
  },
};

export default function InspectionItem<T extends string = string>({
  title,
  description,
  icon: Icon,
  options,
  value,
  onChange,
  required = false,
}: InspectionItemProps<T>) {
  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const cardStyles = selectedOption
    ? levelCardStyles[selectedOption.level]
    : { border: 'border-slate-200', background: 'bg-white' };

  const iconColor = selectedOption
    ? {
        success: 'text-success-500',
        warning: 'text-warning-500',
        danger: 'text-danger-500',
      }[selectedOption.level]
    : 'text-brand-500';

  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-5 transition-all duration-300',
        cardStyles.border,
        cardStyles.background
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            selectedOption?.level === 'success' && 'bg-success-100',
            selectedOption?.level === 'warning' && 'bg-warning-100',
            selectedOption?.level === 'danger' && 'bg-danger-100',
            !selectedOption && 'bg-brand-100'
          )}
        >
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            {required && <span className="text-danger-500 font-medium">*</span>}
          </div>
          <p className="mt-1 text-sm text-slate-500 leading-relaxed">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const isActive = value === option.value;
          const btnStyle = levelBtnStyles[option.level];
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'rounded-xl border py-2.5 px-2 text-sm font-medium transition-all duration-200',
                'active:scale-[0.97]',
                isActive ? btnStyle.active : btnStyle.base
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
