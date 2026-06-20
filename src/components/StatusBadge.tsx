import { cn } from '@/lib/utils';
import type { InspectionStatus, ClassroomStatus, RepairStatus } from '@/types';
import { STATUS_LABELS, CLASSROOM_STATUS_LABELS, REPAIR_STATUS_LABELS } from '@/types';

type StatusType = 'inspection' | 'classroom' | 'repair';

interface StatusBadgeProps {
  status: string;
  type: StatusType;
  size?: 'sm' | 'md';
  className?: string;
}

const statusColorMap: Record<string, string> = {
  normal: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100',
  critical: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100',
  suspended: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100',
  maintenance: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100',
  pending: 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-100',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-100',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
  recheck_failed: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100',
};

const statusDotMap: Record<string, string> = {
  normal: 'bg-emerald-500',
  warning: 'bg-amber-500',
  critical: 'bg-rose-500',
  suspended: 'bg-rose-500',
  maintenance: 'bg-amber-500',
  pending: 'bg-slate-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-emerald-500',
  recheck_failed: 'bg-rose-500',
};

function getLabel(status: string, type: StatusType): string {
  switch (type) {
    case 'inspection':
      return STATUS_LABELS[status as InspectionStatus] || status;
    case 'classroom':
      return CLASSROOM_STATUS_LABELS[status as ClassroomStatus] || status;
    case 'repair':
      return REPAIR_STATUS_LABELS[status as RepairStatus] || status;
    default:
      return status;
  }
}

export default function StatusBadge({
  status,
  type,
  size = 'md',
  className,
}: StatusBadgeProps) {
  const label = getLabel(status, type);
  const colorClass = statusColorMap[status] || statusColorMap.normal;
  const dotClass = statusDotMap[status] || statusDotMap.normal;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border rounded-full',
        'ring-1 ring-inset',
        colorClass,
        size === 'sm' ? 'px-2 py-0.5 text-xs font-medium' : 'px-2.5 py-1 text-xs font-medium',
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dotClass)}></span>
      {label}
    </span>
  );
}
