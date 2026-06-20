import type { OrderStatus, TempZone } from '@/types';
import { ORDER_STATUS_LABELS, TEMP_ZONE_LABELS } from '@/types';
import { classNames, getOrderStatusColor } from '@/utils/helpers';

interface StatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={classNames(
        'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border',
        getOrderStatusColor(status)
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

interface TempZoneBadgeProps {
  zone: TempZone;
}

const tempZoneStyles: Record<TempZone, string> = {
  frozen: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  refrigerated: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  normal: 'bg-stone-500/15 text-stone-400 border-stone-500/30',
};

export function TempZoneBadge({ zone }: TempZoneBadgeProps) {
  return (
    <span
      className={classNames(
        'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border',
        tempZoneStyles[zone]
      )}
    >
      {TEMP_ZONE_LABELS[zone]}
    </span>
  );
}

interface TempBadgeProps {
  temperature: number;
  isAbnormal?: boolean;
}

export function TempBadge({ temperature, isAbnormal }: TempBadgeProps) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border',
        isAbnormal
          ? 'bg-red-500/15 text-red-400 border-red-500/30'
          : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
      )}
    >
      {isAbnormal && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
      )}
      {temperature}°C
    </span>
  );
}
