import { AlertTriangle, Droplets, Wind, FlaskConical, Check } from 'lucide-react';
import { WaterQualityAlert } from '../types';
import { useStore } from '../store/useStore';
import { getAlertTypeLabel, getSeverityLabel, getSeverityColor } from '../utils/calculations';
import { formatDateCN } from '../utils/date';
import { cn } from '../lib/utils';

interface AlertItemProps {
  alert: WaterQualityAlert;
  showResolve?: boolean;
  className?: string;
}

function getAlertIcon(type: string) {
  switch (type) {
    case 'slow_flow':
      return Droplets;
    case 'odor':
      return Wind;
    case 'chlorine_test':
      return FlaskConical;
    default:
      return AlertTriangle;
  }
}

export function AlertItem({ alert, showResolve = true, className }: AlertItemProps) {
  const resolveAlert = useStore((state) => state.resolveAlert);
  const pitchers = useStore((state) => state.pitchers);
  const pitcher = pitchers.find((p) => p.id === alert.pitcherId);
  const Icon = getAlertIcon(alert.type);

  const handleResolve = (e: React.MouseEvent) => {
    e.stopPropagation();
    resolveAlert(alert.id);
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-xl transition-all',
        alert.resolved
          ? 'bg-gray-50 opacity-60'
          : 'bg-white hover:bg-gray-50 border border-gray-100',
        className
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          alert.resolved ? 'bg-gray-100 text-gray-400' : getSeverityColor(alert.severity)
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 text-sm">
            {getAlertTypeLabel(alert.type)}
          </span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              alert.resolved ? 'bg-gray-100 text-gray-500' : getSeverityColor(alert.severity)
            )}
          >
            {alert.resolved ? '已解决' : getSeverityLabel(alert.severity)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{alert.description}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <span>{pitcher?.name}</span>
          <span>·</span>
          <span>{formatDateCN(alert.date)}</span>
        </div>
      </div>

      {showResolve && !alert.resolved && (
        <button
          onClick={handleResolve}
          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors flex-shrink-0"
          title="标记为已解决"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
