import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface AlertProps {
  type?: 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export function Alert({ type = 'info', title, message, onClose, className }: AlertProps) {
  const config = {
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-500',
      titleColor: 'text-red-800',
      textColor: 'text-red-700',
    },
    warning: {
      bg: 'bg-warm-50 border-warm-200',
      icon: AlertTriangle,
      iconColor: 'text-warm-500',
      titleColor: 'text-warm-800',
      textColor: 'text-warm-700',
    },
    info: {
      bg: 'bg-forest-50 border-forest-200',
      icon: Info,
      iconColor: 'text-forest-500',
      titleColor: 'text-forest-800',
      textColor: 'text-forest-700',
    },
  }[type];

  const Icon = config.icon;

  return (
    <div className={cn('rounded-xl border p-4 flex items-start gap-3', config.bg, className)}>
      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconColor)} />
      <div className="flex-1 min-w-0">
        {title && <p className={cn('font-semibold text-sm', config.titleColor)}>{title}</p>}
        <p className={cn('text-sm', config.textColor)}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={cn('p-1 rounded-lg hover:bg-white/50 transition-colors', config.iconColor)}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
