import { Droplets, AlertTriangle, Sparkles } from 'lucide-react';
import { DeepCleanItem } from '../../utils/stats';
import { cn } from '../../lib/utils';

interface DeepCleanBadgeProps {
  status: DeepCleanItem | null;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

const priorityConfig = {
  high: {
    label: '急需深洗',
    bg: 'bg-[#FCE4DC]',
    text: 'text-[#B84A2A]',
    border: 'border-[#D4896A]',
    icon: 'text-[#D4896A]',
    pulse: true,
  },
  medium: {
    label: '建议深洗',
    bg: 'bg-[#FBF0D6]',
    text: 'text-[#8B6B1A]',
    border: 'border-[#E8C77A]',
    icon: 'text-[#C9A54A]',
    pulse: false,
  },
  low: {
    label: '即将到期',
    bg: 'bg-[#F0F0E8]',
    text: 'text-[#6B6B5A]',
    border: 'border-[#C4C4A8]',
    icon: 'text-[#8B8B6A]',
    pulse: false,
  },
};

const DeepCleanBadge = ({ status, size = 'sm', showIcon = true }: DeepCleanBadgeProps) => {
  if (!status) return null;

  const config = priorityConfig[status.priority];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-3 py-1.5 text-sm gap-2';

  const Icon = status.priority === 'high' ? AlertTriangle : status.priority === 'medium' ? Droplets : Sparkles;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-xl border font-medium',
        config.bg,
        config.text,
        config.border,
        sizeClasses,
        config.pulse ? 'animate-pulse' : ''
      )}
      title={status.reasons.join('；')}
    >
      {showIcon && <Icon size={size === 'sm' ? 12 : 16} strokeWidth={2} className={config.icon} />}
      <span>{config.label}</span>
    </span>
  );
};

export default DeepCleanBadge;
