import { cn } from '@/utils';
import type { HTMLAttributes, ReactNode } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  rightAction?: ReactNode;
  padded?: boolean;
}

export default function Card({
  className,
  children,
  title,
  subtitle,
  rightAction,
  padded = true,
  ...props
}: Props) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden',
        'hover:shadow-md transition-shadow duration-300',
        className,
      )}
      {...props}
    >
      {(title || rightAction) && (
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100">
          <div className="min-w-0">
            {title && (
              <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {rightAction}
        </div>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </div>
  );
}
