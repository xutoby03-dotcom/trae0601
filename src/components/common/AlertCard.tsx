import { Clock, AlertTriangle, Package, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Alert } from '@/types';
import { ALERT_TYPE_LABELS } from '@/types';
import { formatDateTime } from '@/utils/dateUtils';
import { useAppStore } from '@/store/useAppStore';

interface AlertCardProps {
  alert: Alert;
}

const alertIcons = {
  overdue: Clock,
  damaged: AlertTriangle,
  low_stock: Package,
};

const alertColors = {
  warning: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
  danger: 'bg-red-50 border-red-200 hover:bg-red-100',
};

const accentColors = {
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

export const AlertCard = ({ alert }: AlertCardProps) => {
  const { markAlertRead } = useAppStore();
  const Icon = alertIcons[alert.type];

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAlertRead(alert.id);
  };

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 cursor-pointer group',
        alertColors[alert.level],
        alert.isRead && 'opacity-60'
      )}
    >
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', accentColors[alert.level])}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-900">
            {ALERT_TYPE_LABELS[alert.type]}
          </span>
          {!alert.isRead && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">{alert.message}</p>
        <p className="text-xs text-gray-500 mt-2">
          {formatDateTime(alert.createdAt)}
        </p>
      </div>

      {!alert.isRead && (
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/50"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );
};
