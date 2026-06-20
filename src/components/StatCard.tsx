import { type LucideIcon } from 'lucide-react';
import { classNames } from '@/utils/helpers';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'sky' | 'amber' | 'red' | 'emerald' | 'violet';
  subtitle?: string;
}

const colorStyles: Record<string, string> = {
  sky: 'from-sky-500/20 to-cyan-500/5 border-sky-500/30 text-sky-300',
  amber: 'from-amber-500/20 to-orange-500/5 border-amber-500/30 text-amber-300',
  red: 'from-red-500/20 to-rose-500/5 border-red-500/30 text-red-300',
  emerald: 'from-emerald-500/20 to-teal-500/5 border-emerald-500/30 text-emerald-300',
  violet: 'from-violet-500/20 to-purple-500/5 border-violet-500/30 text-violet-300',
};

const iconBgStyles: Record<string, string> = {
  sky: 'bg-sky-500/20 text-sky-400',
  amber: 'bg-amber-500/20 text-amber-400',
  red: 'bg-red-500/20 text-red-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  violet: 'bg-violet-500/20 text-violet-400',
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendUp,
  color = 'sky',
  subtitle,
}: StatCardProps) {
  return (
    <div
      className={classNames(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl',
        colorStyles[color]
      )}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/5 blur-2xl" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-slate-400 font-medium">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">
              {value}
            </span>
            {trend && (
              <span
                className={classNames(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  trendUp
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                )}
              >
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>

        <div
          className={classNames(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            iconBgStyles[color]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
