import {
  DeviceStatus,
  DeviceStatusLabel,
  DeviceStatusColor,
  DisinfectionTaskStatus,
  DisinfectionTaskStatusLabel,
  UsageStatus,
  UsageStatusLabel,
  MaskType,
  MaskTypeLabel,
  InventoryItem,
} from '@shared/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  className?: string;
}

export function DeviceBadge({ status, className }: { status: DeviceStatus } & StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        DeviceStatusColor[status],
        className
      )}
    >
      <span className="mr-1 h-1.5 w-1.5 rounded-full current-opacity-70" style={{ backgroundColor: 'currentColor' }} />
      {DeviceStatusLabel[status]}
    </span>
  );
}

const DisinfectionStatusColor: Record<DisinfectionTaskStatus, string> = {
  [DisinfectionTaskStatus.PENDING]: 'bg-orange-100 text-orange-700 border-orange-200',
  [DisinfectionTaskStatus.IN_PROGRESS]: 'bg-teal-100 text-teal-700 border-teal-200',
  [DisinfectionTaskStatus.COMPLETED]: 'bg-green-100 text-green-700 border-green-200',
  [DisinfectionTaskStatus.OVERDUE]: 'bg-red-100 text-red-700 border-red-200',
};

export function DisinfectionBadge({
  status,
  className,
}: { status: DisinfectionTaskStatus } & StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        DisinfectionStatusColor[status],
        className
      )}
    >
      <span
        className={cn(
          'mr-1 h-1.5 w-1.5 rounded-full',
          status === DisinfectionTaskStatus.PENDING && 'bg-orange-500',
          status === DisinfectionTaskStatus.IN_PROGRESS && 'bg-teal-500',
          status === DisinfectionTaskStatus.COMPLETED && 'bg-green-500',
          status === DisinfectionTaskStatus.OVERDUE && 'bg-red-500 animate-pulse'
        )}
      />
      {DisinfectionTaskStatusLabel[status]}
    </span>
  );
}

const UsageStatusColor: Record<UsageStatus, string> = {
  [UsageStatus.ONGOING]: 'bg-blue-100 text-blue-700 border-blue-200',
  [UsageStatus.FINISHED]: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function UsageBadge({ status, className }: { status: UsageStatus } & StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        UsageStatusColor[status],
        className
      )}
    >
      <span
        className={cn(
          'mr-1 h-1.5 w-1.5 rounded-full',
          status === UsageStatus.ONGOING && 'bg-blue-500 animate-pulse',
          status === UsageStatus.FINISHED && 'bg-slate-400'
        )}
      />
      {UsageStatusLabel[status]}
    </span>
  );
}

const MaskTypeColor: Record<MaskType, string> = {
  [MaskType.ADULT]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  [MaskType.CHILD]: 'bg-purple-100 text-purple-700 border-purple-200',
  [MaskType.INFANT]: 'bg-pink-100 text-pink-700 border-pink-200',
};

export function MaskBadge({ type, className }: { type: MaskType } & StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        MaskTypeColor[type],
        className
      )}
    >
      {MaskTypeLabel[type]}
    </span>
  );
}

export function StockStatusBadge({ item, className }: { item: InventoryItem } & StatusBadgeProps) {
  const percent = (item.currentStock / item.safetyStock) * 100;
  let colorClass = '';
  let label = '';

  if (item.currentStock === 0) {
    colorClass = 'bg-red-600 text-white border-red-700';
    label = '断货';
  } else if (percent <= 30) {
    colorClass = 'bg-red-100 text-red-700 border-red-200';
    label = '不足';
  } else if (percent <= 80) {
    colorClass = 'bg-orange-100 text-orange-700 border-orange-200';
    label = '预警';
  } else {
    colorClass = 'bg-green-100 text-green-700 border-green-200';
    label = '充足';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        colorClass,
        className
      )}
    >
      {label}
    </span>
  );
}
