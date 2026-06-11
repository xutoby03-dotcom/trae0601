import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: 'sky' | 'orange' | 'emerald' | 'red' | 'purple';
  subtitle?: string;
}

const colorClasses = {
  sky: 'from-sky-500 to-cyan-500',
  orange: 'from-orange-500 to-amber-500',
  emerald: 'from-emerald-500 to-teal-500',
  red: 'from-red-500 to-rose-500',
  purple: 'from-purple-500 to-violet-500',
};

export default function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-5 text-white shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-white/70 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="p-2 bg-white/20 rounded-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}
