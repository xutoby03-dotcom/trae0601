import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: 'primary' | 'gold' | 'green' | 'blue' | 'orange';
  delay?: number;
}

const colorMap = {
  primary: 'from-primary-500 to-primary-400 bg-primary-50 text-primary-600',
  gold: 'from-gold-500 to-gold-400 bg-gold-50 text-gold-600',
  green: 'from-emerald-500 to-emerald-400 bg-emerald-50 text-emerald-600',
  blue: 'from-blue-500 to-blue-400 bg-blue-50 text-blue-600',
  orange: 'from-orange-500 to-orange-400 bg-orange-50 text-orange-600',
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'primary',
  delay = 0,
}: StatCardProps) {
  const colors = colorMap[color];
  const [bgFrom, bgTo, bgSoft, textColor] = colors.split(' ');

  return (
    <div
      className="card card-hover p-6 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-display font-bold text-gray-800 mt-2">
            {value}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1.5 mt-3">
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend >= 0 ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {trend >= 0 ? '+' : ''}
                {trend}%
              </span>
              {trendLabel && (
                <span className="text-xs text-gray-400">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bgFrom} ${bgTo} flex items-center justify-center shadow-soft`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className={`mt-4 h-1.5 rounded-full ${bgSoft} overflow-hidden`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${bgFrom} ${bgTo}`}
          style={{ width: `${Math.min(100, Math.max(10, Math.abs(Number(value) || 30)))}%` }}
        />
      </div>
    </div>
  );
}
