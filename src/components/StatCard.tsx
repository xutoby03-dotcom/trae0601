import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtext?: string;
  color?: 'green' | 'red' | 'orange' | 'blue' | 'gray';
  onClick?: () => void;
}

const colorClasses = {
  green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  gray: 'bg-gray-50 text-gray-600 border-gray-100',
};

const iconBgClasses = {
  green: 'bg-emerald-100 text-emerald-600',
  red: 'bg-red-100 text-red-600',
  orange: 'bg-orange-100 text-orange-600',
  blue: 'bg-blue-100 text-blue-600',
  gray: 'bg-gray-100 text-gray-600',
};

export default function StatCard({
  title,
  value,
  icon,
  subtext,
  color = 'gray',
  onClick,
}: StatCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 border ${colorClasses[color]} ${
        onClick ? 'cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {subtext && <p className="text-xs mt-1 opacity-70">{subtext}</p>}
        </div>
        {icon && (
          <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
