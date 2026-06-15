import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'matcha' | 'amber' | 'coral' | 'forest' | 'gray';
}

const colorClasses = {
  matcha: 'from-matcha-50 to-matcha-100 text-matcha-700',
  amber: 'from-amber-50 to-amber-100 text-amber-700',
  coral: 'from-coral-50 to-coral-100 text-coral-700',
  forest: 'from-forest-50 to-forest-100 text-forest-700',
  gray: 'from-gray-50 to-gray-100 text-gray-700',
};

const iconBgClasses = {
  matcha: 'bg-matcha-100 text-matcha-600',
  amber: 'bg-amber-100 text-amber-600',
  coral: 'bg-coral-100 text-coral-600',
  forest: 'bg-forest-100 text-forest-600',
  gray: 'bg-gray-100 text-gray-600',
};

export default function StatCard({ title, value, icon, subtitle, trend, color = 'matcha' }: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-5 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="text-2xl font-bold mt-1 font-serif">{value}</p>
          {subtitle && (
            <p className="text-xs mt-1 opacity-60">
              {trend === 'up' && <span className="text-forest-600">↑ </span>}
              {trend === 'down' && <span className="text-coral-600">↓ </span>}
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl ${iconBgClasses[color]} flex items-center justify-center`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
