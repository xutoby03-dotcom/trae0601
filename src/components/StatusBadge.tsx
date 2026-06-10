import type { FaultStatus } from '@/shared/types';
import { STATUS_CONFIG } from '@/shared/constants';
import { AlertTriangle, Wrench, PackageCheck, CheckCircle2, RefreshCcw } from 'lucide-react';

interface Props {
  status: FaultStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

const ICONS: Record<FaultStatus, typeof AlertTriangle> = {
  urgent: AlertTriangle,
  processing: Wrench,
  waiting_parts: PackageCheck,
  recovered: CheckCircle2,
  repeated: RefreshCcw,
};

export default function StatusBadge({ status, size = 'md', showIcon = true }: Props) {
  const cfg = STATUS_CONFIG[status];
  const Icon = ICONS[status];
  const isUrgentPulse = status === 'urgent';
  const px = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium text-xs ${px} ${cfg.bg} ${cfg.color} border ${cfg.border} ${isUrgentPulse ? 'animate-pulse-slow' : ''}`}
    >
      {showIcon && <Icon size={iconSize} />}
      {cfg.label}
    </span>
  );
}
