import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  color: 'green' | 'orange' | 'red' | 'blue' | 'slate';
  delay?: number;
}

const colorMap = {
  green: 'from-emerald-500 to-green-600',
  orange: 'from-orange-400 to-amber-500',
  red: 'from-rose-500 to-red-600',
  blue: 'from-sky-500 to-blue-600',
  slate: 'from-slate-500 to-slate-700',
};

export function StatCard({ title, value, icon: Icon, description, color, delay = 0 }: StatCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-20 ${colorMap[color]}`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md ${colorMap[color]}`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
