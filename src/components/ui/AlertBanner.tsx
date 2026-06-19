import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '../../utils/helpers';

type AlertType = 'warning' | 'success' | 'info' | 'error';

interface AlertBannerProps {
  type: AlertType;
  title: string;
  message?: string;
  className?: string;
}

const alertConfig = {
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-500',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: Info,
    iconColor: 'text-blue-500',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: XCircle,
    iconColor: 'text-red-500',
  },
};

export function AlertBanner({ type, title, message, className }: AlertBannerProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      'rounded-lg border p-4',
      config.bg,
      config.border,
      className
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconColor)} />
        <div>
          <h4 className={cn('font-medium', config.text)}>{title}</h4>
          {message && <p className={cn('text-sm mt-1', config.text, 'opacity-80')}>{message}</p>}
        </div>
      </div>
    </div>
  );
}
