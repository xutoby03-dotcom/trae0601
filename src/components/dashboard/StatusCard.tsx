import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { AlertTriangle, Sun, CheckCircle, Clock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ACWithStatus } from '@/types';
import { STATUS_LABELS } from '@/types';

interface StatusCardProps {
  ac: ACWithStatus;
  index: number;
}

const statusConfig = {
  overdue: {
    bg: 'bg-gradient-to-br from-red-50 to-red-100',
    border: 'border-red-200',
    badge: 'bg-red-500 text-white',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    pulse: true,
  },
  drying: {
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
    border: 'border-amber-200',
    badge: 'bg-amber-500 text-white',
    icon: Sun,
    iconColor: 'text-amber-500',
    pulse: false,
  },
  pending: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    border: 'border-blue-200',
    badge: 'bg-blue-500 text-white',
    icon: Clock,
    iconColor: 'text-blue-500',
    pulse: false,
  },
  completed: {
    bg: 'bg-gradient-to-br from-green-50 to-green-100',
    border: 'border-green-200',
    badge: 'bg-green-500 text-white',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    pulse: false,
  },
};

export function StatusCard({ ac, index }: StatusCardProps) {
  const config = statusConfig[ac.status];
  const StatusIcon = config.icon;

  const getStatusText = () => {
    if (ac.status === 'overdue') {
      return `已超期 ${ac.daysSinceLastClean - ac.cleaningCycle} 天`;
    }
    if (ac.status === 'drying') {
      return '正在晾干中';
    }
    if (ac.status === 'completed') {
      return `距下次清洗还有 ${ac.cleaningCycle - ac.daysSinceLastClean} 天`;
    }
    return `距上次清洗 ${ac.daysSinceLastClean} 天`;
  };

  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-5 transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        'animate-slide-up',
        config.bg,
        config.border,
        config.pulse && 'animate-pulse-slow'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              'bg-white shadow-md'
            )}
          >
            <StatusIcon className={cn('w-6 h-6', config.iconColor)} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{ac.room}</h3>
            <p className="text-sm text-gray-500">
              {ac.brand} {ac.model}
            </p>
          </div>
        </div>
        <span
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',
            config.badge
          )}
        >
          {STATUS_LABELS[ac.status]}
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
          {getStatusText()}
        </p>
        {ac.lastCleanDate && (
          <p className="text-xs text-gray-500">
            上次清洗：{format(parseISO(ac.lastCleanDate), 'yyyy年MM月dd日', { locale: zhCN })}
          </p>
        )}
        <p className="text-xs text-gray-500">
          下次清洗：{format(parseISO(ac.nextCleanDate), 'yyyy年MM月dd日', { locale: zhCN })}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        {(ac.status === 'overdue' || ac.status === 'pending') && (
          <Link
            to={`/cleaning-records/new/${ac.id}`}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white text-sm py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            开始清洗
          </Link>
        )}
        {ac.status === 'drying' && ac.latestRecord && (
          <Link
            to={`/cleaning-records/new/${ac.id}`}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Sun className="w-4 h-4" />
            更新状态
          </Link>
        )}
        {ac.status === 'completed' && (
          <Link
            to={`/air-conditioners/${ac.id}`}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            查看详情
          </Link>
        )}
      </div>
    </div>
  );
}
