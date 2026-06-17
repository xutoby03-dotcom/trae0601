import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  delay?: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, icon, color, delay = 0, trend }: StatCardProps) {
  return (
    <div 
      className="card p-6 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-bread-500 font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 font-display" style={{ color }}>
            {value}
          </p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
