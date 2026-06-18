import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'orange' | 'red' | 'warning' | 'primary' | 'blue';
  description?: string;
  onClick?: () => void;
}

const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
  orange: {
    bg: 'bg-gradient-to-br from-warning-50 to-warning-100',
    icon: 'bg-gradient-to-br from-warning-400 to-warning-500',
    border: 'border-warning-200',
  },
  red: {
    bg: 'bg-gradient-to-br from-danger-50 to-danger-100',
    icon: 'bg-gradient-to-br from-danger-400 to-danger-500',
    border: 'border-danger-200',
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
    icon: 'bg-gradient-to-br from-amber-400 to-amber-500',
    border: 'border-amber-200',
  },
  primary: {
    bg: 'bg-gradient-to-br from-primary-50 to-primary-100',
    icon: 'bg-gradient-to-br from-primary-400 to-primary-500',
    border: 'border-primary-200',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    icon: 'bg-gradient-to-br from-blue-400 to-blue-500',
    border: 'border-blue-200',
  },
};

const textColorClasses: Record<string, string> = {
  orange: 'text-warning-700',
  red: 'text-danger-700',
  warning: 'text-amber-700',
  primary: 'text-primary-700',
  blue: 'text-blue-700',
};

export default function StatCard({ title, value, icon: Icon, color, description, onClick }: StatCardProps) {
  const classes = colorClasses[color];
  
  return (
    <div
      onClick={onClick}
      className={`${classes.bg} rounded-2xl p-5 border ${classes.border} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-slide-up`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${textColorClasses[color]} mb-1`}>{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        <div className={`${classes.icon} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
