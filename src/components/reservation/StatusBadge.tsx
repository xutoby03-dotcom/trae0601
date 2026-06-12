import { ReservationStatus } from '@/types';
import { getStatusText } from '@/utils/date';

interface StatusBadgeProps {
  status: ReservationStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles: Record<ReservationStatus, string> = {
    pending: 'bg-blue-50 text-blue-600 border-blue-200',
    to_confirm: 'bg-amber-50 text-amber-600 border-amber-200',
    completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-600 border-rose-200',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${statusStyles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'pending' ? 'bg-blue-500' :
        status === 'to_confirm' ? 'bg-amber-500' :
        status === 'completed' ? 'bg-emerald-500' :
        'bg-rose-500'
      }`} />
      {getStatusText(status)}
    </span>
  );
}
