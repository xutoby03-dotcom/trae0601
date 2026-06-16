import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

type AlertType = 'warning' | 'error' | 'success' | 'info';

interface AlertBannerProps {
  type?: AlertType;
  title: string;
  description?: string;
  onClose?: () => void;
  onClick?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const alertStyles: Record<AlertType, { bg: string; border: string; icon: string; text: string }> = {
  warning: {
    bg: 'bg-accent-yellow/10',
    border: 'border-accent-yellow/30',
    icon: 'text-accent-yellow',
    text: 'text-amber-800',
  },
  error: {
    bg: 'bg-accent-coral/10',
    border: 'border-accent-coral/30',
    icon: 'text-accent-coral',
    text: 'text-red-800',
  },
  success: {
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    icon: 'text-primary',
    text: 'text-green-800',
  },
  info: {
    bg: 'bg-accent-sky/10',
    border: 'border-accent-sky/30',
    icon: 'text-accent-sky',
    text: 'text-cyan-800',
  },
};

const alertIcons: Record<AlertType, React.FC<{ className?: string; size?: number | string }>> = {
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
  info: Info,
};

const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'info',
  title,
  description,
  onClose,
  onClick,
  action,
  className,
}) => {
  const styles = alertStyles[type];
  const Icon = alertIcons[type];
  
  return (
    <div
      className={cn(
        'relative p-4 rounded-2xl border-2 transition-all duration-300',
        styles.bg,
        styles.border,
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('flex-shrink-0 mt-0.5 animate-pulse-slow', styles.icon)} size={20} />
        <div className="flex-1 min-w-0">
          <h4 className={cn('font-bold', styles.text)}>{title}</h4>
          {description && (
            <p className={cn('text-sm mt-1 opacity-80', styles.text)}>{description}</p>
          )}
          {action && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
              className={cn(
                'mt-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                'bg-white/50 hover:bg-white/80',
                styles.text
              )}
            >
              {action.label}
            </button>
          )}
        </div>
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={cn('flex-shrink-0 p-1 rounded-full hover:bg-white/30 transition-colors', styles.text)}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertBanner;
