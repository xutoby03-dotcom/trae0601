import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import clsx from 'clsx';

interface StatCardProps {
  label: string;
  value: number | string;
  total?: number;
  gradient: string;
  icon: ReactNode;
  trend?: { dir: 'up' | 'down' | 'flat'; text: string };
}

export default function StatCard({ label, value, total, gradient, icon, trend }: StatCardProps) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl p-5 text-white card-hover',
        gradient
      )}
    >
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm/5 text-white/80">{label}</div>
          <div className="mt-3 flex items-baseline gap-2">
            <div className="font-serif-sc text-4xl font-bold tracking-tight">{value}</div>
            {total !== undefined && (
              <div className="text-sm text-white/60">/ {total}</div>
            )}
          </div>
          {trend && (
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur">
              {trend.dir === 'up' && <ArrowUpRight className="h-3.5 w-3.5" />}
              {trend.dir === 'down' && <ArrowDownRight className="h-3.5 w-3.5" />}
              {trend.dir === 'flat' && <Minus className="h-3.5 w-3.5" />}
              <span>{trend.text}</span>
            </div>
          )}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          {icon}
        </div>
      </div>
    </div>
  );
}
