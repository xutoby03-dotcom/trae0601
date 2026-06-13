import { AlertTriangle, Minus, Shield } from 'lucide-react';
import type { Importance } from '@/types';

interface Props {
  importance: Importance;
  size?: 'sm' | 'md';
}

const config = {
  high: { className: 'tag-high', label: '重要', Icon: Shield },
  medium: { className: 'tag-medium', label: '一般', Icon: Minus },
  low: { className: 'tag-low', label: '可选', Icon: AlertTriangle },
};

export default function ImportanceTag({ importance, size = 'sm' }: Props) {
  const { className, label, Icon } = config[importance];
  const iconSize = size === 'sm' ? 12 : 14;
  return (
    <span className={className}>
      <Icon size={iconSize} />
      {label}
    </span>
  );
}
