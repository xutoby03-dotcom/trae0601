import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isUp: boolean;
  };
  color: 'rose' | 'forest' | 'gold' | 'blue';
  onClick?: () => void;
  clickableHint?: string;
}

const colorClasses = {
  rose: 'from-rose-400 to-rose-500',
  forest: 'from-forest-500 to-forest-600',
  gold: 'from-gold-400 to-gold-500',
  blue: 'from-blue-400 to-blue-500',
};

export default function StatCard({ title, value, subtitle, icon, trend, color, onClick, clickableHint }: StatCardProps) {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 shadow-soft transition-all duration-300 ${
        isClickable
          ? 'cursor-pointer hover:shadow-hover hover:-translate-y-0.5'
          : 'hover:shadow-hover'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            trend.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {trend.isUp ? '↑' : '↓'}
            {trend.value}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold font-serif text-forest-700 mb-1">{value}</p>
          <p className="text-sm text-forest-500">{title}</p>
          {subtitle && <p className="text-xs text-forest-400 mt-2">{subtitle}</p>}
        </div>
        {isClickable && (
          <div className="flex items-center gap-1 text-rose-400 text-xs font-medium group">
            <span>{clickableHint || '查看详情'}</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        )}
      </div>
    </div>
  );
}
