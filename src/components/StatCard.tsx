import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: 'orange' | 'teal' | 'blue' | 'red';
  subtitle?: string;
}

const colorClasses = {
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  teal: 'bg-teal-50 text-teal-600 border-teal-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  red: 'bg-red-50 text-red-600 border-red-200'
};

const iconBgClasses = {
  orange: 'bg-orange-100',
  teal: 'bg-teal-100',
  blue: 'bg-blue-100',
  red: 'bg-red-100'
};

export const StatCard = ({ title, value, icon, color, subtitle }: StatCardProps) => {
  return (
    <div className={`rounded-xl p-5 border ${colorClasses[color]} transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtitle && <p className="text-xs mt-1 opacity-70">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
