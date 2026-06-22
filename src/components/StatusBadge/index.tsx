import { Bug, Scroll, Palette, Tag } from 'lucide-react';
import type { AlertType } from '@/types/specimen';

const alertConfig: Record<AlertType, { label: string; icon: typeof Bug; severity: 'warning' | 'danger' }> = {
  mold: { label: '发霉', icon: Bug, severity: 'danger' },
  edgeRoll: { label: '卷边', icon: Scroll, severity: 'warning' },
  colorFade: { label: '褪色', icon: Palette, severity: 'warning' },
  missingLabel: { label: '标签缺项', icon: Tag, severity: 'warning' },
};

interface StatusBadgeProps {
  type: AlertType;
}

export default function StatusBadge({ type }: StatusBadgeProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  const colorClasses =
    config.severity === 'danger'
      ? 'bg-red-50 text-warning-danger border-red-200'
      : 'bg-amber-50 text-warning-orange border-amber-200';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${colorClasses} ${
        config.severity === 'danger' ? 'animate-pulse-slow' : ''
      }`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
