import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color: 'navy' | 'gold' | 'red' | 'green';
  delay?: number;
}

const colorMap = {
  navy: { bg: 'bg-navy-50', text: 'text-navy-700', iconBg: 'bg-navy-800', iconText: 'text-white' },
  gold: { bg: 'bg-gold-50', text: 'text-gold-700', iconBg: 'bg-gold-500', iconText: 'text-white' },
  red: { bg: 'bg-red-50', text: 'text-red-700', iconBg: 'bg-red-500', iconText: 'text-white' },
  green: { bg: 'bg-green-50', text: 'text-green-700', iconBg: 'bg-green-600', iconText: 'text-white' },
};

export function StatCard({ title, value, icon: Icon, trend, color, delay = 0 }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div
      className={clsx('card p-5 animate-fade-in-up', c.bg)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={clsx('text-sm font-medium mb-1', c.text)}>{title}</p>
          <p className="text-3xl font-serif font-semibold text-navy-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2 text-xs">
              {trend.value > 0 ? (
                <TrendingUp size={12} className="text-green-600" />
              ) : trend.value < 0 ? (
                <TrendingDown size={12} className="text-red-600" />
              ) : (
                <Minus size={12} className="text-gray-400" />
              )}
              <span className={trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-gray-500'}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-gray-500 ml-1">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={clsx('w-11 h-11 rounded-lg flex items-center justify-center', c.iconBg, c.iconText)}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
