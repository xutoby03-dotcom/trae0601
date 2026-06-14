import { BoxStatus } from '../../types';
import { getStatusColor, getStatusText } from '../../utils/alerts';

interface StatusBadgeProps {
  status: BoxStatus;
  size?: 'sm' | 'md';
}

const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const color = getStatusColor(status);
  const text = getStatusText(status);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses}`}
      style={{ backgroundColor: `${color}25`, color }}
    >
      <span
        className={`rounded-full ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${
          status === 'upcoming' || status === 'overdue' || status === 'full_change_due'
            ? 'animate-pulse'
            : ''
        }`}
        style={{ backgroundColor: color }}
      />
      {text}
    </span>
  );
};

export default StatusBadge;
