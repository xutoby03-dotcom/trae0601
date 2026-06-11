import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
  delay?: number;
}

export default function StatCard({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  color = 'primary',
  className = '',
  delay = 0,
}: StatCardProps) {
  const colorClasses = {
    primary: 'text-primary-500 bg-primary-50',
    secondary: 'text-secondary-500 bg-secondary-50',
    success: 'text-success-500 bg-success-50',
    warning: 'text-warning-500 bg-warning-50',
    danger: 'text-danger-500 bg-danger-50',
  };
  
  const trendColors = {
    up: 'text-success-500',
    down: 'text-danger-500',
    neutral: 'text-gray-500',
  };
  
  return (
    <div
      className={`
        bg-white rounded-2xl p-5 shadow-sm border border-gray-100
        hover:shadow-md transition-all duration-300
        opacity-0 animate-fade-in-up
        ${className}
      `}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-800">{value}</span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
          {trend && trendValue && (
            <p className={`text-xs mt-1 ${trendColors[trend]}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
