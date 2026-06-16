import { cn } from '@/utils/cn';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore } from './useToast';

const variantConfig = {
  success: {
    bg: 'bg-success border-success/20',
    text: 'text-white',
    icon: CheckCircle,
  },
  error: {
    bg: 'bg-danger border-danger/20',
    text: 'text-white',
    icon: XCircle,
  },
  warning: {
    bg: 'bg-warning border-warning/20',
    text: 'text-white',
    icon: AlertTriangle,
  },
  info: {
    bg: 'bg-info border-info/20',
    text: 'text-white',
    icon: Info,
  },
};

export default function Toast() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const config = variantConfig[toast.variant];
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className={cn(
              'flex min-w-[280px] items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-slide-down',
              config.bg,
              config.text,
            )}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="rounded p-0.5 transition-colors hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
