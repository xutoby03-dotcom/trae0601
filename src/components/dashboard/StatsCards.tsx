import { Calendar, CheckCircle2, Clock, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatsCardData {
  label: string;
  value: number;
  icon: 'meetings' | 'completed' | 'inProgress' | 'overdue';
  trend?: number;
  trendLabel?: string;
  color?: 'primary' | 'success' | 'info' | 'danger';
}

const iconMap = {
  meetings: Calendar,
  completed: CheckCircle2,
  inProgress: Clock,
  overdue: AlertTriangle,
};

const colorMap = {
  primary: {
    bg: 'bg-primary-50',
    icon: 'bg-primary-100 text-primary-600',
    value: 'text-primary-700',
  },
  success: {
    bg: 'bg-success-50',
    icon: 'bg-success-100 text-success-600',
    value: 'text-success-700',
  },
  info: {
    bg: 'bg-info-50',
    icon: 'bg-info-100 text-info-600',
    value: 'text-info-700',
  },
  danger: {
    bg: 'bg-danger-50',
    icon: 'bg-danger-100 text-danger-600',
    value: 'text-danger-700',
  },
};

interface StatsCardProps {
  data: StatsCardData;
  className?: string;
}

function StatsCard({ data, className }: StatsCardProps) {
  const Icon = iconMap[data.icon];
  const color = colorMap[data.color || 'primary'];

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-card border border-gray-100 p-5 hover:shadow-card-hover transition-all duration-300',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-2">{data.label}</p>
          <p className={cn('text-3xl font-bold', color.value)}>{data.value}</p>
          {data.trend !== undefined && (
            <div className="flex items-center mt-2 text-sm">
              {data.trend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-danger-500 mr-1" />
              )}
              <span
                className={cn(
                  'font-medium',
                  data.trend >= 0 ? 'text-success-600' : 'text-danger-600'
                )}
              >
                {data.trend >= 0 ? '+' : ''}
                {data.trend}%
              </span>
              {data.trendLabel && (
                <span className="text-gray-400 ml-1.5">{data.trendLabel}</span>
              )}
            </div>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            color.icon
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

interface StatsCardsProps {
  stats: StatsCardData[];
  className?: string;
}

export default function StatsCards({ stats, className }: StatsCardsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
        className
      )}
    >
      {stats.map((stat, index) => (
        <StatsCard key={index} data={stat} />
      ))}
    </div>
  );
}
