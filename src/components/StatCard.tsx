import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'amber' | 'red' | 'emerald';
  subtitle?: string;
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100 text-blue-600',
    value: 'text-blue-700',
  },
  amber: {
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-100 text-amber-600',
    value: 'text-amber-700',
  },
  red: {
    bg: 'bg-red-50',
    iconBg: 'bg-red-100 text-red-600',
    value: 'text-red-700',
  },
  emerald: {
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100 text-emerald-600',
    value: 'text-emerald-700',
  },
};

export default function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`card p-5 ${c.bg} border-none`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-600 mb-1">{title}</div>
          <div className={`text-3xl font-bold ${c.value}`}>{value}</div>
          {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.iconBg}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
