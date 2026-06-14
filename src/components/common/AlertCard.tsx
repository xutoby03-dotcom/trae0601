import { AlertCircle, Bell, Trash2, Sparkles } from 'lucide-react';
import { Alert } from '../../types';
import { cn } from '../../lib/utils';

const alertIcons = {
  overdue_clean: Trash2,
  full_change_due: Sparkles,
  high_smell_chain: AlertCircle,
  deep_clean_needed: Sparkles,
};

const severityStyles = {
  danger: {
    bg: 'bg-[#FCE4DC]',
    border: 'border-[#D4896A]',
    text: 'text-[#8B4A2A]',
    icon: 'text-[#D4896A]',
  },
  warning: {
    bg: 'bg-[#FBF0D6]',
    border: 'border-[#E8C77A]',
    text: 'text-[#8B6B1A]',
    icon: 'text-[#C9A54A]',
  },
  info: {
    bg: 'bg-[#E0ECEF]',
    border: 'border-[#A4B8C4]',
    text: 'text-[#4A6B7A]',
    icon: 'text-[#8BA4B8]',
  },
};

interface AlertCardProps {
  alert: Alert;
  onAction?: (litterBoxId: string) => void;
}

const AlertCard = ({ alert, onAction }: AlertCardProps) => {
  const Icon = alertIcons[alert.type] || Bell;
  const styles = severityStyles[alert.severity];

  return (
    <div
      className={cn(
        'rounded-2xl border-l-4 p-4 transition-all duration-300 hover:shadow-md cursor-pointer',
        styles.bg,
        styles.border
      )}
      onClick={() => onAction?.(alert.litterBoxId)}
      style={
        alert.severity === 'danger'
          ? { animation: 'pulse 2s ease-in-out infinite' }
          : undefined
      }
    >
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5 p-1.5 rounded-xl bg-white/60', styles.icon)}>
          <Icon size={18} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium leading-relaxed', styles.text)}>
            {alert.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
