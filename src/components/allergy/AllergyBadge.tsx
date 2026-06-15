import type { AllergyType, AllergySeverity } from '@/types';
import { ALLERGY_META } from '@/types';

interface AllergyBadgeProps {
  type: AllergyType;
  severity?: AllergySeverity;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export default function AllergyBadge({ type, severity = 'severe', showIcon = true, size = 'md' }: AllergyBadgeProps) {
  const meta = ALLERGY_META[type];
  const isHighRisk = meta.highRisk || severity === 'severe';

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-xs';

  if (isHighRisk) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md font-semibold text-white bg-danger-500 ${sizeClasses} animate-pulse-soft`}
      >
        {showIcon && <span>{meta.icon}</span>}
        <span>{meta.name}</span>
        {severity === 'severe' && <span className="opacity-75">·严重</span>}
      </span>
    );
  }

  const severityColors: Record<AllergySeverity, string> = {
    mild: 'bg-info-100 text-info-700',
    moderate: 'bg-warning-100 text-warning-700',
    severe: 'bg-danger-100 text-danger-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium ${severityColors[severity]} ${sizeClasses}`}
    >
      {showIcon && <span>{meta.icon}</span>}
      <span>{meta.name}</span>
      <span className="opacity-75">
        ·{severity === 'mild' ? '轻度' : '中度'}
      </span>
    </span>
  );
}
