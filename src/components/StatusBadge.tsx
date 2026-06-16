import { cn } from '@/lib/utils';
import { statusLabels, lossStatusLabels, lossTypeLabels } from '@/utils/mockData';

type StatusType = 'freezer' | 'loss' | 'lossType';

interface StatusBadgeProps {
  type: StatusType;
  status: string;
  className?: string;
}

export default function StatusBadge({ type, status, className }: StatusBadgeProps) {
  const getStyles = () => {
    if (type === 'freezer') {
      switch (status) {
        case 'normal':
          return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'warning':
          return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'abnormal':
          return 'bg-red-100 text-red-700 border-red-200';
        default:
          return 'bg-slate-100 text-slate-700 border-slate-200';
      }
    }

    if (type === 'loss') {
      switch (status) {
        case 'pending':
          return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'approved':
          return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'rejected':
          return 'bg-red-100 text-red-700 border-red-200';
        default:
          return 'bg-slate-100 text-slate-700 border-slate-200';
      }
    }

    if (type === 'lossType') {
      switch (status) {
        case 'loss':
          return 'bg-red-100 text-red-700 border-red-200';
        case 'isolate':
          return 'bg-sky-100 text-sky-700 border-sky-200';
        default:
          return 'bg-slate-100 text-slate-700 border-slate-200';
      }
    }

    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getLabel = () => {
    if (type === 'freezer') return statusLabels[status as keyof typeof statusLabels] || status;
    if (type === 'loss') return lossStatusLabels[status as keyof typeof lossStatusLabels] || status;
    if (type === 'lossType') return lossTypeLabels[status as keyof typeof lossTypeLabels] || status;
    return status;
  };

  const getDotColor = () => {
    if (type === 'freezer') {
      switch (status) {
        case 'normal':
          return 'bg-emerald-500';
        case 'warning':
          return 'bg-amber-500';
        case 'abnormal':
          return 'bg-red-500';
        default:
          return 'bg-slate-500';
      }
    }

    if (type === 'loss') {
      switch (status) {
        case 'pending':
          return 'bg-amber-500';
        case 'approved':
          return 'bg-emerald-500';
        case 'rejected':
          return 'bg-red-500';
        default:
          return 'bg-slate-500';
      }
    }

    return 'bg-slate-500';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        getStyles(),
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', getDotColor())} />
      {getLabel()}
    </span>
  );
}
