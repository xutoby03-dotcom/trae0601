import { AlertTriangle, AlertCircle } from 'lucide-react';
import type { RiskType } from '@/types';
import { RISK_LABELS } from '@/utils/constants';

interface RiskBadgeProps {
  type: RiskType;
  compact?: boolean;
}

export default function RiskBadge({ type, compact = false }: RiskBadgeProps) {
  const label = RISK_LABELS[type];
  const isDanger = label.level === 'danger';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium animate-pulse-risk ${
        isDanger
          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
      }`}
    >
      {isDanger ? (
        <AlertCircle className="h-3 w-3" />
      ) : (
        <AlertTriangle className="h-3 w-3" />
      )}
      {!compact && <span>{label.label}</span>}
      {compact && <span>{label.emoji}</span>}
    </div>
  );
}
