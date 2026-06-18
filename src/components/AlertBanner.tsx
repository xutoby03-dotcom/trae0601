import { AlertTriangle, X, BatteryLow, Wrench, Scale } from 'lucide-react';
import type { Alert } from '../types';
import { alertTypeLabels } from '../types';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';

const severityStyles = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

const iconMap = {
  cuff: Scale,
  calibration: Wrench,
  battery: BatteryLow,
  'abnormal-reading': AlertTriangle,
};

export default function AlertBanner() {
  const { alerts, dismissAlert } = useAppStore();

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} onDismiss={() => dismissAlert(alert.id)} />
      ))}
    </div>
  );
}

function AlertCard({ alert, onDismiss }: { alert: Alert; onDismiss: () => void }) {
  const Icon = iconMap[alert.type];
  
  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 animate-in slide-in-from-top-4 fade-in',
        severityStyles[alert.severity]
      )}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{alertTypeLabels[alert.type]}</span>
          {alert.severity === 'error' && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              紧急
            </span>
          )}
        </div>
        <p className="text-sm leading-relaxed">{alert.message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
        aria-label="关闭提醒"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
