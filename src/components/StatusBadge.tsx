import { PermitStatus } from '@/types';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: PermitStatus;
}

const statusConfig: Record<PermitStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
  approved: {
    label: '已批准',
    icon: CheckCircle,
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  pending: {
    label: '待审批',
    icon: Clock,
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  denied: {
    label: '已拒绝',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 border-red-200',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${config.className}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}
