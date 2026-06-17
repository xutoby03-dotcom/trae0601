import {
  CircleDot,
  Scissors,
  Ruler,
  Link,
  Sparkles,
} from 'lucide-react';
import { ProcessType, PROCESS_LABELS } from '@/types';

interface ProcessIconProps {
  type: ProcessType;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ProcessIcon = ({ type, showLabel = false, size = 'md' }: ProcessIconProps) => {
  const iconConfig = {
    sew_button: { icon: CircleDot, color: 'text-primary-500', bg: 'bg-primary-100' },
    patch_hole: { icon: CircleDot, color: 'text-warning-500', bg: 'bg-warning-100' },
    alter_length: { icon: Ruler, color: 'text-success-500', bg: 'bg-success-100' },
    replace_zipper: { icon: Link, color: 'text-blue-500', bg: 'bg-blue-100' },
    iron: { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-100' },
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const config = iconConfig[type];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} ${config.bg} rounded-xl flex items-center justify-center`}
      >
        <Icon className={`${iconSizeClasses[size]} ${config.color}`} />
      </div>
      {showLabel && (
        <span className="font-medium text-brown-700">{PROCESS_LABELS[type]}</span>
      )}
    </div>
  );
};

export default ProcessIcon;
