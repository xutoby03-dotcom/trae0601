import { cn } from '@/lib/utils';
import { DeviceStatus, BorrowStatus, AppearanceCheck } from '@/types';

interface StatusBadgeProps {
  status: DeviceStatus | BorrowStatus | AppearanceCheck;
  type?: 'device' | 'borrow' | 'appearance';
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { label: string; className: string; dotClass: string }> = {
  'available': { 
    label: '可用', 
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500'
  },
  'borrowed': { 
    label: '借出中', 
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    dotClass: 'bg-blue-500'
  },
  'faulty': { 
    label: '故障', 
    className: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500'
  },
  'maintenance': { 
    label: '维修中', 
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500'
  },
  'pending': { 
    label: '待使用', 
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    dotClass: 'bg-purple-500'
  },
  'returned': { 
    label: '已归还', 
    className: 'bg-slate-50 text-slate-600 border-slate-200',
    dotClass: 'bg-slate-400'
  },
  'overdue': { 
    label: '逾期', 
    className: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500'
  },
  'cancelled': { 
    label: '已取消', 
    className: 'bg-slate-50 text-slate-500 border-slate-200',
    dotClass: 'bg-slate-300'
  },
  'good': { 
    label: '良好', 
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500'
  },
  'minor-damage': { 
    label: '轻微损坏', 
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dotClass: 'bg-amber-500'
  },
  'damaged': { 
    label: '损坏', 
    className: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500'
  },
};

const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-slate-50 text-slate-600 border-slate-200',
    dotClass: 'bg-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        config.className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
