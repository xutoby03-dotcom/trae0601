import { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-rose-50 border-rose-200 text-rose-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-sky-50 border-sky-200 text-sky-800',
};

interface Props {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export function useAutoRemove(toasts: ToastItem[], onRemove: (id: string) => void, duration = 3500) {
  useEffect(() => {
    toasts.forEach(t => {
      const timer = setTimeout(() => onRemove(t.id), duration);
      return () => clearTimeout(timer);
    });
  }, [toasts, onRemove, duration]);
}

export default function ToastContainer({ toasts, onRemove }: Props) {
  useAutoRemove(toasts, onRemove);
  return (
    <div className="fixed top-5 right-5 z-[100] space-y-2">
      {toasts.map(t => {
        const Icon = iconMap[t.type];
        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-card animate-in slide-in-from-right ${colorMap[t.type]}`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{t.message}</span>
            <button
              onClick={() => onRemove(t.id)}
              className="ml-2 p-0.5 rounded hover:bg-white/50 text-current opacity-60 hover:opacity-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
