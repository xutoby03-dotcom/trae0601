import { ComplianceStatus } from '../../../shared/types';
import { STATUS_EMOJI, STATUS_LABEL } from '../../utils/status';

interface StatusBadgeProps {
  status: ComplianceStatus;
  size?: 'sm' | 'md';
}

const base =
  'inline-flex items-center gap-1 rounded-full font-medium transition-all';

const config: Record<ComplianceStatus, { cls: string; pulse?: boolean }> = {
  compliant: {
    cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  },
  expiring: {
    cls: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  },
  expired: {
    cls: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    pulse: true,
  },
  unvaccinated: {
    cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-300',
  },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { cls, pulse } = config[status];
  const sizeCls = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  return (
    <span
      className={`${base} ${sizeCls} ${cls} ${pulse ? 'animate-pulse-badge' : ''}`}
    >
      <span aria-hidden>{STATUS_EMOJI[status]}</span>
      <span>{STATUS_LABEL[status]}</span>
    </span>
  );
}
