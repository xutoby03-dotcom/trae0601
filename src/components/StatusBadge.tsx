import { getRouteStatusLabel, getRouteStatusColor, getBookingStatusLabel, getBookingStatusColor } from '@/utils/helpers';

interface StatusBadgeProps {
  type: 'route' | 'booking';
  status: string;
}

export const StatusBadge = ({ type, status }: StatusBadgeProps) => {
  const label = type === 'route' ? getRouteStatusLabel(status) : getBookingStatusLabel(status);
  const colorClass = type === 'route' ? getRouteStatusColor(status) : getBookingStatusColor(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
};
